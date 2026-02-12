import { Move, Piece, PieceSymbol, Square } from "chess.js";

export type DifficultyLevel = 1 | 2;

export const PIECE_VALUE: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 99,
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