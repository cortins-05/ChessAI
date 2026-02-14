import { Move, Chess } from 'chess.js';
import { PIECE_VALUE } from '../../types/types';
import InvertirColor from '../../utils/ColorInverso';

export function FiltradoDefensaV2(move: Move) {
  const chessAntes = new Chess(move.before);
  const piezaTo = chessAntes.get(move.to);

  const chessDespues = new Chess(move.after);
  const colorContrario = InvertirColor(move.color);

  if (move.piece === "q" && chessDespues.isAttacked(move.to, colorContrario)) {
    return false;
  }

  if (
    (piezaTo && PIECE_VALUE[move.piece] < PIECE_VALUE[piezaTo.type]) ||
    !chessDespues.isAttacked(move.to, colorContrario)
  ) {
    return true;
  }

  return false;
}
