import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const appUrl = Deno.env.get("APP_URL") || "https://revela.app";

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não configurada.");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const { plan, user_id, email } = await req.json();

    const priceId =
      plan === "anual"
        ? Deno.env.get("STRIPE_PRICE_ANUAL")
        : Deno.env.get("STRIPE_PRICE_MENSAL");

    if (!priceId) throw new Error(`Price ID não configurado para plano: ${plan}`);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { user_id, plan },
      success_url: `${appUrl}/home?pro=success`,
      cancel_url: `${appUrl}/pro?canceled=true`,
      locale: "pt-BR",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
