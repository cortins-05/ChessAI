import { Move, Chess } from 'chess.js';
import cambiarTurno from './CambiarTurno';

export function FILTROIsCheckMate(m: Move): boolean {
  if (!m.after) return false;

  let chess:Chess|false = new Chess(m.after);
  
  chess = cambiarTurno(chess,m.color);

  if(!chess) return true;

  return chess.isCheckmate();
}