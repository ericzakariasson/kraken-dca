import "dotenv/config";

import { array, coerce, number, object, record, string, tuple } from "valibot";
import { env } from "./env";
import {
  createKrakenResponseSchema,
  fetchPrivate,
  fetchPublic,
} from "./kraken";
import { publishPurchasedEvent } from "./logsnag";

const ASSET_PAIRS = ["ETHEUR", "BTCEUR"];

const numberSchema = coerce(number(), Number);

const tickerInfoSchema = object({
  p: tuple([numberSchema, numberSchema]),
});

const tickerInfoResponseSchema = createKrakenResponseSchema(
  record(tickerInfoSchema)
);

async function getAssetPairFiatRate(pair: string) {
  const params = new URLSearchParams({
    pair,
  });

  const response = await fetchPublic(`0/public/Ticker?${params.toString()}`);
  const { result, error } = tickerInfoResponseSchema.parse(response);

  if (error.length > 0) {
    console.error(error);
    throw new Error(error.join(", "));
  }

  if (result) {
    const [today] = Object.values(result)[0].p;
    return today;
  }

  throw new Error("Unknown error");
}

const addOrderResponseSchema = createKrakenResponseSchema(
  object({
    descr: object({
      order: string(),
    }),
    txid: array(string()),
  })
);

async function purchaseAssetPair(pair: string, volume: number) {
  const payload = {
    pair,
    ordertype: "market",
    type: "buy",
    volume: volume.toString(),
  };

  const response = await fetchPrivate("/0/private/AddOrder", payload);
  const { result, error } = addOrderResponseSchema.parse(response);

  if (error.length > 0) {
    console.error(error);
    throw new Error(error.join(", "));
  }

  if (result.txid.length === 0) {
    throw new Error("No txid in add order result");
  }

  return result;
}

function transformTickerName(ticker: string) {
  if (["XBT", "BTC"].includes(ticker)) {
    return "Bitcoin";
  }

  if (ticker === "ETH") {
    return "Ethereum";
  }

  return ticker;
}

async function main() {
  for (const pair of ASSET_PAIRS) {
    const fiatRate = await getAssetPairFiatRate(pair);
    console.info(`Fiat rate for ${pair}: ${fiatRate}`);

    const purchaseVolume = Number(env.DAILY_PURCHASE_AMOUNT_EUR) / fiatRate;
    console.info(`Purchase volume for ${pair}: ${purchaseVolume}`);

    const result = await purchaseAssetPair(pair, purchaseVolume);
    console.info(`Purchased ${purchaseVolume} of ${pair}`, result);

    try {
      await publishPurchasedEvent({
        currency: transformTickerName(pair.slice(0, 3)),
        amount: purchaseVolume.toFixed(6),
        rate: fiatRate.toFixed(0),
      });
    } catch (error) {
      console.error("Failed to publish purchased event", error);
    }
  }
}

main();
