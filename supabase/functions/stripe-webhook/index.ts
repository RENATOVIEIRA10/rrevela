import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId) {
        await supabase.from("profiles").update({ bot_ativo: true }).eq("id", userId);
        console.log(`✅ bot_ativo=true para user ${userId}`);
      }
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "invoice.payment_failed"
    ) {
      const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId =
        "customer" in obj ? (typeof obj.customer === "string" ? obj.customer : obj.customer?.id) : null;
      if (customerId) {
        // Busca usuário pelo customer ID
        const customers = await stripe.customers.list({ limit: 1 });
        // Tenta buscar o e-mail pelo cliente Stripe
        const customer = await stripe.customers.retrieve(customerId);
        const email = "email" in customer ? customer.email : null;
        if (email) {
          const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
          const user = usersData?.users?.find((u) => u.email === email);
          if (user) {
            await supabase.from("profiles").update({ bot_ativo: false }).eq("id", user.id);
            await supabase.from("whatsapp_sessions_rrevela").delete().eq("user_id", user.id);
            console.log(`❌ bot_ativo=false e sessão removida para user ${user.id}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
