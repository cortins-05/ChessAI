import { PieceSymbol, Move } from 'chess.js';
import { PIECE_VALUE } from "../../types/types";

/**
 * Se encarga de ordenar las piezas en función de la calidad de las mismas
 */
export function ordenarPorCalidadPieza(a: Move, b: Move): number { 
  return PIECE_VALUE[b.piece] - PIECE_VALUE[a.piece];
}