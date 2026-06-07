import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePoints } from "./scoring";

test("resultado exacto otorga 3 puntos", () => {
  assert.equal(calculatePoints(2, 1, 2, 1), 3);
  assert.equal(calculatePoints(1, 1, 1, 1), 3);
  assert.equal(calculatePoints(0, 0, 0, 0), 3);
});

test("acierto de ganador (sin marcador exacto) otorga 1 punto", () => {
  assert.equal(calculatePoints(2, 1, 1, 0), 1); // gana local en ambos casos
  assert.equal(calculatePoints(1, 2, 0, 3), 1); // gana visitante en ambos casos
  assert.equal(calculatePoints(1, 1, 0, 0), 1); // empate en ambos casos
  assert.equal(calculatePoints(1, 1, 2, 2), 1); // empate en ambos casos
});

test("error total no otorga puntos", () => {
  assert.equal(calculatePoints(2, 1, 1, 1), 0); // local gana vs empate
  assert.equal(calculatePoints(1, 1, 2, 1), 0); // empate vs gana local
  assert.equal(calculatePoints(0, 2, 1, 0), 0); // gana visitante vs gana local
});
