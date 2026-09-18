import type { FastifyInstance } from "fastify";
import { calculateUptime } from "../domain/uptime.js";
import { monitorIdParamsSchema } from "./schemas.js";
import { NotFoundError } from "../errors.js";

export async function uptimeRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/monitors/:id/uptime",
    { schema: monitorIdParamsSchema },
    async (request) => {
      const { id } = request.params as { id: string };

      const monitorRepository = request.diScope.resolve("monitorRepository");
      const monitor = await monitorRepository.findOneBy({ id });

      if (!monitor) {
        throw new NotFoundError("Monitor not found");
      }

      const checkRepository = request.diScope.resolve("checkRepository");
      return calculateUptime(checkRepository, monitor.id);
    },
  );
}
