export function parseCSV(text: string): Record<string, string>[] {
  if (text.length > 10000000) throw Error('CSV files must be under 10 MB.');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((c === '\r' || c === '\n') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      cell = '';
      row = [];
    } else cell += c;
  }
  if (quoted) throw Error('A quoted CSV field was not closed.');
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift()?.map((h) => h.replace(/^\uFEFF/, ''));
  if (
    !headers ||
    new Set(headers).size !== headers.length ||
    headers.some(
      (h) => !h || ['__proto__', 'prototype', 'constructor'].includes(h),
    )
  )
    throw Error('CSV requires unique, non-empty column headers.');
  return rows.map((values, i) => {
    if (values.length !== headers.length)
      throw Error(`Row ${i + 2}: column count does not match the header.`);
    return Object.fromEntries(headers.map((h, j) => [h, values[j]]));
  });
}
