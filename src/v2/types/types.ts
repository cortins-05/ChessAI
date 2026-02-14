import { PieceSymbol, Move } from 'chess.js';

export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 99,
};

export interface Ataques {
  BrutosOrdenados: Move[];
  PorRiesgoOrdenados:Move[];
  AtaqueCompuesto:Move[];
}

export interface Defensas {
  BrutasOrdenadas: Move[];
  PorRiesgoOrdenadas:Move[];
  ImplicanAtaqueConRiesgo:Move[];
  ImplicanAtaqueSinRiesgo:Move[];
}