import { createHash, createHmac } from "crypto";
import { stringify } from "qs";
import { env } from "./env";

function generateMessageSignature(
  path: string,
  payload: Record<string, unknown>,
  secret: string,
  nonce: number
) {
  const message = stringify(payload);
  const secretBuffer = Buffer.from(secret, "base64");
  const hash = createHash("sha256");
  const hmac = createHmac("sha512", secretBuffer);
  const hashDigest = Buffer.from(
    hash.update(nonce + message).digest()
  ).toString("latin1");
  const hmacDigest = hmac.update(path + hashDigest, "latin1").digest("base64");

  return hmacDigest;
}

function generateNonce() {
  return new Date().getTime() * 1000;
}

const KRAKEN_API_BASE = "https://api.kraken.com";

export async function fetchPrivate(
  url: string,
  payload: Record<string, unknown>
) {
  const nonce = generateNonce();

  payload.nonce = nonce.toString();

  const signature = generateMessageSignature(
    url,
    payload,
    env.KRAKEN_SECRET,
    nonce
  );

  const response = await fetch(`${KRAKEN_API_BASE}/${url}`, {
    method: "POST",
    headers: {
      "API-Key": env.KRAKEN_KEY,
      "API-Sign": signature,
      "User-Agent": "Kraken-DCA-Bot",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: stringify(payload),
  });

  if (!response.ok) {
    console.error(response.status, response.statusText);
    throw new Error(`Request to ${url} failed`);
  }

  const { result, error } = await response.json();

  return { result, error };
}

export async function fetchPublic(url: string) {
  const response = await fetch(`${KRAKEN_API_BASE}/${url}`);

  if (!response.ok) {
    console.error(response.status, response.statusText);
    throw new Error(`Request to ${url} failed`);
  }

  const { result, error } = await response.json();
  return { result, error };
}
