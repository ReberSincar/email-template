import { ServiceBroker } from "moleculer";
import env from "../config/env";
import { AppDataSource } from "../entities/connection";
import { TemplateType } from "../entities/template_type";

const brokerType = new ServiceBroker({
  nodeID: "type-node",
  transporter: "TCP",
  cacher: {
    type: "Redis",
    options: {
      // Redis settings
      redis: env.redis,
    },
  },
});

brokerType.createService({
  name: "types",
  actions: {
    createTemplateType: {
      async handler(ctx) {
        const { name } = ctx.params;
        const templateType = await AppDataSource.manager.save(TemplateType, {
          name,
        });
        await brokerType.cacher.clean("types.listTemplateTypes**");
        ctx.meta.$statusCode = 200;
        return { template_type: templateType };
      },
    },
    listTemplateTypes: {
      cache: true,
      async handler(ctx) {
        const allTemplateTypes = await AppDataSource.manager.find(TemplateType);
        ctx.meta.$statusCode = 200;
        return { template_types: allTemplateTypes };
      },
    },
    getTemplateTypeById: {
      cache: true,
      async handler(ctx) {
        const { id } = ctx.params;
        const templateType = await AppDataSource.manager.findOneBy(
          TemplateType,
          {
            id: id,
          }
        );
        if (!templateType) {
          ctx.meta.$statusCode = 404;
          return { message: "Template type not found" };
        }
        ctx.meta.$statusCode = 200;
        return { template_type: templateType };
      },
    },
    deleteTemplateTypeById: {
      async handler(ctx) {
        const { id } = ctx.params;
        const template = await AppDataSource.manager.findOneBy(TemplateType, {
          id: id,
        });
        if (!template) {
          ctx.meta.$statusCode = 404;
          return { message: "Template type not found" };
        }

        await AppDataSource.manager.delete(TemplateType, {
          id: ctx.params.id,
        });

        await brokerType.cacher.clean([
          "types.listTemplateTypes**",
          `types.getTemplateTypeById:id|${id}`,
        ]);

        ctx.meta.$statusCode = 200;
        return { message: "Template type deleted" };
      },
    },
  },
});

export default brokerType;
