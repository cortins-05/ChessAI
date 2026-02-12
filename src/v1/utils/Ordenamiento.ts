import { PieceSymbol } from "chess.js";
import { PIECE_VALUE } from "../types/types";
import { quedaAtacadaTrasMover } from "./Principales";

/**
 * Se encarga de ordenar las piezas en función de la calidad de las mismas
 */
export function ordenarPorCalidadPieza(a: PieceSymbol, b: PieceSymbol): number { 
  return PIECE_VALUE[b] - PIECE_VALUE[a];
}

/**
 * Ordena movimientos por riesgo (menor riesgo primero).
 * Un movimiento es arriesgado si la pieza queda atacada después de mover.
 * 
 * @returns -1 si 'a' es menos arriesgado que 'b' (a va primero)
 * @returns 1 si 'a' es más arriesgado que 'b' (b va primero)
 * @returns 0 si ambos tienen el mismo nivel de riesgo
 */
export function ordenPorRiesgo(a: string, b: string, fen: string): number {
  const riesgoA = quedaAtacadaTrasMover(fen, a);
  const riesgoB = quedaAtacadaTrasMover(fen, b);
  
  // Si 'a' es arriesgado y 'b' no → 'b' va primero
  if (riesgoA && !riesgoB) return 1;
  
  // Si 'a' es seguro y 'b' es arriesgado → 'a' va primero
  if (!riesgoA && riesgoB) return -1;
  
  // Ambos tienen el mismo nivel de riesgo
  return 0;
}