import { Chess, Color, PieceSymbol } from "chess.js";
import { quedaAtacadaTrasMover, defensa } from './Principales';
import { Movimientos, PIECE_VALUE } from "../types/types";
import { getPiece } from "./translators";

/**
 * La función retorna true si se cumple alguna de estas condiciones:
 *  Hay captura Y la pieza capturada (piezaTo) vale más que la pieza que se mueve (piezaFrom)
 *  La pieza NO queda atacada tras realizar el movimiento
 */  
export function FiltradoRiesgo(fen:string,movimiento:string,piezaFrom:PieceSymbol){
    const piezaTo = getPiece(movimiento,fen);

    //No perdemos la reina ni de coña.
    if(piezaFrom=="q"&&quedaAtacadaTrasMover(fen,movimiento)){
        return false;
    }
    if((piezaTo&&PIECE_VALUE[piezaFrom]<PIECE_VALUE[piezaTo])||(!quedaAtacadaTrasMover(fen,movimiento))){
        console.log("Pieza From:",piezaFrom);
        console.log("Pieza To:",piezaTo);
        return true;
    }
    return false;
}

/**
 * Filtra movimientos que no empeoren la situación defensiva.
 * Retorna false si tras mover, la pieza que se defiende, empeora la situacion de otra de mayor rango.
 */
export function FiltradoDefensaPrincipal(
    defensa:Movimientos
): boolean {
    const piezasExpuestas = defensa.PiezasExpuestas;
    if(piezasExpuestas.length>0){
        for(const piezaExpuesta of piezasExpuestas){
            if(PIECE_VALUE[piezaExpuesta.type]>PIECE_VALUE[defensa.Pieza.type]) return false;
        }
    }
    return true;
}

/**
 * Filtra movimientos que no empeoren la situación defensiva.
 * Retorna false si tras mover, la pieza más valiosa atacada 
 * tiene mayor valor que antes.
 */
export function FiltradoDefensaSecundario(
    fen: string, 
    movimiento: string, 
    colorRival: Color, 
    defensaAntigua: Movimientos[]
): boolean {
    const colorPropio: Color = colorRival === "b" ? "w" : "b";
    const chess = new Chess(fen);
    
    const result = chess.move(movimiento);
    if (!result) return false; // Movimiento inválido
    
    const defensaNueva = defensa(chess, colorRival, colorPropio);
    
    // Si no hay piezas atacadas tras mover, es seguro
    if (!defensaNueva || defensaNueva.length === 0) return true;
    
    // Si no había piezas atacadas antes pero ahora sí, es malo
    if (!defensaAntigua || defensaAntigua.length === 0) return false;
    
    // Comparar valor de la pieza más valiosa atacada
    const valorAnterior = defensaAntigua[0].CalidadPieza ?? 0;
    const valorNuevo = defensaNueva[0].CalidadPieza ?? 0;
    
    // Rechazar si ahora se ataca una pieza más valiosa
    return valorNuevo <= valorAnterior;
}