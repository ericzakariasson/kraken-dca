import { object, string, parse, number, coerce } from "valibot";

const envSchema = object({
  KRAKEN_KEY: string(),
  KRAKEN_SECRET: string(),
  DAILY_PURCHASE_AMOUNT_EUR: coerce(number(), Number),
  LOGSNAG_TOKEN: string(),
});

export const env = envSchema.parse({
  KRAKEN_KEY: process.env.KRAKEN_KEY,
  KRAKEN_SECRET: process.env.KRAKEN_SECRET,
  DAILY_PURCHASE_AMOUNT_EUR: process.env.DAILY_PURCHASE_AMOUNT_EUR,
  LOGSNAG_TOKEN: process.env.LOGSNAG_TOKEN,
});
