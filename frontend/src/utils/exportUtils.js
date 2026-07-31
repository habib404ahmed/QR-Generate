// Export utilities — CSV, Excel, Print
import * as XLSX from 'xlsx';

/**
 * Format students data for export
 */
function formatStudentsForExport(students) {
  return students.map((s, i) => ({
    'S.No': i + 1,
    'Student Name': s.name,
    'Department': s.department,
    'Mobile Number': s.mobile,
    'Group Number': s.groupNumber,
    'Registration Time': s.registeredAt
      ? new Date(s.registeredAt).toLocaleString('en-IN')
      : 'N/A',
  }));
}

/**
 * Export all students as CSV
 */
export function exportCSV(students, eventName = 'Freshers') {
  const data = formatStudentsForExport(students);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, `${eventName}_Students_${new Date().toISOString().split('T')[0]}.csv`);
}

/**
 * Export all students as Excel (.xlsx)
 */
export function exportExcel(students, eventName = 'Freshers') {
  const data = formatStudentsForExport(students);
  const ws = XLSX.utils.json_to_sheet(data);

  // Style header row
  ws['!cols'] = [
    { wch: 6 }, { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'All Students');

  // Add per-group sheets
  const groups = {};
  students.forEach((s) => {
    const key = `Group ${s.groupNumber}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  Object.entries(groups)
    .sort(([a], [b]) => parseInt(a.split(' ')[1]) - parseInt(b.split(' ')[1]))
    .forEach(([groupName, groupStudents]) => {
      const groupWs = XLSX.utils.json_to_sheet(formatStudentsForExport(groupStudents));
      groupWs['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, groupWs, groupName);
    });

  XLSX.writeFile(wb, `${eventName}_Groups_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Print all groups in a formatted layout
 */
export function printAllGroups(students, settings) {
  const groups = {};
  students.forEach((s) => {
    if (!groups[s.groupNumber]) groups[s.groupNumber] = [];
    groups[s.groupNumber].push(s);
  });

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${settings?.eventName || 'Freshers'} — All Groups</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; margin-bottom: 10px; }
        h2 { text-align: center; color: #555; font-size: 14px; margin-bottom: 30px; }
        .group { margin-bottom: 30px; page-break-inside: avoid; }
        .group-title { background: #333; color: white; padding: 8px 16px; border-radius: 4px; font-size: 16px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f0f0f0; padding: 8px; text-align: left; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        @media print { .group { page-break-inside: avoid; } }
      </style>
    </head>
    <body>
      <h1>${settings?.collegeName || 'College'}</h1>
      <h2>${settings?.eventName || 'Freshers Orientation'} — Group List</h2>
      ${Object.entries(groups)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([groupNum, members]) => `
          <div class="group">
            <div class="group-title">GROUP ${groupNum} (${members.length} students)</div>
            <table>
              <thead><tr><th>S.No</th><th>Name</th><th>Department</th><th>Mobile</th></tr></thead>
              <tbody>
                ${members.map((s, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${s.name}</td>
                    <td>${s.department}</td>
                    <td>${s.mobile}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
}

/**
 * Print a single group
 */
export function printGroup(groupNumber, students, settings) {
  const members = students.filter((s) => s.groupNumber === groupNumber);
  printAllGroups(members.map((s) => ({ ...s, groupNumber })), settings);
}
