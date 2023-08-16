import "dotenv/config";

import { env } from "./env";
import { fetchPrivate, fetchPublic } from "./kraken";

const ASSET_PAIRS = ["ETHEUR", "BTCEUR"];

async function getAssetPairFiatRate(pair: string) {
  const params = new URLSearchParams({
    pair,
  });

  const { result, error } = await fetchPublic(
    `0/public/Ticker?${params.toString()}`
  );

  if (error && error.length > 0) {
    console.error(error);
    throw new Error(error.join(", "));
  }

  if (!result) {
    throw new Error("No result in ticker information response");
  }

  const data = Object.values(result).at(0);

  if (!data || typeof data !== "object") {
    throw new Error("No data in ticker information result");
  }

  if (!("p" in data) || !Array.isArray(data.p)) {
    throw new Error("No p in ticker information result");
  }

  const [today] = data.p ?? [];

  if (!today) {
    throw new Error("No today price in ticker information result");
  }

  return Number(today);
}

async function purchaseAssetPair(pair: string, volume: number) {
  const payload = {
    pair,
    ordertype: "market",
    type: "buy",
    volume: volume.toString(),
  };

  const { result, error } = await fetchPrivate("/0/private/AddOrder", payload);

  if (error && error.length > 0) {
    console.error(error);
    throw new Error(error.join(", "));
  }

  if (!result) {
    throw new Error("No result in add order response");
  }

  if (result.txid?.length === 0) {
    throw new Error("No txid in add order result");
  }

  return result;
}

async function main() {
  for (const pair of ASSET_PAIRS) {
    const fiatRate = await getAssetPairFiatRate(pair);
    console.info(`Fiat rate for ${pair}: ${fiatRate}`);

    const purchaseVolume = Number(env.DAILY_PURCHASE_AMOUNT_EUR) / fiatRate;
    console.info(`Purchase volume for ${pair}: ${purchaseVolume}`);

    const result = await purchaseAssetPair(pair, purchaseVolume);
    console.info(`Purchased ${purchaseVolume} of ${pair}`, result);
  }
}

main();
