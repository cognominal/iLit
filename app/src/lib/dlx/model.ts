export type Cell = string;

export type Piece = string;

export type Column = string;

export type RowDef = {
  name: string;
  piece: Piece;
  cells: Cell[];
};

export type PreviewStep = {
  label: string;
  rowName?: string;
  note: string;
};

export function hasOne(row: RowDef, column: Column): boolean {
  return row.piece === column || row.cells.includes(column);
}

export function buildRowMap(rows: RowDef[]): Map<string, RowDef> {
  return new Map(rows.map((row) => [row.name, row]));
}

export function activeColumnsFromRow(row?: RowDef): Set<Column> {
  const columns = new Set<Column>();
  if (!row) return columns;
  columns.add(row.piece);
  for (const cell of row.cells) columns.add(cell);
  return columns;
}

export function activeCellsFromRow(row?: RowDef): Set<Cell> {
  const cells = new Set<Cell>();
  if (!row) return cells;
  for (const cell of row.cells) cells.add(cell);
  return cells;
}
