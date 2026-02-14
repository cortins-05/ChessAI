import { Chess } from "chess.js";


export default function isValidMove(fen:string,san:string){
    const chess = new Chess(fen);
    try{
        chess.move(san);
        return true;
    }catch{
        return false;
    }
}