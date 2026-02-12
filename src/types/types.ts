import { Move, Piece, PieceSymbol, Square } from "chess.js";

/**
 * Calcula el mejor movimiento para la posición actual
 * @param chess Instancia de chess.js con la posición actual
 * @returns Movimiento en notación SAN o null si no hay movimientos
 */
export type DifficultyLevel = 1 | 2;
export type PlayerColor = 'w' | 'b';

export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 99, // o un valor enorme si lo usas para mates
};

export interface Movimientos {
  Pieza:Piece;
  Square:Square;
  MovimientosPosibles: Move[];
  PiezasExpuestas:Piece[];
  CalidadPieza?: number;
}

export type AtaqueDefensorio = {
  movimiento: Move;
  CalidadPieza: number;
};

export interface Jugada {
  Tipo: "jaque" | "mate";
  Jugada: Move[];
}