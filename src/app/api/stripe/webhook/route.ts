import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

// Stripe subscription events are the only source of truth for plan/credit
// changes - the client never sets these directly, so this webhook always
// runs with the service-role client to bypass RLS intentionally.
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as "monthly" | "annual" | undefined;
      const credits = Number(session.metadata?.credits ?? 0);
      if (!userId || !plan) break;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: session.subscription as string,
          plan,
          status: "active",
        },
        { onConflict: "stripe_subscription_id" },
      );

      await supabase.from("profiles").update({ plan }).eq("id", userId);
      if (credits > 0) {
        await supabase.rpc("grant_credits", { p_user_id: userId, p_amount: credits, p_reason: "subscription_start" });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : undefined;
      if (!subscriptionId || invoice.billing_reason !== "subscription_cycle") break;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("user_id, plan")
        .eq("stripe_subscription_id", subscriptionId)
        .single();
      if (!sub) break;

      const { data: settings } = await supabase.from("platform_settings").select("*").eq("id", 1).single();
      const renewalCredits =
        sub.plan === "annual" ? settings?.annual_credits : settings?.monthly_credits;
      if (renewalCredits) {
        await supabase.rpc("grant_credits", {
          p_user_id: sub.user_id,
          p_amount: renewalCredits,
          p_reason: "subscription_renewal",
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status === "active" ? "active" : "past_due",
          current_period_end: new Date(subscription.items.data[0]?.current_period_end * 1000).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: sub } = await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id)
        .select("user_id")
        .single();

      // Per product decision: on cancellation the account reverts to the
      // free plan. Saved projects and remaining credits are left as-is;
      // suspension (handled separately in the admin portal) is the
      // mechanism that fully blocks account access.
      if (sub) await supabase.from("profiles").update({ plan: "free" }).eq("id", sub.user_id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
