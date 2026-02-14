import { Move, Chess } from 'chess.js';
import { PIECE_VALUE } from '../../types/types';
import InvertirColor from '../../utils/ColorInverso';
import { piezasAtacadasPor, PiezasDefiendenSquare } from '../../utils/PiezasAtacadas';
import { ordenPorCalidadPiezaSimbolo } from '../order/Calidad';



export function FiltradoDefensaV2(move: Move) {
  const chessAntes = new Chess(move.before);
  const piezaTo = chessAntes.get(move.to);

  const chessDespues = new Chess(move.after);
  const colorContrario = InvertirColor(move.color);

  const piezasMiasAtacadasAntes = piezasAtacadasPor(chessAntes,colorContrario);
  const piezasAtacadasDespues = piezasAtacadasPor(chessDespues,colorContrario);

  const defensores = PiezasDefiendenSquare(chessDespues,move.to);

  const defensorMasBarato = defensores.length>0
  ? Math.min(...defensores.map(d => PIECE_VALUE[d.piece.type]))
  : null;

  const valorAntes = piezasMiasAtacadasAntes.reduce((a,p)=>a+PIECE_VALUE[p.PiezaSimbolo],0);
  const valorDespues = piezasAtacadasDespues.reduce((a,p)=>a+PIECE_VALUE[p.PiezaSimbolo],0);
  const mejora = valorAntes - valorDespues;

  if (mejora <= 0) return false;

  const quedaAtacado = chessDespues.isAttacked(move.to, colorContrario);

  if (PIECE_VALUE[move.piece] >= 5 && quedaAtacado) {
    if (defensorMasBarato === null) return false;

    if (
      defensorMasBarato !== null &&
      defensorMasBarato - PIECE_VALUE[move.piece] >= 4
    ) {
      return false;
    }
  }

  if (
    (piezaTo && PIECE_VALUE[move.piece] < PIECE_VALUE[piezaTo.type]) ||
    !chessDespues.isAttacked(move.to, colorContrario)
  ) {
    return true;
  }

  return true;
}