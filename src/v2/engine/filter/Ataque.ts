import { Move, Chess } from 'chess.js';
import { PIECE_VALUE } from '../../types/types';

export function FiltradoPorRiesgoV2(move: Move) {
  if (!move.captured) return false;

  const chessAntes = new Chess(move.before);
  const piezaEnDestinoAntes = chessAntes.get(move.to);

  const chessDespues = new Chess(move.after);

  const rival = move.color === "w" ? "b" : "w";
  const destinoDefendidoPorRival = chessDespues.isAttacked(move.to, rival);

  // si es reina y queda defendida por rival => descarta
  if (PIECE_VALUE[move.piece] >= 5 && destinoDefendidoPorRival) return false;

  if (destinoDefendidoPorRival) {
    const gain = piezaEnDestinoAntes ? PIECE_VALUE[piezaEnDestinoAntes.type] - PIECE_VALUE[move.piece] : -999;
    if (gain <= 0) return false;
  }

  if (
    (piezaEnDestinoAntes && PIECE_VALUE[move.piece] < PIECE_VALUE[piezaEnDestinoAntes.type]) ||
    !destinoDefendidoPorRival
  ) {
    return true;
  }

  return false;
}
