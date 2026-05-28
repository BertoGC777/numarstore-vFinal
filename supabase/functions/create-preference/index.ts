import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

// Edge Function: Cria preferência de pagamento no Mercado Pago
// Recebe dados do pedido (items, customer, shipping, paymentMethod)
// Cria pedido no banco e preferência no Mercado Pago

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
    const { customer, items, shipping, paymentMethod } = body;

    // Validar dados obrigatórios
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Dados inválidos' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Configurar Supabase com service_role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calcular total
    const total = items.reduce((sum: number, item: any) => {
      const price = paymentMethod === 'pix' ? item.pricePix : item.priceCard;
      return sum + (price * item.quantity);
    }, 0);

    // Criar registro na tabela orders
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        total,
        shipping,
        payment_method: paymentMethod,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Erro ao criar pedido: ${orderError?.message}`);
    }

    const orderId = order.id;

    // Inserir itens na tabela order_items
    const orderItems = items.map((item: any) => ({
      order_id: orderId,
      product_id: item.productId,
      product_slug: item.slug,
      product_name: item.name,
      product_image: item.image,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price_pix: item.pricePix,
      price_card: item.priceCard
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Erro ao inserir itens: ${itemsError.message}`);
    }

    // Retornar dados para o frontend (modo WhatsApp sem Mercado Pago)
    return new Response(
      JSON.stringify({
        order_id: orderId,
        init_point: null,
        preference_id: null,
        whatsapp_redirect: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro em create-preference:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
