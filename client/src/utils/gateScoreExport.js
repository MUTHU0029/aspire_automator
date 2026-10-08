import { strToU8, zipSync } from 'fflate';

const escapeXml = (value) => String(value)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const toCellXml = (value, reference) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${reference}"><v>${value}</v></c>`;
  }

  return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
};

const buildWorksheetXml = (students, summary) => {
  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rows = [
    ['Student Name', 'Roll No', 'Department', 'Year', 'Test 1', 'Test 2', 'Test 3', 'Test 4'],
    ...students.map((student) => [
      student.name,
      student.registerNumber,
      student.department,
      student.year,
      student.test1,
      student.test2,
      student.test3,
      student.test4,
    ]),
    [],
    ['GATE Test Summary'],
    ['Test', 'Highest Score', 'Minimum Score', 'Average Score'],
    ...summary.map((item) => [item.test, item.highest, item.minimum, item.average]),
  ];
  const sheetRows = rows.map((cells, rowIndex) => {
    const rowNumber = rowIndex + 1;
    const cellXml = cells
      .map((value, columnIndex) => toCellXml(value, `${columns[columnIndex]}${rowNumber}`))
      .join('');
    return `<row r="${rowNumber}">${cellXml}</row>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>
  <cols><col min="1" max="1" width="24" customWidth="1"/><col min="2" max="2" width="18" customWidth="1"/><col min="3" max="3" width="16" customWidth="1"/><col min="4" max="4" width="10" customWidth="1"/><col min="5" max="8" width="12" customWidth="1"/></cols>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
};

export const createGateScoreWorkbook = (students, summary) => zipSync({
  '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
  '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
  'xl/workbook.xml': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="GATE Scores" sheetId="1" r:id="rId1"/></sheets></workbook>'),
  'xl/_rels/workbook.xml.rels': strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
  'xl/worksheets/sheet1.xml': strToU8(buildWorksheetXml(students, summary)),
});
