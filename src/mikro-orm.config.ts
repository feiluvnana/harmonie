import { defineConfig, ReflectMetadataProvider } from "@mikro-orm/mysql";

export default defineConfig({
  entities: ["./dist/entities/*.entity.js"],
  entitiesTs: ["./src/entities/*.entity.ts"],
  clientUrl: process.env.MIKRO_ORM_CLIENT_URL,
  metadataProvider: ReflectMetadataProvider,
});
