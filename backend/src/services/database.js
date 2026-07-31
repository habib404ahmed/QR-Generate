// MySQL Database Service
// Auto-creates the database and all tables on first run.
// Compatible with MySQL 5.5+
const mysql = require('mysql2/promise');

let pool = null;

// ─── Schema ──────────────────────────────────────────────────────────────────

const CREATE_STUDENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    department  VARCHAR(100)   NOT NULL,
    mobile      CHAR(10)       NOT NULL,
    group_number INT           NOT NULL,
    registered_date DATE       NOT NULL,
    registered_time TIME       NOT NULL,
    registered_at   DATETIME   DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_mobile (mobile),
    INDEX idx_group  (group_number),
    INDEX idx_dept   (department)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    id                INT         PRIMARY KEY DEFAULT 1,
    event_name        VARCHAR(255) NOT NULL DEFAULT 'Freshers Orientation 2026',
    college_name      VARCHAR(255) NOT NULL DEFAULT 'Your College',
    total_students    INT         NOT NULL DEFAULT 80,
    students_per_group INT        NOT NULL DEFAULT 5,
    total_groups      INT         NOT NULL DEFAULT 16,
    registration_open TINYINT(1)  NOT NULL DEFAULT 1,
    departments       TEXT        NOT NULL,
    updated_at        DATETIME    DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

const CREATE_GROUP_COUNTERS_TABLE = `
  CREATE TABLE IF NOT EXISTS group_counters (
    group_number  INT  PRIMARY KEY,
    student_count INT  NOT NULL DEFAULT 0,
    max_capacity  INT  NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
`;

// ─── Default Settings Row ─────────────────────────────────────────────────────

const INSERT_DEFAULT_SETTINGS = `
  INSERT IGNORE INTO settings
    (id, event_name, college_name, total_students, students_per_group,
     total_groups, registration_open, departments)
  VALUES (1, 'Freshers Orientation 2026', 'Your College',
          80, 5, 16, 1, 'BCA,B.Tech');
`;

// ─── Initialize ───────────────────────────────────────────────────────────────

/**
 * Create pool, auto-create DB, create tables, seed defaults.
 * Called once on server startup.
 */
async function initializeDatabase() {
  const host     = process.env.DB_HOST     || 'localhost';
  const port     = parseInt(process.env.DB_PORT || '3306');
  const dbName   = process.env.DB_NAME     || 'freshers_group_generator';
  const user     = process.env.DB_USER     || 'root';
  const password = process.env.DB_PASSWORD || '';

  // ── Step 1: Connect without selecting a database, create DB if needed ────
  const tempConn = await mysql.createConnection({ host, port, user, password });
  await tempConn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8 COLLATE utf8_general_ci`
  );
  await tempConn.end();
  console.log(`✅ Database "${dbName}" ready`);

  // ── Step 2: Create connection pool targeting the new DB ──────────────────
  pool = mysql.createPool({
    host,
    port,
    database: dbName,
    user,
    password,
    waitForConnections: true,
    connectionLimit:    20,
    queueLimit:         0,
    timezone:           '+00:00',
  });

  // ── Step 3: Create tables ────────────────────────────────────────────────
  const conn = await pool.getConnection();
  try {
    await conn.execute(CREATE_STUDENTS_TABLE);
    await conn.execute(CREATE_SETTINGS_TABLE);
    await conn.execute(CREATE_GROUP_COUNTERS_TABLE);
    await conn.execute(INSERT_DEFAULT_SETTINGS);
    console.log('✅ Tables ready');

    // ── Step 4: Sync group counters with any existing student data ─────────
    await syncGroupCounters(conn);
    console.log('✅ Group counters synced');
  } finally {
    conn.release();
  }

  return pool;
}

/**
 * Rebuild group_counters from current settings + actual student data.
 * Called on startup and whenever settings change.
 * Must be called inside a connection (not pool) to participate in a transaction.
 */
async function syncGroupCounters(conn) {
  // Load settings
  const [rows] = await conn.execute('SELECT * FROM settings WHERE id = 1');
  if (!rows.length) return;

  const { total_students, students_per_group } = rows[0];
  const totalGroups = Math.ceil(total_students / students_per_group);

  // Get real counts from students table
  const [counts] = await conn.execute(
    'SELECT group_number, COUNT(*) AS cnt FROM students GROUP BY group_number'
  );
  const countMap = {};
  counts.forEach((r) => { countMap[r.group_number] = r.cnt; });

  // Rebuild group_counters
  await conn.execute('DELETE FROM group_counters');

  for (let g = 1; g <= totalGroups; g++) {
    const isLast = g === totalGroups;
    const remainder = total_students % students_per_group;
    const maxCap = isLast && remainder !== 0 ? remainder : students_per_group;
    const current = countMap[g] || 0;

    await conn.execute(
      'INSERT INTO group_counters (group_number, student_count, max_capacity) VALUES (?, ?, ?)',
      [g, current, maxCap]
    );
  }
}

/**
 * Get the pool (must call initializeDatabase first).
 */
function getPool() {
  if (!pool) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return pool;
}

module.exports = { initializeDatabase, getPool, syncGroupCounters };
