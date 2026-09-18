import type { FastifyInstance } from "fastify";
import { monitorIdParamsSchema } from "./schemas.js";
import { NotFoundError } from "../errors.js";

export async function incidentRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/monitors/:id/incidents",
    { schema: monitorIdParamsSchema },
    async (request) => {
      const { id } = request.params as { id: string };

      const monitorRepository = request.diScope.resolve("monitorRepository");
      const monitor = await monitorRepository.findOneBy({ id });

      if (!monitor) {
        throw new NotFoundError("Monitor not found");
      }

      const incidentRepository = request.diScope.resolve("incidentRepository");
      return incidentRepository.find({
        where: { monitor: { id: monitor.id } },
        order: { startedAt: "DESC" },
      });
    },
  );
}
