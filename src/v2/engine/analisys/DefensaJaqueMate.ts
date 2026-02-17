import { Chess, Color } from "chess.js";
import { findMateIn2ThreatFast } from "../../utils/AnalisisDosMovsJaqueRival";

export function PredecirMateEn2(chess: Chess, colorAAnalizar: Color) {
  // IMPORTANTE: el chess que le pases debe estar en una posición válida (fen ok)
  // y tu fork debe soportar setTurn si quieres analizar un color que NO es el turno actual.

    const res = findMateIn2ThreatFast(chess, colorAAnalizar, {
        maxFirstMoves: 20,
        maxReplies: 10,
        maxSecondMoves: 20,
    });


  if (!res) return null;

  // res.first y res.second son Move verbose
  return {
    movimientos: [res.first, res.second],
    score: res.score,
    defensaEjemplo: res.viaReply, // opcional, útil para debug
  };
}
