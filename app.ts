import { exit } from "process";
import gatewayService from "./services/gateway.service";
import templateService from "./services/template.service";
import typeService from "./services/type.service";
import initDb from "./entities/connection";

class App {
  static async init() {
    const result = await initDb();
    if (result instanceof Error) {
      console.log(result);
      exit();
    }
    // Run brokers
    Promise.all([
      gatewayService.start(),
      templateService.start(),
      typeService.start(),
    ]);
  }
}

App.init();
