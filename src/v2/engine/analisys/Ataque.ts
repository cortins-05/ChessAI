import { Color, Chess, Move } from 'chess.js';
import { Ataques } from '../../types/types';
import { ordenarPorCalidadPieza } from '../order/Calidad';
import { FiltradoPorRiesgoV2 } from '../filter/Ataque';
import cambiarTurno from '../../utils/CambiarTurno';

function getAtaques(moves:Move[]){
    const ataquesBrutosOrdenados = moves.filter(move=>move.captured).sort(ordenarPorCalidadPieza);
    const ataquesPulidos = ataquesBrutosOrdenados.filter(FiltradoPorRiesgoV2);

    return {
        BrutosOrdenados: ataquesBrutosOrdenados,
        PorRiesgoOrdenados: ataquesPulidos
    }

}

export default function ataqueV2(moves:Move[]):Ataques{

    const {BrutosOrdenados,PorRiesgoOrdenados} = getAtaques(moves);
    let ataqueCompuesto:Move[] = [];

    const movimientosPorCalidad = moves.sort(ordenarPorCalidadPieza).filter(mov => mov.captured==undefined);

    for(const mov of movimientosPorCalidad){
        let chess:Chess|false = new Chess(mov.after);
        chess = cambiarTurno(chess,mov.color);
        if(chess){
            const {BrutosOrdenados, PorRiesgoOrdenados} = getAtaques(chess.moves({verbose:true}));
            if(PorRiesgoOrdenados.length>0){
                ataqueCompuesto.push(mov,PorRiesgoOrdenados[0]);
                break;
            }
        }
    }

    return {
        BrutosOrdenados,
        PorRiesgoOrdenados,
        AtaqueCompuesto: ataqueCompuesto
    }

}