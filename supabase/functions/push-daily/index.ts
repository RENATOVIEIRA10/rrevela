import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

  if (!vapidPublicKey || !vapidPrivateKey) {
    return new Response(
      JSON.stringify({ error: 'VAPID keys not configured. Run generate-vapid first.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('subscription');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const payload = JSON.stringify({
    title: 'Revela — Leitura do dia',
    body: 'Sua leitura diária está esperando. 📖',
    url: '/plano',
  });

  // Use npm:web-push for sending notifications
  let sent = 0;
  let failed = 0;
  try {
    const webpush = await import('npm:web-push');
    webpush.default.setVapidDetails(
      'mailto:admin@revela.app',
      vapidPublicKey,
      vapidPrivateKey
    );

    const results = await Promise.allSettled(
      (subscriptions || []).map((row: any) =>
        webpush.default.sendNotification(row.subscription, payload)
      )
    );

    sent = results.filter((r) => r.status === 'fulfilled').length;
    failed = results.filter((r) => r.status === 'rejected').length;
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `web-push error: ${(err as Error).message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ sent, failed, total: subscriptions?.length ?? 0 }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
