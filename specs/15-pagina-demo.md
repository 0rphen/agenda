# SPEC 15 — Página demo de componentes

> **Status:** Implemented
> **Depends on:** SPEC 02, SPEC 03, SPEC 04, SPEC 05, SPEC 06, SPEC 07, SPEC 10, SPEC 11, SPEC 12, SPEC 13, SPEC 14
> **Date:** 2026-10-23
> **Objective:** Crear la ruta `/demo`, solo en modo desarrollo, con una página `DemoPage` que muestra en secciones la matriz de variantes y estados de cada componente de `src/app/shared/`, y fijar en `CLAUDE.md` que cada spec de componente futuro añade su sección.

## Scope

**In:**

- `src/app/demo/demo-page.ts` + `demo-page.html` + `demo-page.css` — componente `DemoPage`, selector `app-demo-page`.
- Ruta lazy `demo` en `src/app/app.routes.ts`, presente solo si `isDevMode()`.
- Una `<section id="…">` por componente existente: Icon, Spinner, Badge, Avatar + AvatarGroup, Progress, Skeleton + SkeletonList, Button, ButtonLink, TextField, TextareaField, SelectField, DateField, TimeField, NumberField.
- `<nav>` índice con anclas a cada sección.
- Fields conectados con Signal Forms (`form`, `FormField`), validadores (`required`, `email`, `min`, `max`, `phone`, `dniNie`) y `fieldError`.
- `demo-page.spec.ts` (smoke test).
- Regla nueva en `CLAUDE.md` y entrada en `TODO.md`.
- Corregir los fallos de componentes de `src/app/shared/` que la demo saque a la luz, cada uno con un test de regresión.

**Out of scope (para specs futuros):**

- Controles en vivo / playground para cambiar props.
- Subrutas por componente.
- Excluir el código de la demo del bundle de producción (`fileReplacements`): basta con que la ruta no exista.
- Secciones de componentes aún no creados (IconButton, Checkbox…): las añade cada spec.
- Composición `.l-stack`/`.l-cluster` del DS.
- Tests visuales o de capturas.

## Requisitos (EARS)

- **R1.** Mientras `isDevMode()` sea `true`, `app.routes.ts` deberá registrar la ruta `demo` con `loadComponent` hacia `DemoPage`.
- **R2.** Mientras `isDevMode()` sea `false`, `app.routes.ts` no deberá registrar la ruta `demo`, y el prerender de producción no deberá generar `/demo`.
- **R3.** La `DemoPage` deberá renderizar un `<h1>` con el texto «Componentes».
- **R4.** La `DemoPage` deberá renderizar una `<section>` por componente, con `id` en kebab-case del componente (`icon`, `spinner`, `badge`, `avatar`, `progress`, `skeleton`, `button`, `button-link`, `text-field`, `textarea-field`, `select-field`, `date-field`, `time-field`, `number-field`) y un `<h2>` con su nombre.
- **R5.** La `DemoPage` deberá renderizar un `<nav aria-label="Componentes">` con un enlace `href="demo#<id>"` por cada sección de R4, en el mismo orden (relativo a `<base href="/">`: `#<id>` a secas resolvería a `/#<id>`).
- **R6.** Cada sección de componente visual (Icon…ButtonLink) deberá mostrar a la vez cada valor de sus inputs de variante (`variant`, `size`, `tone`, `category`, `shape`…) y sus estados (`disabled`, `loading`, `filled`, `dot`…) según los types de su `.ts`.
- **R7.** Cada sección de field deberá mostrar el field vacío, con valor, con `hint`, con `icon` (donde exista) y `disabled`.
- **R8.** Los fields deberán enlazarse con `[formField]` a un único `form()` de Signal Forms declarado en `DemoPage`, con al menos un validador por field (`required` en todos; además `email` en TextField correo, `phone` en TextField teléfono, `dniNie` en TextField DNI, `min`/`max` en NumberField).
- **R9.** Cuando un field con error queda `touched`, la `DemoPage` deberá pasarle `[error]="fieldError(…)"` y el field deberá mostrar el mensaje.
- **R10.** El copy de la página deberá estar en español, tuteo, sentence case, horas 24 h, sin emojis.
- **R11.** `demo-page.css` deberá usar solo tokens, unidades relativas y propiedades lógicas, sin colores literales, y no deberá superar el budget de estilos de componente (warn 4 kB).
- **R12.** `CLAUDE.md` deberá incluir la regla: «Todo spec que crea o cambia un componente de `src/app/shared/` deberá añadir o actualizar su sección en `src/app/demo/demo-page.html` y listarlo en su plan y criterios de aceptación».
- **R13.** Si al montar la demo un componente de `src/app/shared/` no cumple su spec, el DS Agenda o lanza error en consola, entonces se deberá corregir en el propio componente (no con un parche en la demo) y añadir un test en su `*.spec.ts` que falle sin la corrección.
- **R14.** Cada fallo corregido deberá quedar listado en la sección «Fallos corregidos» de este spec (componente, síntoma, causa, test).

