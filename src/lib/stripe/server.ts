import Stripe from "stripe";

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Payments are not configured yet - please check back soon.");
    this.name = "StripeNotConfiguredError";
  }
}

export function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeNotConfiguredError();
  return new Stripe(key);
}
