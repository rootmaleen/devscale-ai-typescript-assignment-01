import { generateCompletion } from "@anvia/core";
import { Pipeline } from "@anvia/core/pipeline";
import { model } from "./models.js";
import {
  InputSchema,
  VerdictSchema,
  PITCH_INSTRUCTION,
  CEO_INSTRUCTION,
  ANALYST_INSTRUCTION,
  CTO_INSTRUCTION,
  MERGE_INSTRUCTION,
  review,
} from "./02-service.js";

// Idea Review Board
// PITCH -> [ CEO Review -> Analyst Review -> CTO Review ] -> Merge Decision
// Pakai parallel Fan-Out Fan-In

const ideaReviewBoard = new Pipeline({
  id: "idea-review-board",
  inputSchema: InputSchema,
})
  .step({
    id: "pitch",
    run: async (context) => {
      const result = await generateCompletion({
        model,
        instructions: PITCH_INSTRUCTION,
        prompt: `Raw idea: ${context.input.idea}`,
      });

      console.log("\nIDEA:\n", context.input.idea);
      console.log("\nPITCH:\n", result.output);
      return { idea: context.input.idea, pitch: result.output };
    },
  })
  .parallel({
    id: "review-board",
    branches: {
      ceo: review("ceo", CEO_INSTRUCTION),
      analyst: review("analyst", ANALYST_INSTRUCTION),
      cto: review("cto", CTO_INSTRUCTION),
    },
  })
  .step({
    id: "merge",
    run: async (context) => {
      const { ceo, analyst, cto } = context.input;

      const result = await generateCompletion({
        model,
        instructions: MERGE_INSTRUCTION,
        prompt: `
        <ceo-review>
        ${JSON.stringify(ceo)}
        </ceo-review>

        <analyst-review>
        ${JSON.stringify(analyst)}
        </analyst-review>

        <cto-review>
        ${JSON.stringify(cto)}
        </cto-review>
        `,
        outputSchema: VerdictSchema,
      });

      return { ceo, analyst, cto, board: result.output };
    },
  });

const result = await ideaReviewBoard.run({
  input: {
    idea: "Buat aplikasi untuk menemukan tukang servis elektronik dan pengguna.",
  },
});

console.log("\nCEO:\n", result.output.ceo);
console.log("\nANALYST:\n", result.output.analyst);
console.log("\nCTO:\n", result.output.cto);
console.log("\nBOARD DECISION:\n", result.output.board);