## Fallos corregidos

- **SelectField** — *Síntoma:* con `value` vacío (o sin opción que coincida) el control mostraba la primera opción como elegida mientras el form la daba por vacía (`required` fallaba sobre un campo aparentemente lleno), y elegir esa primera opción no emitía `change`, así que era inalcanzable. *Causa:* un `<select>` nativo sin opción seleccionada selecciona la primera. *Corrección:* `select.html` renderiza `<option value="" disabled hidden selected>` mientras ninguna opción coincide con `value` (`hasMatch` en `select.ts`). *Test:* `select.spec.ts` › «SPEC 15: sin value que coincida no muestra la primera opción como elegida y elegirla emite».

## Data model

```ts
// src/app/demo/demo-page.ts
// selector: 'app-demo-page' · templateUrl: './demo-page.html' · styleUrl: './demo-page.css'
// imports: Icon, Spinner, Badge, Avatar, AvatarGroup, Progress, Skeleton, SkeletonList,
//          Button, ButtonLink, TextField, TextareaField, SelectField, DateField, TimeField,
//          NumberField, FormField
interface DemoModel {
  name: string;      // TextField, required
  mail: string;      // TextField type="email", required + email
  phone: string;     // TextField type="tel", required + phone
  dni: string;       // TextField, required + dniNie
  notes: string;     // TextareaField, required
  calendar: string;  // SelectField, required
  date: string;      // DateField, required
  time: string;      // TimeField, required
  guests: number | null; // NumberField, required + min 1 + max 20
}
// readonly model = signal<DemoModel>({ …vacío… })
// readonly demoForm = form(this.model, (path) => { … })
// protected readonly fieldError = fieldError
// Datos de muestra (personas de AvatarGroup, opciones de SelectField) como constantes en el .ts.
```

```ts
// src/app/app.routes.ts
export const routes: Routes = [
  ...(isDevMode()
    ? [{ path: 'demo', loadComponent: () => import('./demo/demo-page').then((m) => m.DemoPage) }]
    : []),
];
```

## Implementation plan

1. Leer `~/.claude/skills/css-guidelines/SKILL.md` (regla global). Crear `DemoPage` vacío con `<h1>`, ruta dev-only en `app.routes.ts` (R1–R3). `npm start` + `/demo` muestra el título.
2. Secciones visuales: Icon, Spinner, Badge, Avatar + AvatarGroup, Progress, Skeleton + SkeletonList, Button, ButtonLink, con matriz de variantes/estados (R4, R6). `demo-page.css` mínimo: espaciado entre secciones y fila con `flex-wrap` para variantes (R11).
3. Secciones de fields con `form()`, validadores de `@angular/forms/signals` y `validators.ts`, `[error]="fieldError(…)"` (R4, R7–R9).
4. `<nav>` índice con anclas (R5).
5. `demo-page.spec.ts`: renderiza sin errores, `<h1>`, una `<section>` por id de R4 con `<h2>`, enlaces del `<nav>` coinciden con los ids; marcar un field como touched vacío muestra «Completa este campo» (R3–R5, R9).
6. Revisar `/demo` en navegador (Playwright) contra el DS y la consola. Por cada fallo: test que falla en el `*.spec.ts` del componente, corrección en el componente o su bloque CSS, apuntarlo en «Fallos corregidos» (R13, R14).
7. Regla en `CLAUDE.md` (R12). En `TODO.md`, en «0. Fundación», añadir `- [x] Página demo /demo (SPEC 15)`.
8. `npm test -- --watch=false` y `npm run build` en verde; comprobar que `dist/calendar/browser/demo` no existe (R2).

