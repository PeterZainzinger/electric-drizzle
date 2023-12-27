import {z} from "zod";

export const generateSchemaArgs = z.object({
  output: z.string(),
  service: z.string(),
  proxy_url: z.string(),
});

export type GenerateSchemaArgs = z.infer<typeof generateSchemaArgs>;
