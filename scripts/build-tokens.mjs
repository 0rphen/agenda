// Genera src/styles/tokens.css desde design-system/tokens.json (DS Agenda).
// Uso: npm run tokens
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = resolve(root, 'design-system/tokens.json');
const output = resolve(root, 'src/styles/tokens.css');

const json = JSON.parse(readFileSync(input, 'utf8'));

/** @type {Map<string, string>} */
const vars = new Map();

for (const group of Object.values(json)) {
  if (!Array.isArray(group?.tokens)) continue;
  for (const { name, value } of group.tokens) vars.set(`--${name}`, String(value));
}

for (const [key, value] of Object.entries(json.type?.families ?? {})) {
  vars.set(`--font-${key}`, value);
}

// Alias DTCG `{nombre}` → `var(--nombre)`; el token referido debe existir.
for (const [name, value] of vars) {
  const alias = /^\{([a-z0-9-]+)\}$/.exec(value);
  if (!alias) continue;
  assert.ok(vars.has(`--${alias[1]}`), `${name} referencia un token inexistente: ${value}`);
  vars.set(name, `var(--${alias[1]})`);
}

// Autocomprobación: falla si el DS cambia de forma.
for (const name of ['--color-brand', '--space-3xs', '--l-step-hover', '--font-sans', '--font-icon']) {
  assert.ok(vars.has(name), `Falta el token ${name}`);
}
for (const [name, value] of vars) {
  if (name === '--border-hairline' || name.startsWith('--shadow-')) continue;
  assert.ok(!/\dpx\b/.test(value), `${name} usa px: ${value}`);
}

const body = [...vars].map(([name, value]) => `  ${name}: ${value};`).join('\n');
const css = `/* Generado por scripts/build-tokens.mjs desde design-system/tokens.json — no editar */
:root {
${body}
}
`;

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, css);
console.log(`tokens.css: ${vars.size} tokens`);
