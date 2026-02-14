import { Move, Chess, Color } from 'chess.js';
import { Defensas } from '../../types/types';
import { ordenarPorCalidadPieza } from '../order/Calidad';
import { FiltradoDefensaV2 } from '../filter/Defensa';
import InvertirColor from '../../utils/ColorInverso';
import ordenPorRiesgo from '../order/Riesgo';

export default function defensaV2(moves:Move[]):Defensas{

    if (moves.length === 0) {
        return {
        BrutasOrdenadas: [],
        PorRiesgoOrdenadas: [],
        ImplicanAtaqueConRiesgo: [],
        ImplicanAtaqueSinRiesgo: [],
        };
    }

    const chess = new Chess(moves[0].before);

    const board = chess.board();
    const defensas_brutas:Move[] = [];
    for (let row = 0; row < 8; row++){
        for (let col = 0; col < 8; col++){
            const pieza = board[row][col];
            if(!pieza||pieza.color!==moves[0].color) continue;
            if(chess.isAttacked(pieza.square,InvertirColor(moves[0].color))){
                const moves = chess.moves({ square:pieza.square, verbose: true });
                defensas_brutas.push(...moves);
            }
        }
    }

    defensas_brutas
    .sort((a, b) => {
        const riesgo = ordenPorRiesgo(a, b);
        if (riesgo !== 0) return riesgo;

        return ordenarPorCalidadPieza(a,b);
    })[0];

    const defensas_sin_riesgo = defensas_brutas.filter(FiltradoDefensaV2);
    const defensas_con_ataque = defensas_brutas.filter(def=> def.captured!==undefined);
    const defensas_con_ataque_sin_riesgo = defensas_sin_riesgo.filter(def=> def.captured!==undefined);

    return {
        BrutasOrdenadas:defensas_brutas,
        PorRiesgoOrdenadas: defensas_con_ataque_sin_riesgo,
        ImplicanAtaqueConRiesgo: defensas_con_ataque,
        ImplicanAtaqueSinRiesgo: defensas_con_ataque_sin_riesgo
    };
}