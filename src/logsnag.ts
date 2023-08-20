import { LogSnag } from "logsnag";
import { env } from "./env";

export const logsnag = new LogSnag({
  token: env.LOGSNAG_TOKEN,
  project: "crypto-dca",
});

export async function publishPurchasedEvent({
  currency,
  amount,
  rate,
}: {
  currency: string;
  amount: string;
  rate: string;
}) {
  return logsnag.publish({
    channel: "trading",
    event: `${currency} Purchased`,
    description: `${amount} at €${rate}`,
    icon: "💸",
    tags: {
      currency,
    },
    notify: true,
  });
}
