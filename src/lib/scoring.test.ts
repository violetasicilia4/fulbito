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
  assert.equal(calculatePoints(1, 1, 0, 0), 3); // empate en ambos casos
  assert.equal(calculatePoints(1, 1, 2, 2), 3); // empate en ambos casos
});

test("error total no otorga puntos", () => {
  assert.equal(calculatePoints(2, 1, 1, 1), 0); // local gana vs empate
  assert.equal(calculatePoints(1, 1, 2, 1), 0); // empate vs gana local
  assert.equal(calculatePoints(0, 2, 1, 0), 0); // gana visitante vs gana local
});
