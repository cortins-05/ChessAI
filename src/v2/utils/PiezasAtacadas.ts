import { Chess, Color } from "chess.js";
import { BoardDefensa } from "../types/types";


export function piezasAtacadasPor(chess: Chess, color: Color): BoardDefensa[] {
  const out: BoardDefensa[] = [];

  for (const row of chess.board()) {
    for (const p of row) {
      // "color" ataca; por eso revisamos piezas del color contrario.
      if (!p || p.color === color) continue;

      if (chess.isAttacked(p.square, color)) {
        out.push({ PiezaSimbolo: p.type, Square: p.square });
      }
    }
  }

  return out;
}
