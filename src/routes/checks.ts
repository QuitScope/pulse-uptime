import type { FastifyInstance } from "fastify";
import { executeCheck } from "../domain/check-executor.js";
import { monitorIdParamsSchema } from "./schemas.js";
import { NotFoundError } from "../errors.js";

export async function checkRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/monitors/:id/checks",
    { schema: monitorIdParamsSchema },
    async (request) => {
      const { id } = request.params as { id: string };

      const monitorRepository = request.diScope.resolve("monitorRepository");
      const monitor = await monitorRepository.findOneBy({ id });

      if (!monitor) {
        throw new NotFoundError("Monitor not found");
      }

      const checkRepository = request.diScope.resolve("checkRepository");
      return checkRepository.find({
        where: { monitor: { id: monitor.id } },
        order: { checkedAt: "DESC" },
        take: 50,
      });
    },
  );

  app.post(
    "/monitors/:id/checks",
    { schema: monitorIdParamsSchema },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const monitorRepository = request.diScope.resolve("monitorRepository");
      const monitor = await monitorRepository.findOneBy({ id });

      if (!monitor) {
        throw new NotFoundError("Monitor not found");
      }

      const checkRepository = request.diScope.resolve("checkRepository");
      const incidentRepository = request.diScope.resolve("incidentRepository");

      const saved = await executeCheck(
        { checkRepository, incidentRepository },
        monitor,
      );

      reply.code(201);
      return saved;
    },
  );
}
