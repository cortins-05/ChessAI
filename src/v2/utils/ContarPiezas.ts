import { Chess, Color } from "chess.js";

export function ContarPiezasPorColor(fen:string,color:Color){
    const chess = new Chess(fen);
    const board = chess.board();
    let contador=0;
    for(let row=0;row<8;row++){
        for(let col=0;col<8;col++){
            const pieza = board[row][col];
            if(pieza&&pieza.color==color)contador++;
        }
    }
    return contador;
}

export function ContarPiezasTotales(fen:string){
    const chess = new Chess(fen);
    const board = chess.board();
    let contador=0;
    for(let row=0;row<8;row++){
        for(let col=0;col<8;col++){
            const pieza = board[row][col];
            if(pieza?.color)contador++;
        }
    }
    return contador;
}