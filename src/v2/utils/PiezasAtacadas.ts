import { Chess, Color, Square } from "chess.js";
import { BoardDefensa } from "../types/types";
import InvertirColor from "./ColorInverso";


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

export function PiezasAmenzanSquare(chess:Chess, square:Square){
  const pieza = chess.get(square);
  
  if(!pieza) return [];

  const resultado = [];

  const colorContrario = InvertirColor(pieza.color);

  const atacantes = chess.attackers(square,colorContrario);

  for(const SquareAtacante of atacantes){
    const piezaAtacante = chess.get(SquareAtacante);
    if(piezaAtacante) resultado.push({
      SquareAtacante,
      piezaAtacante
    })
  }

  return resultado;

}

export function PiezasDefiendenSquare(chess: Chess, square: Square) {
  const pieza = chess.get(square);
  if (!pieza) return [];

  const resultado = [];

  const defensores = chess.attackers(square, pieza.color);

  for (const squareDefensor of defensores) {
    const piezaDefensora = chess.get(squareDefensor);
    if (piezaDefensora) {
      resultado.push({
        square: squareDefensor,
        piece: piezaDefensora
      });
    }
  }

  return resultado;
}
