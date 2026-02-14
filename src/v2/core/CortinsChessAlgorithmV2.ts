import { Color, Chess, Move, Piece, Square } from 'chess.js';
import { randomMove } from "../engine/strategies/random.strategy";
import defensaV2 from '../engine/analisys/Defensa';
import ataqueV2 from '../engine/analisys/Ataque';
import isValidMove from '../utils/ValidMove';
import JugadasJaqueMate from '../engine/analisys/JaqueMate';
import { ContarPiezasTotales } from '../utils/ContarPiezas';
import { FiltradoDefensaV2 } from '../engine/filter/Defensa';
import { filterKingNotAdjacentToEnemyKing } from '../utils/KingSquares';
import { PIECE_VALUE, RetornaDesarrollo } from '../types/types';
import ordenPorRiesgo from '../engine/order/Riesgo';


export class CortinsChessAlgorithmV2 {

    private colorIA:Color;
    private colorRival:Color;

    private ultimosUci: string[]=[];

    private ataqueCompuesto?:Move[];

    private jugadasJaqueMate: Move[][]=[];

    public constructor(colorIA:Color){
        this.colorIA = colorIA;
        this.colorRival = colorIA === "b" ? "w" : "b";
    }

    public randomMove(chess:Chess):RetornaDesarrollo{
        return {
            san: randomMove(chess,this.colorIA),
            code: "ALEATORIO"
        };
    }

