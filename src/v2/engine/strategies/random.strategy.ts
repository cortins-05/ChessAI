import { Chess, Color } from 'chess.js';

export function randomMove(chess: Chess,colorIA:Color):string{
  const moves = chess.moves({verbose:true});
  return moves[Math.floor(Math.random() * moves.length)].san;
}