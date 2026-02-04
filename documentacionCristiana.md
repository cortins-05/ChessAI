# 📘 **Documentación “en cristiano” de chess.js**

**chess.js** es una **librería de ajedrez escrita en TypeScript/JavaScript**, pensada para manejar las reglas del juego:
✔ genera y valida movimientos legales
✔ representa posiciones
✔ detecta jaque, jaque mate, tablas, etc.
**Todo esto sin interfaz gráfica** — solo lógica de ajedrez 👇 ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

## 🧠 ¿Para qué sirve esta librería?

chess.js no es un motor de IA, sino **el “motor de reglas” del ajedrez**:

✔ Saber qué movimientos son legales
✔ Llevar el estado de la partida
✔ Analizar si hay jaque/juego terminado
✔ Representar posiciones con FEN/PGN
✔ Consultar datos del tablero
✔ No hace jugadas “inteligentes” por sí misma

Es perfecta para usar como base de:

* un motor de IA
* un juego online
* un UI de tablero
* análisis de partidas

Todo sin preocuparte por las reglas. ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

## 🚀 Instalar e importar

### 📦 Instalar (npm / yarn)

```bash
npm install chess.js
# o
yarn add chess.js
```

(chess.js se publica en npm como paquete oficial) ([npmjs.com](https://www.npmjs.com/package/chess.js?activeTab=readme&utm_source=chatgpt.com "chess.js"))

### 🔌 Importar en código

**Módulos ES (recomendado):**

```ts
import { Chess } from 'chess.js'
```

**CommonJS (Node clásico):**

```js
const { Chess } = require('chess.js')
``` :contentReference[oaicite:4]{index=4}

---

## ♟️ Cómo iniciar una partida

```ts
const chess = new Chess()
```

Esto empieza la partida desde la posición inicial estándar en ajedrez.
También puedes empezar desde una posición concreta con **FEN**:

```ts
const chess = new Chess('r1k4r/ppqnb1p1/2b4p/1p1n1p2/2PP4/3Q1NB1/1P3PPP/R5K1 b - - 0 19')
``` :contentReference[oaicite:5]{index=5}

---

## 🔍 Métodos útiles del API

---

### ✅ `moves([options])` — Lista de movimientos legales
Devuelve un array de movimientos posibles desde la posición actual.

```ts
const legalMoves = chess.moves()
```

Si quieres **más detalles por movimiento** (origen, destino, pieza, etc.):

```ts
const legalMovesVerbose = chess.moves({ verbose: true })
``` :contentReference[oaicite:6]{index=6}

---

### ✅ `move(moveSAN)` — Ejecuta un movimiento

```ts
chess.move('e4')
```

Acepta movimiento en **notación algebraica** (SAN), por ejemplo:

* `'e4'`
* `'Nf3'`
* `'O-O'` (enroque)

Devuelve información del movimiento o `null` si no es legal. ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

### 📊 Obtener información sobre el tablero

* **ASCII del tablero (texto):**
  ```ts
  chess.ascii()
  ```
* **Array de objetos del tablero:**
  ```ts
  chess.board()
  ```
* **Ver qué hay en una casilla:**
  ```ts
  chess.get('a5')
  ```
* **Colocar pieza en una casilla:**
  ```ts
  chess.put({ type: chess.PAWN, color: chess.BLACK }, 'a5')
  ``` :contentReference[oaicite:8]{index=8}
  ```

---

## 🕹️ Estado de la partida

Estos métodos te ayudan a saber si la partida terminó y en qué condición:

```ts
chess.isGameOver()              // true/false
chess.isCheckmate()             // está en jaque mate
chess.isStalemate()             // tablas
chess.isThreefoldRepetition()   // 3 repeticiones
chess.isDrawByFiftyMoves()      // regla de 50 movimientos
chess.isInsufficientMaterial()  // material insuficiente
```

👉 Todos devuelven **true o false** según la situación actual. ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

## 🗂️ FEN y PGN

### 🔄 FEN

FEN es un formato para describir una posición completa de ajedrez.

```ts
const fenString = chess.fen()
```

Puedes cargar una FEN:

```ts
chess.load(fenString)
```

Opciones:

```ts
chess.load(fenString, { skipValidation: true })
```

Esto omite la validación estricta de FEN si lo necesitas. ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

### 📜 PGN — Partida en formato estándar

**PGN** (Portable Game Notation) es el texto de una partida completa.

```ts
const pgn = chess.pgn()
```

Puedes cargar juegos en PGN:

```ts
chess.loadPgn(pgnString)
```

(chess.js puede extraer comentarios y jugadas del PGN cargado) ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

## 🧠 Otras herramientas útiles

✔ `history()` → Lista de movimientos jugados
✔ `turn()` → Quién está en turno (‘w’ o ‘b’)
✔ `inCheck()` → Si el jugador en turno está en jaque
✔ `square_color(square)` → Color de la casilla (“light”/“dark”)
✔ `hash()` → Hash único de la posición (útil para tablas/transposiciones)
✔ `findPiece({ type, color })` → Busca piezas de un tipo/color ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

## 🧩 Constantes exportadas

La librería exporta constantes para facilitarte el código:


| Constante          | Significado       |
| ------------------ | ----------------- |
| `WHITE`            | Jugador blanco    |
| `BLACK`            | Jugador negro     |
| `PAWN`             | Peón             |
| `KNIGHT`           | Caballo           |
| `BISHOP`           | Alfil             |
| `ROOK`             | Torre             |
| `QUEEN`            | Dama              |
| `KING`             | Rey               |
| `DEFAULT_POSITION` | FEN de inicio     |
| `SQUARES`          | Lista`'a8'..'h1'` |

---

## 🛠️ Consejos de uso rápido

### 🎮 Simular una partida aleatoria

```ts
import { Chess } from 'chess.js'

const chess = new Chess()

while (!chess.isGameOver()) {
  const moves = chess.moves()
  const choice = moves[Math.floor(Math.random() * moves.length)]
  chess.move(choice)
}
console.log(chess.pgn())
```

Esto juega movimientos al azar hasta terminar el juego. ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

## 🧠 Notas y cosas a tener en cuenta

✔ chess.js no incluye IA; se usa para **manejar reglas y estado**. ([GitHub](https://github.com/jhlywa/chess.js?utm_source=chatgpt.com "jhlywa/chess.js"))
✔ Puedes usarlo con un tablero visual como `chessboard.js` si quieres interfaz. ([Chess.com](https://www.chess.com/forum/view/general/open-source-javascript-chess-board?utm_source=chatgpt.com "Open Source JavaScript Chess Board - Chess Forums"))
✔ Analizar posiciones, calcular mate/tablones, detectar jaque mate, etc., lo tienes listo. ([jhlywa.github.io](https://jhlywa.github.io/chess.js/ "chess.js"))

---

## 🙌 Resumen rápido


| Lo que hace chess.js        | Ejemplo                          |
| --------------------------- | -------------------------------- |
| Generar movimientos legales | `chess.moves()`                  |
| Ejecutar jugadas            | `chess.move()`                   |
| Estado de partida           | `chess.isGameOver()`             |
| FEN                         | `chess.fen()`/`chess.load()`     |
| PGN                         | `chess.pgn()`/`chess.loadPgn()`  |
| Tablero                     | `chess.board()`,`chess.ascii()`  |
| Información extra          | `history()`,`turn()`,`inCheck()` |

---

Si quieres, puedo prepararte **una cheatsheet imprimible** o un **snippet de iniciación rápida** en TS para integrar chess.js con tu IA paso a paso. ¿Quieres? 😊