    public CortinsMoveV2(chess:Chess):RetornaDesarrollo{

        let move:RetornaDesarrollo|undefined;
        let moves = chess.moves({verbose:true});
        const movimientos_no_repititivos = moves = moves.filter(mov=>mov.san!=this.ultimosUci.at(-1)&&mov.san!=this.ultimosUci.at(-2));
        const longitudInicial = moves.length;

        const pos = chess.findPiece({ color: this.colorRival, type: "k" }) as Square[];
        const enemyKingSq = pos[0];

        //1-> Analizamos si hay defensas posibles y guardamos en variable
        const defensasPosibles = defensaV2(movimientos_no_repititivos);

        moves = filterKingNotAdjacentToEnemyKing(moves, enemyKingSq);
        const probabilidadJaque = longitudInicial-moves.length;

        //2-> Analizamos si hay ataques disponibles y guardamos en variable con interfaz Ataque
        const ataquesPosibles = ataqueV2(moves);

        if(!this.ataqueCompuesto || this.ataqueCompuesto.length==0 || !isValidMove(chess.fen(),this.ataqueCompuesto[0].san)){
            this.ataqueCompuesto = ataquesPosibles.AtaqueCompuesto;
        }

        console.log(probabilidadJaque);

        if(probabilidadJaque>=3){
            this.jugadasJaqueMate = JugadasJaqueMate({moves,profundidad:5,slice:4});
        }

        if (this.jugadasJaqueMate && this.jugadasJaqueMate.length > 0) {
            // quita líneas vacías y quédate con las que aplican ahora
            const candidatas = this.jugadasJaqueMate
                .filter(l => l.length > 0)
                .filter(l => isValidMove(chess.fen(), l[0].san))
                .sort((a,b) => a.length - b.length);

            if (candidatas.length === 0) {
                this.jugadasJaqueMate = [];
            } else {
                let linea = candidatas[0];
                if(this.ultimosUci&&this.ultimosUci.length>1&&linea[0].san==this.ultimosUci.at(-1)&&linea[0].san==this.ultimosUci.at(-2)){
                    console.log("JUGADA DE JAQUE REPETITIVA, SALTANDO...");
                }
                else if(linea.length>1){
                    linea = linea.filter(FiltradoDefensaV2);
                    if(linea.length>0 && isValidMove(chess.fen(),linea[0].san)){
                        return {
                            san: linea[0].san,
                            code: "JUGADA DE JAQUE"
                        }
                    }
                }else{
                    const mov = linea[0];
                    return {
                        san: mov.san,
                        code: "JUGADA DE JAQUE FINAL"
                    };
                }                
            }
        }
        
        if(this.jugadasJaqueMate.length==0&&ContarPiezasTotales(chess.fen())<20){
            this.jugadasJaqueMate = JugadasJaqueMate({moves,profundidad:4,slice:3});
        }

        const rey:Piece = {
            color: this.colorRival,
            type: "k"
        }

        const posicion_rey = chess.findPiece(rey);
        let piezas_inmoviles:Square[];
        const chessCopy = new Chess(chess.fen());
        piezas_inmoviles = chessCopy.moves({square:posicion_rey[0],verbose:true}).map(mov => mov.to);

        if (chess.inCheck()) {
            if (defensasPosibles.PorRiesgoOrdenadas.length > 0) {
                return {
                    san: defensasPosibles.PorRiesgoOrdenadas[0].san,
                    code: "DEFENSA EN JAQUE (SEGURA)"
                };
            }

            // si no hay defensa "segura", al menos sal del jaque
            return {
                san: moves[0].san,
                code: "SALIDA DE JAQUE FORZADA"
            };
        }

        if(defensasPosibles.ImplicanAtaqueSinRiesgo.length>0){
            const movimiento = defensasPosibles.ImplicanAtaqueSinRiesgo;
            if(this.ultimosUci&&this.ultimosUci.length>0&&movimiento[0].san==this.ultimosUci.at(-1)&&movimiento.length>1){
                move = {
                    san: movimiento[1].san,
                    code: "ATAQUE DEFENSIVO SIN RIESGO"
                }
            }else{
                move = {
                    san: movimiento[0].san,
                    code: "ATAQUE DEFENSIVO SIN RIESGO"
                }
            }
            
        }else if(defensasPosibles.PorRiesgoOrdenadas.length>0){
            const movimiento = defensasPosibles.PorRiesgoOrdenadas;
            if(this.ultimosUci&&this.ultimosUci.length>0&&movimiento[0].san==this.ultimosUci.at(-1)&&movimiento.length>1){
                move = {
                    san: movimiento[1].san,
                    code: "DEFENSAS POR RIESGO ORDENADAS"
                }
            }else{
                move = {
                    san: movimiento[0].san,
                    code: "DEFENSAS POR RIESGO ORDENADAS"
                }
            }
            
        }else if(defensasPosibles.BrutasOrdenadas.length>0){
            const movimiento = defensasPosibles.BrutasOrdenadas;
            if(this.ultimosUci&&this.ultimosUci.length>0&&movimiento[0].san==this.ultimosUci.at(-1)&&movimiento.length>1){
                move = {
                    san: movimiento[1].san,
                    code: "DEFENSAS BRUTAS ORDENADAS"
                }
            }else{
                move = {
                    san: movimiento[0].san,
                    code: "DEFENSAS BRUTAS ORDENADAS"
                }
            }
        }else if(this.ataqueCompuesto && this.ataqueCompuesto.length>0 && isValidMove(chess.fen(),this.ataqueCompuesto[0].san) && FiltradoDefensaV2(this.ataqueCompuesto[0])&&this.ataqueCompuesto[0].captured){
            move = {
                san: this.ataqueCompuesto.shift()!.san,
                code: "ATAQUE COMPUESTO"
            }
        }else if(ataquesPosibles.PorRiesgoOrdenados.length>0){
            const movimiento = ataquesPosibles.PorRiesgoOrdenados;
            if(this.ultimosUci&&this.ultimosUci.length>0&&movimiento[0].san==this.ultimosUci.at(-1)&&movimiento.length>1){
                move = {
                    san: movimiento[1].san,
                    code: "ATAQUES POR RIESGO ORDENADOS"
                }
            }else{
                move = {
                    san: movimiento[0].san,
                    code: "ATAQUES POR RIESGO ORDENADOS"
                }
            }
        }

        if(move?.san&&!isValidMove(chess.fen(),move.san)){
            console.log("Movimiento invalido",move.code,move.san);
        }

        if(move){
            this.ultimosUci.push(move.san);
            return move
        };

        const movimiento_restante = moves
        .sort((a, b) => {
            const riesgo = ordenPorRiesgo(a, b);
            if (riesgo !== 0) return riesgo;

            return PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece];
        })[0];

        this.ultimosUci.push(movimiento_restante.san);

        console.log("Movimiento restante:",movimiento_restante.piece);

        return {
            san: movimiento_restante.san,
            code: "MOVIMIENTO DE PEONES O LO QUE QUEDE"
        }
    }
}