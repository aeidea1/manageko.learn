import { defineConfig, env } from "@prisma/config";
import "dotenv/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"), // Теперь URL берется отсюда
  },
});