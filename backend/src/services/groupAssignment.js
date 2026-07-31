// Core Group Assignment Service — MySQL Edition
// Uses SELECT ... FOR UPDATE on group_counters to prevent race conditions.
const { getPool, syncGroupCounters } = require('./database');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateTotalGroups(totalStudents, studentsPerGroup) {
  return Math.ceil(totalStudents / studentsPerGroup);
}

function parseDepartments(deptString) {
  return (deptString || 'BCA,B.Tech')
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
}

function formatDepartments(deptArray) {
  return deptArray.join(',');
}

// ─── Settings ─────────────────────────────────────────────────────────────────

async function getSettings() {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM settings WHERE id = 1');
  if (!rows.length) {
    return {
      eventName: 'Freshers Orientation 2026',
      collegeName: 'Your College',
      totalStudents: 80,
      studentsPerGroup: 5,
      totalGroups: 16,
      registrationOpen: true,
      departments: ['BCA', 'B.Tech'],
    };
  }

  const s = rows[0];
  return {
    eventName:       s.event_name,
    collegeName:     s.college_name,
    totalStudents:   s.total_students,
    studentsPerGroup: s.students_per_group,
    totalGroups:     s.total_groups,
    registrationOpen: !!s.registration_open,
    departments:     parseDepartments(s.departments),
  };
}

async function updateSettings(data) {
  const pool = getPool();
  const {
    eventName, collegeName, totalStudents, studentsPerGroup,
    registrationOpen, departments,
  } = data;

  const totalGroups = calculateTotalGroups(totalStudents, studentsPerGroup);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `UPDATE settings SET
         event_name = ?, college_name = ?, total_students = ?,
         students_per_group = ?, total_groups = ?, registration_open = ?,
         departments = ?, updated_at = NOW()
       WHERE id = 1`,
      [
        eventName, collegeName, totalStudents,
        studentsPerGroup, totalGroups, registrationOpen ? 1 : 0,
        formatDepartments(departments),
      ]
    );

    // Sync group counters to match new settings
    await syncGroupCounters(conn);

    await conn.commit();
    return { ...data, totalGroups };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ─── Group Assignment (Core Algorithm) ───────────────────────────────────────

/**
 * Assigns a group to a student using a MySQL transaction with FOR UPDATE locks.
 *
 * Safety guarantees:
 * - Duplicate mobile → returns existing group (no new row created)
 * - No group exceeds max_capacity (enforced by FOR UPDATE lock on group_counters)
 * - Concurrent registrations serialize on the group_counters lock
 */
async function assignGroup({ name, department, mobile }) {
  const pool = getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ── 1. Check duplicate ────────────────────────────────────────────────
    const [existing] = await conn.execute(
      'SELECT group_number FROM students WHERE mobile = ?',
      [mobile]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return { alreadyRegistered: true, groupNumber: existing[0].group_number };
    }

    // ── 2. Read settings ──────────────────────────────────────────────────
    const [settingsRows] = await conn.execute(
      'SELECT registration_open, total_students FROM settings WHERE id = 1'
    );
    const settings = settingsRows[0];

    if (!settings || !settings.registration_open) {
      await conn.rollback();
      throw new Error('REGISTRATION_CLOSED');
    }

    // ── 3. Lock group_counters — prevents concurrent over-assignment ──────
    const [available] = await conn.execute(
      'SELECT group_number, student_count, max_capacity FROM group_counters WHERE student_count < max_capacity FOR UPDATE'
    );

    if (!available.length) {
      await conn.rollback();
      throw new Error('REGISTRATION_FULL');
    }

    // ── 4. Check total student cap ────────────────────────────────────────
    const [totalRow] = await conn.execute(
      'SELECT COUNT(*) AS cnt FROM students'
    );
    if (totalRow[0].cnt >= settings.total_students) {
      await conn.rollback();
      throw new Error('REGISTRATION_FULL');
    }

    // ── 5. Randomly pick from available groups ────────────────────────────
    const chosen = available[Math.floor(Math.random() * available.length)];
    const groupNumber = chosen.group_number;

    // ── 6. Insert student ─────────────────────────────────────────────────
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];                // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0];               // HH:MM:SS

    await conn.execute(
      `INSERT INTO students (name, department, mobile, group_number, registered_date, registered_time, registered_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [name.trim(), department, mobile, groupNumber, dateStr, timeStr]
    );

    // ── 7. Increment group counter ────────────────────────────────────────
    await conn.execute(
      'UPDATE group_counters SET student_count = student_count + 1 WHERE group_number = ?',
      [groupNumber]
    );

    await conn.commit();
    return { alreadyRegistered: false, groupNumber };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ─── Student CRUD ─────────────────────────────────────────────────────────────

async function getAllStudents() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, name, department, mobile, group_number AS groupNumber,
            registered_date AS registeredDate,
            registered_time AS registeredTime,
            registered_at   AS registeredAt
     FROM students
     ORDER BY registered_at ASC`
  );
  return rows.map((r) => ({
    ...r,
    registeredAt: r.registeredAt ? new Date(r.registeredAt).toISOString() : null,
  }));
}

async function updateStudent(mobile, updates) {
  const pool = getPool();
  const allowed = ['name', 'department'];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }

  if (!fields.length) return;
  values.push(mobile);
  await pool.execute(`UPDATE students SET ${fields.join(', ')} WHERE mobile = ?`, values);
}

async function deleteStudent(mobile) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      'SELECT group_number FROM students WHERE mobile = ?',
      [mobile]
    );
    if (!rows.length) throw new Error('Student not found');

    const groupNumber = rows[0].group_number;

    await conn.execute('DELETE FROM students WHERE mobile = ?', [mobile]);
    await conn.execute(
      'UPDATE group_counters SET student_count = GREATEST(0, student_count - 1) WHERE group_number = ?',
      [groupNumber]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function moveStudent(mobile, newGroupNumber) {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(
      'SELECT group_number FROM students WHERE mobile = ?',
      [mobile]
    );
    if (!rows.length) throw new Error('Student not found');

    const oldGroup = rows[0].group_number;

    await conn.execute(
      'UPDATE students SET group_number = ? WHERE mobile = ?',
      [newGroupNumber, mobile]
    );
    await conn.execute(
      'UPDATE group_counters SET student_count = GREATEST(0, student_count - 1) WHERE group_number = ?',
      [oldGroup]
    );
    await conn.execute(
      'UPDATE group_counters SET student_count = student_count + 1 WHERE group_number = ?',
      [newGroupNumber]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function resetEvent() {
  const pool = getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM students');
    await conn.execute('UPDATE group_counters SET student_count = 0');
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getGroupCounters() {
  const pool = getPool();
  const [rows] = await pool.execute(
    'SELECT group_number, student_count, max_capacity FROM group_counters ORDER BY group_number'
  );
  const map = {};
  rows.forEach((r) => {
    map[`group_${r.group_number}`] = {
      count: r.student_count,
      max: r.max_capacity,
    };
  });
  return map;
}

module.exports = {
  getSettings,
  updateSettings,
  calculateTotalGroups,
  assignGroup,
  getAllStudents,
  updateStudent,
  deleteStudent,
  moveStudent,
  resetEvent,
  getGroupCounters,
};
