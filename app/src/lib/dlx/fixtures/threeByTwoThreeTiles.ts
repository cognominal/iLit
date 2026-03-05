import type { Column, RowDef } from '../model';

const cells = [
  'c00', 'c01',
  'c10', 'c11',
  'c20', 'c21',
] as const;

export const threeByTwoThreeTilesColumns: Column[] = [
  'M',
  'D',
  'L',
  ...cells,
];

export const threeByTwoThreeTilesRows: RowDef[] = [
  { name: 'M_c00', piece: 'M', cells: ['c00'] },
  { name: 'M_c01', piece: 'M', cells: ['c01'] },
  { name: 'M_c10', piece: 'M', cells: ['c10'] },
  { name: 'M_c11', piece: 'M', cells: ['c11'] },
  { name: 'M_c20', piece: 'M', cells: ['c20'] },
  { name: 'M_c21', piece: 'M', cells: ['c21'] },

  { name: 'D_h_r0', piece: 'D', cells: ['c00', 'c01'] },
  { name: 'D_h_r1', piece: 'D', cells: ['c10', 'c11'] },
  { name: 'D_h_r2', piece: 'D', cells: ['c20', 'c21'] },
  { name: 'D_v_c0_r0', piece: 'D', cells: ['c00', 'c10'] },
  { name: 'D_v_c0_r1', piece: 'D', cells: ['c10', 'c20'] },
  { name: 'D_v_c1_r0', piece: 'D', cells: ['c01', 'c11'] },
  { name: 'D_v_c1_r1', piece: 'D', cells: ['c11', 'c21'] },

  { name: 'L_top_r0c0', piece: 'L', cells: ['c00', 'c10', 'c11'] },
  { name: 'L_top_r0c1', piece: 'L', cells: ['c01', 'c11', 'c10'] },
  { name: 'L_top_r0c2', piece: 'L', cells: ['c00', 'c01', 'c10'] },
  { name: 'L_top_r0c3', piece: 'L', cells: ['c00', 'c01', 'c11'] },
  { name: 'L_bot_r1c0', piece: 'L', cells: ['c10', 'c20', 'c21'] },
  { name: 'L_bot_r1c1', piece: 'L', cells: ['c11', 'c21', 'c20'] },
  { name: 'L_bot_r1c2', piece: 'L', cells: ['c10', 'c11', 'c20'] },
  { name: 'L_bot_r1c3', piece: 'L', cells: ['c10', 'c11', 'c21'] },
];
