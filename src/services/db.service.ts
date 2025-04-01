import { MikroORM } from "@mikro-orm/core";
import { EntityManager, MySqlDriver } from "@mikro-orm/mysql";
import config from "../mikro-orm.config";

export let DBService: MikroORM<MySqlDriver, EntityManager>;

export async function initialize() {
  DBService = await MikroORM.init<MySqlDriver, EntityManager>(config);
}
