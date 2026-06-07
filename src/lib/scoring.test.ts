import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePoints } from "./scoring";

test("resultado exacto otorga 6 puntos", () => {
  assert.equal(calculatePoints(2, 1, 2, 1), 6);
  assert.equal(calculatePoints(1, 1, 1, 1), 6);
  assert.equal(calculatePoints(0, 0, 0, 0), 6);
});

test("acierto de ganador (sin marcador exacto) otorga 3 puntos", () => {
  assert.equal(calculatePoints(2, 1, 1, 0), 3); // gana local en ambos casos
  assert.equal(calculatePoints(1, 2, 0, 3), 3); // gana visitante en ambos casos
  assert.equal(calculatePoints(2, 2, 1, 1), 3); // empate en ambos casos (ningún marcador coincide)
});

test("le pegás a uno de los dos marcadores otorga 1 punto", () => {
  assert.equal(calculatePoints(2, 1, 1, 1), 1); // local gana vs empate, pero acertó goles del visitante
  assert.equal(calculatePoints(1, 1, 2, 1), 1); // empate vs gana local, pero acertó goles del local
  assert.equal(calculatePoints(0, 2, 2, 2), 1); // gana visitante vs empate, pero acertó goles del visitante
});

test("error total no otorga puntos", () => {
  assert.equal(calculatePoints(2, 1, 0, 0), 0);
  assert.equal(calculatePoints(1, 1, 2, 3), 0);
  assert.equal(calculatePoints(0, 2, 1, 0), 0);
});
