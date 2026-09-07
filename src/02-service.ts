import { generateCompletion } from "@anvia/core";
import { Pipeline } from "@anvia/core/pipeline";
import { model } from "./models.js";
import z from "zod";

// Schema, instruction, dan shared function untuk 02-idea-review-board.

export const InputSchema = z.object({
  idea: z.string(),
});

export const PitchSchema = z.object({
  idea: z.string(),
  pitch: z.string(),
});

export const VerdictSchema = z.object({
  verdict: z.enum(["go", "no-go"]),
  reasons: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const PITCH_INSTRUCTION = `
  You are a startup founder preparing to face a review board.
  Turn the raw idea into a short pitch with maximum 100 words.
  `;

const REVIEW_INSTRUCTION = `
  You sit on a startup review board. Judge the pitch from your angle only.

  <guidelines>
  - Judge the pitch as written. Do not invent facts it does not state.
  - reasons: 3-4 items, each one sentence naming a concrete risk or strength.
  - If the pitch is silent on something you need, say so and count it against it.
  - no-go if any concern in your lens is a dealbreaker you cannot mitigate.
  - Give 3 suggestion what user need to do about the idea
  </guidelines>
  `;

export const CEO_INSTRUCTION = `
  ${REVIEW_INSTRUCTION}

  <lens>
  CEO: is this worth betting the company on?
  - Problem: is the pain real, urgent, and worth paying to remove?
  - Wedge: why this team, why now, what is the unfair advantage?
  - Model: who pays, how much, and do the unit economics survive scale?
  - Focus: is the scope small enough to ship and learn fast?
  </lens>
  `;

export const ANALYST_INSTRUCTION = `
  ${REVIEW_INSTRUCTION}

  <lens>
  Analyst: do the market and the numbers support it?
  - Market: size, growth, and whether the segment is actually reachable.
  - Competition: existing alternatives, including the customer doing nothing.
  - Evidence: proof that demand exists, not assertions that it does.
  - Revenue path: cost to acquire a customer against what one is worth.
  </lens>
  `;

export const CTO_INSTRUCTION = `
  ${REVIEW_INSTRUCTION}

  <lens>
  CTO: can we build it and keep it running?
  - Core build: the hardest piece, and whether it is solved work or research.
  - Effort: what a usable MVP costs in people and months.
  - Dependencies: third parties, data, or integrations we do not control.
  - Operations: trust, safety, and cost as usage grows.
  </lens>
  `;

export const MERGE_INSTRUCTION = `
  You are the board chair. You received three independent verdicts on one pitch.
  Merge them into a single decision. Your task is to give review base on your expertise and add following information:

  - Is this idea good to build ?
  - Need more Review ?
  - Give 3 suggestion what user need to do about the idea
  - Include summary of 3 perspective as well.
  - Include the final verdict of go or no-go.
  `;

export const review = (id: string, instructions: string) => {
  return new Pipeline({
    id: `${id}-review`,
    inputSchema: PitchSchema,
  }).step({
    id: `${id}-verdict`,
    run: async (context) => {
      const result = await generateCompletion({
        model,
        instructions,
        prompt: `Startup pitch: ${context.input.pitch}`,
        outputSchema: VerdictSchema,
      });

      return result.output;
    },
  });
}
