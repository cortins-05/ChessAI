# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog
and this project adheres to Semantic Versioning.

---

## [1.2.4] - 2026-02-11

### Fixed

- Corregido bug lógico en `piezasExpuestas`:

  - Se comparaban objetos `Pieza` por referencia en lugar de por `Square`.
  - El bucle anidado añadía piezas incorrectamente debido a una lógica invertida.
  - Ahora se usa comparación por casilla y `.some()` para evitar duplicados falsos.
- Corregida condición en `CortinsChessAlgorithmV1`:

  - `defensasPulidas` era siempre truthy al ser un array.
  - Ahora se valida correctamente con `defensasPulidas.length > 0`.
- Añadido manejo seguro de `chess.move()` en múltiples puntos donde podía lanzar `"invalid move"`:

  - `piezasExpuestas`
  - `quedaAtacadaTrasMover`
  - `FiltradoDefensaSecundario`
  - Ahora envuelto en `try/catch` con validación de retorno.

### Refactor

- Mejora interna en validación de estados intermedios tras simulaciones.
- Reducción de posibles inconsistencias al evaluar ataques/defensas tras movimientos simulados.

### Fixed (Typos)

- `Siguiento` → `Siguiendo`
- `defensaDepues` → `defensaDespues`

---
