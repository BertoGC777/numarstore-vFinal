import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

// Edge Function: Webhook do Mercado Pago
// Recebe notificações pós-pagamento e atualiza status do pedido no banco

Deno.serve(async (req) => {
  // Lidar com CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Aceitar apenas método POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    // Ignorar eventos que não são de pagamento
    if (type !== 'payment') {
      return new Response('OK', { status: 200 });
    }

    const paymentId = data.id;

    // Buscar detalhes do pagamento no Mercado Pago
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')!;
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`
      }
    });

    if (!mpResponse.ok) {
      throw new Error(`Erro ao buscar pagamento: ${mpResponse.statusText}`);
    }

    const paymentData = await mpResponse.json();
    const externalReference = paymentData.external_reference;
    const mpStatus = paymentData.status;

    if (!externalReference) {
      throw new Error('Pagamento sem external_reference');
    }

    // Mapear status MP para nosso status
    const statusMap: Record<string, string> = {
      'approved': 'paid',
      'pending': 'pending',
      'rejected': 'cancelled'
    };
    const orderStatus = statusMap[mpStatus] || 'pending';

    // Configurar Supabase com service_role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Atualizar pedido com mp_payment_id e status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        mp_payment_id: paymentId,
        status: orderStatus
      })
      .eq('id', externalReference);

    if (updateError) {
      throw new Error(`Erro ao atualizar pedido: ${updateError.message}`);
    }

    // Se status for 'paid', buscar dados do pedido e enviar e-mail
    if (orderStatus === 'paid') {
      // Buscar dados do pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', externalReference)
        .single();

      if (orderError || !order) {
        throw new Error(`Erro ao buscar pedido: ${orderError?.message}`);
      }

      // Buscar itens do pedido
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', externalReference);

      if (itemsError) {
        throw new Error(`Erro ao buscar itens: ${itemsError.message}`);
      }

      // Invocar função send-confirmation-email
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ order, items })
      });

      if (!emailResponse.ok) {
        console.error('Erro ao enviar e-mail de confirmação:', await emailResponse.text());
      }

      // Marcar email_sent = true
      await supabase
        .from('orders')
        .update({ email_sent: true })
        .eq('id', externalReference);
    }

    // Retornar 200 rapidamente (MP requer resposta rápida)
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Erro em mp-webhook:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
