import { ServiceBroker } from "moleculer";
import env from "../config/env";
import sesClient from "../aws_services/ses.client";
import { AppDataSource } from "../entities/connection";
import { Template } from "../entities/template";
import { TemplateType } from "../entities/template_type";

const brokerTemplate = new ServiceBroker({
  nodeID: "template-node",
  transporter: "TCP",
  cacher: {
    type: "Redis",
    options: {
      // Redis settings
      redis: env.redis,
    },
  },
});

brokerTemplate.createService({
  name: "templates",
  actions: {
    listTemplates: {
      cache: true,
      async handler(ctx) {
        // Template List Resource [HTTP GET]
        // 1. Request should be parameterized to allow Template Type filtering
        // 2. Each returned template should be marked with a unique identifier (uuid, etc)
        // 3. Each returned template should be cached into Redis environment for future access

        console.log("listTemplates Handler run");
        const { type } = ctx.params;

        // Check template type exist
        if (type) {
          const templateType = await AppDataSource.manager.findOneBy(
            TemplateType,
            {
              id: type,
            }
          );
          if (!templateType) {
            ctx.meta.$statusCode = 404;
            return {
              message: "Template type not found",
            };
          }
        }

        const templates = await AppDataSource.manager.find(Template, {
          where: type
            ? {
                templateTypeId: type,
              }
            : null,
          relations: {
            type: true,
          },
        });
        ctx.meta.$statusCode = 200;
        return { templates };
      },
    },
    getTemplateById: {
      cache: true,
      async handler(ctx) {
        // Single Template Resource [HTTP GET]
        // 1. Request should be made with it's identifier
        // 2. Requested template should be returned over Redis (previously cached copy of
        // the product)
        const { id } = ctx.params;
        const template = await AppDataSource.manager.findOne(Template, {
          where: {
            id: id,
          },
          relations: {
            type: true,
          },
        });
        if (!template) {
          ctx.meta.$statusCode = 404;
          return { message: "Template not found" };
        }
        ctx.meta.$statusCode = 200;
        return { template };
      },
    },
    deleteTemplateById: {
      async handler(ctx) {
        // Delete Template Resource [HTTP DELETE]
        // 1. Request should be made with it's identifier
        // remove template from db and redis
        const { id } = ctx.params;
        const template = await AppDataSource.manager.findOne(Template, {
          where: {
            id: id,
          },
        });
        if (!template) {
          ctx.meta.$statusCode = 404;
          return { message: "Template not found" };
        }

        await AppDataSource.manager.delete(Template, {
          id: id,
        });

        await brokerTemplate.cacher.clean([
          "templates.listTemplates**",
          `templates.getTemplateById:id|${id}`,
        ]);

        await sesClient.deleteTemplate({
          templateName: template.name,
        });

        ctx.meta.$statusCode = 200;
        return { message: "Template deleted" };
      },
    },
    createTemplate: {
      async handler(ctx) {
        // Create Template Resource [HTTP POST]
        // 1. Request contains template string as html or text format
        // 2. Dynamic parameters should be specified like ${variable_name}
        // 3. Request payload should be configured as a json body

        const { html, text, subject, name, type_id } = ctx.params;

        // Check template exist
        const type = await AppDataSource.manager.findOneBy(TemplateType, {
          id: type_id,
        });
        if (!type) {
          ctx.meta.$statusCode = 404;
          return {
            message: "Template type not found",
          };
        }

        if (type.id == 1 && !html) {
          ctx.meta.$statusCode = 406;
          return {
            message: "If you send type html, html variable must be provided",
          };
        }

        if (type.id == 2 && !text) {
          ctx.meta.$statusCode = 406;
          return {
            message: "If you send type text, text variable must be provided",
          };
        }

        const template = await AppDataSource.manager.save(Template, {
          name,
          html,
          subject,
          text,
          type: type,
        });

        await brokerTemplate.cacher.clean("templates.listTemplates**");

        await sesClient.createTemplate({
          templateName: name,
          htmlPart: html,
          subjectPart: subject,
          textPart: text,
        });

        ctx.meta.$statusCode = 200;
        return { template };
      },
    },
    generateOutputResource: {
      async handler(ctx) {
        // Generate Output Resource [HTTP POST]
        // 1. Request should be made with it's identifier
        // 2. Request payload should be configured as a json body

        const { id, parameters } = ctx.params;
        const template = await AppDataSource.manager.findOneBy(Template, {
          id: id,
        });
        if (!template) {
          ctx.meta.$statusCode = 404;
          return { message: "Template not found" };
        }

        // Replace variables
        const keys = Object.keys(parameters);
        for (let index = 0; index < keys.length; index++) {
          const element = keys[index];
          const regex = `\$\{${element}\}`;
          if (template.html) {
            template.html = template.html.replace(regex, parameters[element]);
          }
          if (template.text) {
            template.text = template.text.replace(regex, parameters[element]);
          }
          template.subject = template.subject.replace(
            regex,
            parameters[element]
          );
        }
        ctx.meta.$statusCode = 200;
        return { template };
      },
    },
  },
});

export default brokerTemplate;
