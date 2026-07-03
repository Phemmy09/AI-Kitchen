import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripeClient, StripeNotConfiguredError } from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const { plan } = await request.json();
  if (plan !== "monthly" && plan !== "annual") {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const [{ data: settings }, { data: profile }] = await Promise.all([
    supabase.from("platform_settings").select("*").eq("id", 1).single(),
    supabase.from("profiles").select("email, stripe_customer_id").eq("id", user.id).single(),
  ]);

  if (!settings || !settings.subscriptions_enabled) {
    return NextResponse.json({ error: "Subscriptions are currently disabled." }, { status: 400 });
  }
  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  try {
    const stripe = getStripeClient();

    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: profile.email, metadata: { userId: user.id } });
      customerId = customer.id;
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    const isMonthly = plan === "monthly";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: settings.currency,
            recurring: { interval: isMonthly ? "month" : "year" },
            unit_amount: isMonthly ? settings.monthly_price_cents : settings.annual_price_cents,
            product_data: {
              name: isMonthly ? "RatedWorktops Pro (Monthly)" : "RatedWorktops Pro (Annual)",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        plan,
        credits: String(isMonthly ? settings.monthly_credits : settings.annual_credits),
      },
      success_url: `${siteUrl}/credits?success=true`,
      cancel_url: `${siteUrl}/credits?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("stripe checkout error", err);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 500 });
  }
}
