# PENDING — candidatos para TODO.md

## SPEC 29 — Fab (2026-10-24)

- [duda] En `extended`, el `aria-label` repite el texto visible (opción tomada: mantenerlo, igual que el DS; inofensivo para lectores de pantalla).
- [pendiente] Anclar el Fab en `.l-screen__fab` (sobre `BottomNav`, área segura) cuando exista la composición de pantalla móvil.

## SPEC 30 — Menu (2026-10-24)

- [duda] Tras elegir un ítem, el DS no devuelve el foco al disparador (opción tomada: devolverlo, porque al desmontar el panel el foco se perdía).
- [duda] ↑ sin foco en un ítem: el DS salta al penúltimo por aritmética modular (opción tomada: ir al último).
- [sugerencia] Reposicionar el panel (`align` automático) cuando se sale del borde de la pantalla o del contenedor.
- [pendiente] Usar `app-menu` en AppBar y en las tarjetas de cita (EventCard/AgendaItem) cuando existan.
