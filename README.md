# Cortins Chess AI

Motor de ajedrez IA basado en el algoritmo Cortins Chess para calcular movimientos estratégicos inteligentes.

## Instalación

```bash
npm install cortins-chess-ai chess.js
```

## Uso

```typescript
import { Chess } from 'chess.js';
import { CortinsChessAlgorithm } from 'cortins-chess-ai';

// Crear una instancia del juego
const chess = new Chess();

// Crear el algoritmo (especifica el color del rival: 'w' para blancas, 'b' para negras)
const ai = new CortinsChessAlgorithm('w');

// Obtener el mejor movimiento calculado por el algoritmo
const bestMove = ai.cortinsMove(chess);
console.log('Mejor movimiento:', bestMove);

// Aplicar el movimiento
chess.move(bestMove);
```

## API

### `CortinsChessAlgorithm`

Clase principal que implementa el algoritmo de IA.

#### Constructor

```typescript
new CortinsChessAlgorithm(colorRival: 'w' | 'b')
```

- `colorRival`: El color del jugador rival ('w' para blancas, 'b' para negras)

#### Métodos

##### `cortinsMove(chess: Chess): string`

Calcula y devuelve el mejor movimiento para la posición actual.

##### `randomMove(chess: Chess): string`

Devuelve un movimiento aleatorio válido.

### Tipos exportados

- `DifficultyLevel` - Nivel de dificultad (1 | 2)
- `PlayerColor` - Color del jugador ('w' | 'b')
- `Movimientos` - Información sobre movimientos posibles
- `AtaqueDefensorio` - Datos de ataque/defensa
- `Jugada` - Representación de una jugada

### Constantes

- `PIECE_VALUE` - Valores de las piezas para evaluación

### Funciones de utilidad

- `primerasJugadasPosibles()` - Calcula jugadas posibles iniciales
- `defensa()` - Analiza movimientos defensivos
- `ataque()` - Analiza movimientos de ataque
- `quedaAtacadaTrasMover()` - Verifica si una pieza queda atacada
- `movimientoValido()` - Valida un movimiento
- `ordenarPorCalidadPieza()` - Ordena piezas por valor
- `FiltradoRiesgo()` - Filtra movimientos por riesgo

## Requisitos

- Node.js >= 16.0.0
- chess.js ^1.0.0 (peer dependency)

## Licencia

MIT
