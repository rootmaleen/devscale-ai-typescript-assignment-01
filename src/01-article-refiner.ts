import { generateCompletion } from "@anvia/core";
import { Pipeline } from "@anvia/core/pipeline";
import { model } from "./models.js";
import {
  InputSchema,
  CritiqueSchema,
  DRAFT_INSTRUCTION,
  CRITIQUE_INSTRUCTION,
  REWRITE_INSTRUCTION,
} from "./01-service.js";

// Article Refiner
// Draft -> Critique -> Rewrite
// Pakai pipeline 3 step dan evaluator + optimizer

const articleRefiner = new Pipeline({
  id: "article-refiner",
  inputSchema: InputSchema,
})
  .step({
    id: "draft",
    run: async (context) => {
      const result = await generateCompletion({
        model,
        instructions: DRAFT_INSTRUCTION,
        prompt: `Topic: ${context.input.topic}`,
      });

      console.log("TOPIC:\n", context.input.topic);
      console.log("\nDRAFT:\n", result.output);
      return { draft: result.output };
    },
  })
  .step({
    id: "critique",
    run: async (context) => {
      const result = await generateCompletion({
        model,
        instructions: CRITIQUE_INSTRUCTION,
        prompt: `Article draft: ${context.input.draft}`,
        outputSchema: CritiqueSchema,
      });

      return {
        draft: context.input.draft,
        critique: result.output,
      };
    },
  })
  .step({
    id: "rewrite",
    run: async (context) => {
      const { draft, critique } = context.input;

      if (critique.pass) {
        return { article: draft, critique, revised: false };
      }

      const result = await generateCompletion({
        model,
        instructions: REWRITE_INSTRUCTION,
        prompt: `
        <draft>
        ${draft}
        </draft>

        <editor-feedback>
        ${critique.feedback}
        </editor-feedback>
        `,
      });

      return { draft, article: result.output, critique, revised: true };
    },
  });

const result = await articleRefiner.run({
  input: {
    topic: "Penyebab kebakaran hutan di Indonesia",
  },
});

console.log("\nCRITIQUE:\n", result.output.critique);
console.log("\nREVISED:\n", result.output.revised);
console.log("\nFINAL ARTICLE:\n", result.output.article);
