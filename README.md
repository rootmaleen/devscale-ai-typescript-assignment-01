# Assignment 01

- Nama : Alin M
- Program : AI Product Engineering with Typescript
- Batch : 2
- Assignment Number : 1

## Assignment

| File | Pattern | Alur |
| --- | --- | --- |
| `src/01-article-refiner.ts` | Evaluator + optimizer | `draft -> critique -> rewrite`. Editor menilai draft berdasarkan kriteria yang ada. Rewrite hanya dijalankan kalau kriteria tidak lolos. |
| `src/02-idea-review-board.ts` | Parallel (fan-out / fan-in) | `pitch -> [CEO - Analyst - CTO] -> merge`. Tiga sub-pipeline menilai pitch secara paralel, lalu digabung jadi satu keputusan. |
| `src/03-ticket-triage.ts` | Typed handoff + routing | `extract -> schema -> route`. Tiket diekstrak ke schema (title, priority, summary, reason), lalu balasan dipilih berdasarkan prioritas. |

## Setup

```bash
pnpm install
cp .env.example .env
```

## Run

```bash
pnpm tsx src/01-article-refiner.ts
pnpm tsx src/02-idea-review-board.ts
pnpm tsx src/03-ticket-triage.ts
```

## Stack

- [`@anvia/core`](https://www.npmjs.com/package/@anvia/core) — completions, pipelines, structured output
- [`@anvia/openai`](https://www.npmjs.com/package/@anvia/openai) — OpenAI-compatible client
- [`zod`](https://zod.dev) — output schemas
- `tsx` + TypeScript (strict, ESM)
