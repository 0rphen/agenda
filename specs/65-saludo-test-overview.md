# SPEC 65 — Overview: test del saludo independiente de la hora

> **Status:** Implemented
> **Depends on:** SPEC 59 (OverviewPage, R9/R11/R27)
> **Date:** 2026-10-27
> **Objective:** Que el test de saludo de `OverviewPage` pase a cualquier hora, casando los tres saludos exactos y cubriendo cada franja con reloj fijo.

## Scope

**In:**

- `src/app/features/overview/pages/overview-page/overview-page.spec.ts`:
  - Test «R9, R27»: regex `/^(Buenos días|Buenas tardes|Buenas noches), César$/`.
  - Nuevo `it.each` con reloj fijo (`vi.useFakeTimers({ toFake: ['Date'] })` + `vi.setSystemTime`) a las 09:00, 15:00 y 22:00: `h1.page-title` = saludo exacto.
- Marcar el ítem en `TODO.md`.

**Out of scope:**

- `overview.facade.ts` (lógica de `greeting` sin cambio).
- `overview.facade.spec.ts` (R11 ya cubre las franjas a nivel facade).
- `/demo`: no toca componentes de `shared/components/`.
- Ítem MonthView `data-selected` de `TODO.md` (otro spec).

## Requisitos (EARS)

- **R1.** El test «R9, R27» de `overview-page.spec.ts` deberá aceptar solo «Buenos días, César», «Buenas tardes, César» o «Buenas noches, César» en `h1.page-title`, sea cual sea la hora real.
- **R2.** Cuando el reloj marca las 09:00, el `h1.page-title` de `OverviewPage` deberá ser «Buenos días, César».
- **R3.** Cuando el reloj marca las 15:00, el `h1.page-title` deberá ser «Buenas tardes, César».
- **R4.** Cuando el reloj marca las 22:00, el `h1.page-title` deberá ser «Buenas noches, César».
- **R5.** Los tests con reloj fijo deberán restaurar el reloj real al terminar (`vi.useRealTimers()`), sin afectar al resto de la suite.

## Data model

Sin datos nuevos.

```ts
// overview-page.spec.ts (+), patrón de overview.facade.spec.ts
describe('saludo con reloj fijo', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['Date'] }));
  afterEach(() => vi.useRealTimers());

  it.each([
    [9, 'Buenos días, César'],
    [15, 'Buenas tardes, César'],
    [22, 'Buenas noches, César'],
  ])('R2–R4: a las %s h el título es «%s»', (hour, greeting) => {
    vi.setSystemTime(new Date(2026, 9, 22, hour));
    const { fixture, el } = setup();
    fixture.detectChanges();
    expect(text(el.querySelector('h1.page-title'))).toBe(greeting);
  });
});
```

`setSystemTime` va antes de `setup()`: `OverviewFacade.nowState` toma `new Date()` al construirse.

## Implementation plan

1. Cambiar la regex del test «R9, R27» (R1).
2. Añadir el `describe` con `it.each` de reloj fijo (R2–R5).
3. `npx ng test --include src/app/features/overview/pages/overview-page/overview-page.spec.ts --watch=false` en verde; R1 comprobado también con `vi.setSystemTime` a las 08:00 de forma temporal (o ejecutando antes de las 12:00).
4. `npm test -- --watch=false` y `npm run build` en verde; marcar `TODO.md`.

## Acceptance criteria

- [x] Regex del test «R9, R27» es la alternancia de los tres saludos; sin `\w` (R1).
- [x] Test con reloj a 09:00: «Buenos días, César» (R2).
- [x] Test con reloj a 15:00: «Buenas tardes, César» (R3).
- [x] Test con reloj a 22:00: «Buenas noches, César» (R4).
- [x] `afterEach` restaura timers reales; resto de la suite intacto (R5).
- [x] `overview.facade.ts` sin cambios.
- [x] `npm test -- --watch=false` y `npm run build` sin errores ni warnings.
- [x] `TODO.md`: ítem del test de saludo marcado.

## Decisions

- **Sí:** alternancia explícita (respuesta del usuario): valida los textos exactos. **No:** `\S+` (propuesta del TODO): pasa con cualquier palabra.
- **Sí:** 3 casos con reloj fijo en el test de página (respuesta del usuario): comprueba el render del saludo en cada franja. Solapa en parte con `overview.facade.spec.ts` R11 (facade); se acepta porque aquí se verifica el DOM.
- **Sí:** fakear solo `Date` (`toFake: ['Date']`), como `overview.facade.spec.ts`: no rompe `whenStable` ni promesas.
- **No:** inyectar reloj en el facade: cambio de producción innecesario para un bug de test.
