import { LogSnag } from "logsnag";
import { env } from "./env";

export const logsnag = new LogSnag({
  token: env.LOGSNAG_TOKEN,
  project: "crypto-dca",
});

export async function publishPurchasedEvent({
  currency,
  euroAmount,
}: {
  currency: string;
  euroAmount: string;
}) {
  return logsnag.publish({
    channel: "trading",
    event: `${currency} Purchased`,
    description: `¢ ${euroAmount}`,
    icon: "💸",
    tags: {
      currency,
    },
    notify: true,
  });
}
