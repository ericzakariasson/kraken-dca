const KRAKEN_KEY = process.env.KRAKEN_KEY;
const KRAKEN_SECRET = process.env.KRAKEN_SECRET;
const DAILY_PURCHASE_AMOUNT_EUR = process.env.DAILY_PURCHASE_AMOUNT_EUR;

if (!KRAKEN_KEY) {
  throw new Error("KRAKEN_KEY is not set");
}

if (!KRAKEN_SECRET) {
  throw new Error("KRAKEN_SECRET is not set");
}

if (!DAILY_PURCHASE_AMOUNT_EUR) {
  throw new Error("DAILY_PURCHASE_AMOUNT_EUR is not set");
}

const DAILY_PURCHASE_AMOUNT_EUR_NUMBER = Number(DAILY_PURCHASE_AMOUNT_EUR);

if (
  Number.isNaN(DAILY_PURCHASE_AMOUNT_EUR_NUMBER) ||
  DAILY_PURCHASE_AMOUNT_EUR_NUMBER <= 0
) {
  throw new Error("DAILY_PURCHASE_AMOUNT_EUR is not a number");
}

export const env = {
  KRAKEN_KEY,
  KRAKEN_SECRET,
  DAILY_PURCHASE_AMOUNT_EUR: DAILY_PURCHASE_AMOUNT_EUR_NUMBER,
};
