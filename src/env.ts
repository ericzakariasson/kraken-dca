import { object, string, parse, number, coerce } from "valibot";

const envSchema = object({
  KRAKEN_KEY: string(),
  KRAKEN_SECRET: string(),
  PURCHASE_DAY_OF_MONTH: coerce(number(), Number),
  LOGSNAG_TOKEN: string(),
});

export const env = envSchema.parse({
  KRAKEN_KEY: process.env.KRAKEN_KEY,
  KRAKEN_SECRET: process.env.KRAKEN_SECRET,
  PURCHASE_DAY_OF_MONTH: process.env.PURCHASE_DAY_OF_MONTH,
  LOGSNAG_TOKEN: process.env.LOGSNAG_TOKEN,
});
