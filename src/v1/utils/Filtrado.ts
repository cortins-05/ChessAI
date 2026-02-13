import { Chess, Color, PieceSymbol, Square, Move } from 'chess.js';
import { quedaAtacadaTrasMover, defensa } from './Principales';
import { Movimientos, PIECE_VALUE } from "../types/types";

/**
 * La función retorna true si se cumple alguna de estas condiciones:
 *  Hay captura Y la pieza capturada (piezaTo) vale más que la pieza que se mueve (piezaFrom)
 *  La pieza NO queda atacada tras realizar el movimiento
 */  
export function FiltradoRiesgo(fen:string,movimiento:Move){
    const chess = new Chess(fen);
    const piezaTo = chess.get(movimiento.to);

    //No perdemos la reina ni de coña.
    if(movimiento.piece=="q"&&quedaAtacadaTrasMover(fen,movimiento.from)){
        return false;
    }
    if((piezaTo&&PIECE_VALUE[movimiento.piece]<PIECE_VALUE[piezaTo.type])||(!quedaAtacadaTrasMover(fen,movimiento.san))){
        return true;
    }
    return false;
}

/**
 * Filtra movimientos que no empeoren la situación defensiva.
 * Retorna false si:
 *  - Tras mover, la pieza que se defiende empeora la situación de otra de mayor rango.
 *  - El rey intenta capturar una pieza que está defendida (quedaría en jaque).
 */
export function FiltradoDefensaPrincipal(
    defensa:Movimientos,
    chess: Chess,
    colorRival: Color
): boolean {
    const piezasExpuestas = defensa.PiezasExpuestas;
    
    // Si es el rey, filtrar movimientos donde captura piezas defendidas
    if(defensa.Pieza.type === "k"){
        const movimientosFiltrados = defensa.MovimientosPosibles.filter(mov => {
            // Detectar si es una captura (contiene 'x')
            if(mov.captured!=undefined){
                // Extraer casilla destino del movimiento (ej: "Kxe5" -> "e5")
                const match = mov.to;
                if(match){
                    const casillaDestino = match[1] as Square;
                    // Si la casilla está defendida por el rival, el rey no puede capturar
                    if(chess.isAttacked(casillaDestino, colorRival)){
                        return false;
                    }
                }
            }
            return true;
        });
        
        // Si no quedan movimientos válidos para el rey, rechazar
        if(movimientosFiltrados.length === 0 && defensa.MovimientosPosibles.length > 0){
            return false;
        }
        
        // Actualizar los movimientos posibles al array filtrado
        defensa.MovimientosPosibles = movimientosFiltrados;
    }
    
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
    
    try {
        const result = chess.move(movimiento);
        if (!result) return false; // Movimiento inválido
    } catch {
        return false;
    }
    
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