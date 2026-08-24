import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isoDateInMadrid,
  resolveFlexibleDate,
  shiftIsoDate,
} from './dateReference.js';

describe('dateReference (Europe/Madrid, reloj inyectable)', () => {
  it('formatea un instante a ISO local de Madrid', () => {
    // 23:30 UTC del 20-08 = 01:30 del 21-08 en Madrid (CEST).
    assert.equal(
      isoDateInMadrid(new Date('2026-08-20T23:30:00Z')),
      '2026-08-21',
    );
  });

  it('resuelve hoy y ayer con el reloj inyectado', () => {
    const now = () => new Date('2026-08-21T12:00:00Z'); // 14:00 Madrid
    assert.equal(resolveFlexibleDate('hoy', now), '2026-08-21');
    assert.equal(resolveFlexibleDate('ayer', now), '2026-08-20');
    assert.equal(resolveFlexibleDate(undefined, now), '2026-08-21');
  });

  it('pasa sin cambios una fecha ISO explícita', () => {
    const now = () => new Date('2026-08-21T12:00:00Z');
    assert.equal(resolveFlexibleDate('2026-03-02', now), '2026-03-02');
  });

  it('cruza correctamente el cambio de hora (DST) de marzo', () => {
    // Noche del 28 al 29-03-2026: CET (UTC+1) → CEST (UTC+2).
    const beforeJump = new Date('2026-03-29T00:30:00Z'); // 01:30 local, día 29
    assert.equal(isoDateInMadrid(beforeJump), '2026-03-29');
    assert.equal(shiftIsoDate('2026-03-29', -1), '2026-03-28');
    const afterJump = new Date('2026-03-29T23:59:00Z'); // 01:59 del día 30
    assert.equal(isoDateInMadrid(afterJump), '2026-03-30');
  });
});
