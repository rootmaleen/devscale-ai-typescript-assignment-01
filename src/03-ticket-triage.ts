import { generateCompletion } from "@anvia/core";
import { Pipeline } from "@anvia/core/pipeline";
import { model } from "./models.js";
import {
  InputSchema,
  TicketSchema,
  EXTRACT_INSTRUCTION,
  PRIORITY_ROUTING_INSTRUCTION,
} from "./03-service.js";

// Ticket Triage
// Ticket -> Schema -> Route
// Pakai Typed Handoffs untuk ekstrak input sesuai schema, routing berdasarkan prioritas. Disini routing hanya untuk instructions saja. Di real case bisa buat function untuk menampung action lain yang dibutuhkan.

const ticketTriage = new Pipeline({
  id: "ticket-triage",
  inputSchema: InputSchema,
})
  .step({
    id: "extract",
    run: async (context) => {
      const result = await generateCompletion({
        model,
        instructions: EXTRACT_INSTRUCTION,
        prompt: `Customer ticket: ${context.input.ticket}`,
        outputSchema: TicketSchema,
      });

      return result.output;
    },
  })
  .step({
    id: "route",
    run: async (context) => {
      const ticket = context.input;
      const instruction = PRIORITY_ROUTING_INSTRUCTION[ticket.priority];
      const result = await generateCompletion({
        model,
        instructions: instruction,
        prompt: `Customer ticket details: ${JSON.stringify(ticket)}`,
      });

      return {
        ticket,
        response: result.output,
      };
    },
  });

const result = await ticketTriage.run({
  input: {
    ticket: `Saya sudah bayar langganan Pro dua hari lalu dan uangnya sudah
    terpotong, tapi akun saya masih terkunci di plan Free. Tim saya tidak bisa
    kerja sama sekali. Tolong secepatnya.`,
  },
});

console.log("TICKET:\n", result.output.ticket);
console.log("\nRESPONSE TO CUSTOMER:\n", result.output.response);
