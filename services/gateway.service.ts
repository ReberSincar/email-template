import { IncomingMessage, ServerResponse } from "http";
import { Context, ServiceBroker } from "moleculer";
import HTTPServer from "moleculer-web";

const brokerGateway = new ServiceBroker({
  nodeID: "gateway-node",
  transporter: "TCP",
  errorHandler(err, info) {
    this.logger.warn("Log the error:", info);
    throw err; // Throw further
  },
});

brokerGateway.createService({
  name: "gateway",
  mixins: [HTTPServer],
  settings: {
    routes: [
      {
        authorization: true,
        aliases: {
          "GET /templates": "templates.listTemplates",
          "GET /templates/:id": "templates.getTemplateById",
          "DELETE /templates/:id": "templates.deleteTemplateById",
          "POST /templates": "templates.createTemplate",
          "POST /templates/:id/generate": "templates.generateOutputResource",
          "GET /types": "types.listTemplateTypes",
          "GET /types/:id": "types.getTemplateTypeById",
          "DELETE /types/:id": "types.deleteTemplateTypeById",
          "POST /types": "types.createTemplateType",
        },
      },
    ],
  },
  methods: {
    authorize(
      ctx: Context,
      route: Record<string, undefined>,
      req: IncomingMessage,
      res: ServerResponse
    ) {
      // Read the token from header
      let auth = req.headers["authorization"];
      if (auth && auth.startsWith("Bearer")) {
        let token = auth.slice(7);

        // Check the token
        if (token == "Orema") {
          return Promise.resolve();
        } else {
          // Invalid token
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.writeHead(401);
          res.end(
            JSON.stringify({
              message: "Invalid Token",
              code: 401,
            })
          );
        }
      } else {
        // No token
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.writeHead(401);
        res.end(
          JSON.stringify({
            message: "No Token Provided",
            code: 401,
          })
        );
      }
    },
  },
});

export default brokerGateway;
