import type { FastifyInstance } from "fastify";
import { monitorIdParamsSchema } from "./schemas.js";
import { NotFoundError } from "../errors.js";

const createMonitorSchema = {
  body: {
    type: "object",
    required: ["url", "intervalSeconds", "expectedStatusCode"],
    properties: {
      url: { type: "string", minLength: 1 },
      intervalSeconds: { type: "integer", minimum: 5 },
      expectedStatusCode: { type: "integer", minimum: 100, maximum: 599 },
    },
    additionalProperties: false,
  },
};

export async function monitorRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/monitors",
    { schema: createMonitorSchema },
    async (request, reply) => {
      const body = request.body as {
        url: string;
        intervalSeconds: number;
        expectedStatusCode: number;
      };

      const repository = request.diScope.resolve("monitorRepository");
      const monitor = repository.create(body);
      const saved = await repository.save(monitor);

      reply.code(201);
      return saved;
    },
  );

  app.get("/monitors", async (request) => {
    const repository = request.diScope.resolve("monitorRepository");
    return repository.find();
  });

  app.delete(
    "/monitors/:id",
    { schema: monitorIdParamsSchema },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const repository = request.diScope.resolve("monitorRepository");
      const result = await repository.delete({ id });

      if (result.affected === 0) {
        throw new NotFoundError("Monitor not found");
      }

      reply.code(204);
    },
  );
}