## Acceptance criteria

- [x] `npm start` y abrir `http://localhost:4200/demo` muestra «Componentes», el índice y las 14 secciones (R1, R3–R5).
- [x] Cada enlace del índice salta a su sección (R5).
- [x] Cada sección visual muestra todos los valores de sus types de variante y sus estados (R6).
- [x] Escribir `correo@` en el TextField de correo y salir del campo muestra «Escribe un correo válido, p. ej. nombre@dominio.es» (R8, R9).
- [x] Vaciar un field required y salir muestra «Completa este campo» (R9).
- [x] `npm run build` termina sin errores ni warnings de budget, y `dist/calendar/browser/demo/` no existe (R2, R11).
- [x] `npm test -- --watch=false` pasa, incluido `demo-page.spec.ts`.
- [x] `demo-page.css` sin colores literales ni `px` (salvo `border-hairline`), con propiedades lógicas (R11).
- [x] `CLAUDE.md` contiene la regla de R12; `TODO.md` tiene la entrada de SPEC 15.
- [x] Copy en español, sin emojis (R10).
- [x] `/demo` sin errores ni warnings en la consola del navegador (R13).
- [x] Cada fallo de «Fallos corregidos» tiene su test de regresión en verde y la corrección vive en el componente, no en la demo (R13, R14).

## Decisions

- **Sí:** `/demo` solo en dev con `isDevMode()` en `app.routes.ts`. **No:** `fileReplacements` de environment: más config; el chunk lazy sin ruta no se carga nunca.
- **Sí:** una sola página con una `<section>` por componente e índice de anclas. **No:** subruta por componente: más ficheros y rutas para el mismo fin.
- **Sí:** matriz estática de variantes. **No:** playground con controles en vivo: mucho código, poco valor ahora.
- **Sí:** `styleUrl` propio (`demo-page.css`) para el layout de la demo. **No:** bloque global `demo.css` (se enviaría a prod) ni traer `.l-stack`/`.l-cluster` aún (llegan con el primer consumidor real). Excepción consciente a «block CSS global».
- **Sí:** fields con Signal Forms reales, validadores y `fieldError`: la demo prueba también la integración de validación. **No:** solo `model` local.
- **Sí:** `src/app/demo/` fuera de `shared/`: no es reutilizable. **No:** abrir `src/app/pages/` todavía.
- **Sí:** anclas `href="demo#<id>"`, relativas a `<base href="/">`. **No:** `href="#<id>"` (resuelve a `/#<id>` y sale de la página) ni `routerLink` + `fragment` (exige `anchorScrolling` en la config global del router).
- **Sí:** smoke test. **No:** tests visuales.
- **Sí:** regla en `CLAUDE.md` para que cada spec de componente mantenga la demo.
- **Sí:** corregir en este spec los fallos de componentes que destape la demo, en el componente y con test. **No:** parches en la demo ni un spec por fallo.

## Risks

| Riesgo | Mitigación |
| --- | --- |
| La demo queda desfasada al cambiar un componente | Regla R12 en `CLAUDE.md`; cada spec la cita en su plan. |
| `demo-page.css` crece y supera el budget de 4 kB | Solo layout mínimo; si crece, traer composición del DS en su spec. |
| `isDevMode()` es `true` en tests y `false` en prerender: comportamiento distinto por entorno | Es lo buscado; criterio de aceptación comprueba `dist/` sin `/demo`. |
| Chunk lazy de la demo se emite igualmente en prod | Aceptado: nadie lo referencia ni lo carga. |
| Un fallo destapado es grande (rediseño de componente) y dispara el alcance | Si la corrección cambia la API pública del componente, se apunta en `TODO.md` y va a spec propio. |

## What is **not** in this spec

- Playground, subrutas, `fileReplacements`, secciones de componentes futuros, composición `.l-*`, tests visuales.
