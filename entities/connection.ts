import { DataSource } from "typeorm";
import env from "../config/env";
import { Template } from "./template";
import { TemplateType } from "./template_type";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,
  synchronize: env.db.synchronize,
  entities: [Template, TemplateType],
});

export default async (): Promise<DataSource | undefined> => {
  try {
    return await AppDataSource.initialize();
  } catch (error) {
    return error;
  }
};
