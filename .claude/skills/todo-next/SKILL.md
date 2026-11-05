---
name: todo-next
description: Completes the next unchecked item of TODO.md end to end (DS research, spec, one approval gate, implementation, tests, build, commit on spec branch). Semi-autonomous; non-blocking doubts go to PENDING.md.
disable-model-invocation: true
argument-hint: '[TODO.md item text | empty = next pending]'
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion, Artifact, Skill, Bash(git status:*), Bash(git branch:*), Bash(git checkout:*), Bash(git log:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(npx ng test:*), Bash(npm test:*), Bash(npm run build:*), Bash(diff:*), Bash(ls:*), Bash(cat:*), Bash(date:*), Bash(grep:*)
---

# /todo-next — Complete the next TODO.md item

## Session context

Date (use it in the spec and PENDING.md, never make it up):
!`date +%F`

Current branch:
!`git branch --show-current`

Working tree:
!`git status --short`

Existing specs:
!`ls specs/`

Next pending items:
!`grep -n '\- \[ \]' TODO.md | head -3`

---

**Semi-autonomous** flow: a single block of questions, a single gate (approve the spec), then the whole implementation without pauses. Anything non-blocking goes to `PENDING.md` instead of stopping you. One item per invocation.

Reply in Spanish. Follow `CLAUDE.md` (Agenda DS, EARS, demo-page, COMPONENTS.md, CSS) to the letter.

## Phase 0 — Preparation

1. Load the `caveman` and `ponytail` skills with the Skill tool if they are not loaded yet (`CLAUDE.md` rule).
2. If the working tree is not clean or the current branch is not `master`: stop, show the state and ask the user to resolve it. Do not stash or commit for them.

## Phase 1 — Pick the item

- If `$ARGUMENTS` has a value, find the matching `- [ ]` item in `TODO.md`. If it does not exist or is already checked, say so and stop.
- If it is empty, take the first `- [ ]` from the list above.
- Dependencies go in parentheses (e.g. `Menu (IconButton trigger, keyboard)`). Check that each cited component exists in `src/app/shared/components/` (see `COMPONENTS.md`). If one is missing, stop and propose the item that creates it first.
- Announce in one line which item you are going to do.

## Phase 2 — Research (without asking)

1. Agenda DS (`https://claude.ai/artifact/MdcHTrC5TjmKLyr6EiJbxe`) with Artifact `action: "read"` and `paths`:
   - `project/README.md` (if you have not read it in this session).
   - `project/api/components/<Comp>.md` if it exists; otherwise `project/components/<Comp>/README.md` + `preview.html`.
   - Block CSS: `project/assets/Code/styles/blocks/<block>.css` (and any composition/utilities it uses).
   - Never assume tokens or values: read them. The DS `project/tokens.css` is stale; `src/styles/tokens.css` rules.
2. Read the 2 most recent specs in `specs/` (format, language, headings, criteria style).
3. Read the most similar component in `src/app/shared/components/` (inputs, `host`, `data-*`, test, demo section) and its `COMPONENTS.md` entry to copy the pattern.
4. Check `PENDING.md` (if it exists) for entries affecting this item.

## Phase 3 — Questions (max. one block)

- Ask **only** what changes files or the public API (inputs/outputs, names, what is in or out of scope) and cannot be resolved by reading the DS or the code.
- A single AskUserQuestion, max. 4 questions, recommendation first with «(Recomendado)».
- If nothing is blocking, do not ask.
- Non-blocking: decide with the most conservative default, faithful to the DS, record it in the spec's decisions section and as `[question]` in `PENDING.md`.

## Phase 4 — Spec + approval gate

1. Number: highest in `specs/` + 1, two digits. Short kebab-case slug. File `specs/NN-slug.md`.
2. Structure and style identical to the latest specs (header `Status / Depends on / Date / Objective`, Scope In/Out, EARS requirements `R1…`, Data model, Implementation plan, Acceptance criteria as `- [ ]`, Decisions, Risks if applicable, What is not in this spec). Base template: `~/.claude/skills/spec/template.md`.
3. Mandatory criteria: `npm test -- --watch=false` passes with ≥1 test per requirement; `npm run build` without errors or budget warnings; local vs DS CSS `diff` without differences (if a block is copied); no `styles`/`styleUrl` in the component; section in `/demo` + index; entry in `COMPONENTS.md` (if a shared component is created or changed); item checked in `TODO.md`; no emojis or English UI copy.
4. Write it with `Status: Draft`.
5. Show a short summary (objective, scope in/out, requirements R1…, decisions taken without asking) and launch AskUserQuestion:
   - «Aprobar e implementar (Recomendado)»
   - «Cambiar algo» → apply what the user says (via «Other»/notes), rewrite and ask again.
   - «Abortar» → leave the spec in Draft, no branch, and stop.
6. Only after «Aprobar», change the status to `Approved`. **Never skip this gate.**

## Phase 5 — Implement without pauses

1. `git checkout -b spec-NN-slug` (or switch to it if it exists and check `git log` to resume).
2. Follow the whole spec plan, step by step, without asking for confirmation between steps.
3. Before writing CSS read `~/.claude/skills/css-guidelines/SKILL.md`. CSS block = literal copy of the DS in `src/styles/blocks/`, imported in `src/styles.css`. Never edit `src/styles/tokens.css` by hand.
4. Standalone component in `src/app/shared/components/<comp>/` (selector `app-…`, external template unless one line, signals, inputs mirroring the DS props, `data-*` for variants). Vitest test next to the component. Section in `src/app/demo/demo-page.html` (+ `.ts`) and in its index. Entry in `src/app/shared/components/COMPONENTS.md`.
5. If an ambiguity comes up: pick the most conservative / DS-faithful option, note it in `PENDING.md` as `[question] … (chosen option: …)` and continue. Stop only if continuing would contradict the approved spec: then ask.
6. Out-of-scope ideas or improvements spotted → `PENDING.md` (`[suggestion]` / `[pending]`), never in this branch's code.

## Phase 6 — Verify

1. `npx ng test --watch=false` and `npm run build`.
2. If they fail, fix and repeat (max. 3 rounds). If they still fail: stop, **no commit**, show the relevant output and record the blocker in `PENDING.md`.
3. Check each acceptance criterion against the real code; mark `[x]` only the verified ones.

## Phase 7 — Close

1. `TODO.md`: check the item `- [x] … (SPEC NN)`.
2. Spec: criteria checked and `Status: Implemented`.
3. Single commit on the branch, repo style:
   `feat: <summary in Spanish> (spec NN)` (or `fix:`/`refactor:` as appropriate), ending with the Co-Authored-By attribution line given by the system.
4. **No merges, no push, no remotes.**
5. Final report (concise):
   - Item and spec (`specs/NN-slug.md`), branch `spec-NN-slug`.
   - Files created/changed.
   - New entries in `PENDING.md`.
   - Next command: `git checkout master && git merge --no-ff spec-NN-slug`, then `/todo-next`.

## PENDING.md

Create it at the root if it does not exist. Only append, never delete or rewrite previous entries; promoting them to `TODO.md` is the user's call. It goes in the same commit as the item.

```markdown
# PENDING — candidates for TODO.md

## SPEC NN — <Comp> (YYYY-MM-DD)

- [question] <question> (chosen option: <what was done and why>)
- [suggestion] <out-of-scope improvement>
- [pending] <work left for another spec>
- [done] <resolved entry> (SPEC NN: <how>)
```

## Hard rules

- Never merge, push or create a remote.
- Never skip the spec approval gate.
- One item per invocation.
- Implement what the approved spec says; criteria changes go to the spec or `PENDING.md`, not to the code by surprise.
- UI copy in Spanish, tuteo, sentence case, 24 h, no emojis. Tokens only, no literal colors.
