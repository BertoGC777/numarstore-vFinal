import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

// Edge Function: Dispara e-mail de confirmação de pedido
// Busca dados do pedido e envia e-mail usando SendGrid

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
    const { order, ...corsHeaders, items } = body;

    if (!order || !items) {
      return new Response(JSON.stringify({ error: 'Dados inválidos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Gerar ID curto do pedido (primeiros 8 chars)
    const orderIdShort = order.id.substring(0, 8);

    // Montar HTML do e-mail
    const itemsHtml = items.map((item: any) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
          <strong>${item.product_name}</strong><br>
          <span style="color: #666; font-size: 14px;">Cor: ${item.color} | Tamanho: ${item.size}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">R$ ${(item.price_pix).toFixed(2)}</td>
      </tr>
    `).join('');

    const totalWithShipping = order.total + order.shipping;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #C9973A; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9f9f9; }
          .order-info { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; }
          .total { font-size: 18px; font-weight: bold; color: #C9973A; text-align: right; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .whatsapp-link { display: inline-block; margin-top: 20px; padding: 12px 30px; background: #25D366; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Numar Store</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${order.customer_name}</strong>!</p>
            <p>Seu pedido foi confirmado com sucesso!</p>
            <div class="order-info">
              <p><strong>Pedido #${orderIdShort}</strong></p>
              <table>
                <thead>
                  <tr style="text-align: left; border-bottom: 2px solid #C9973A;">
                    <th style="padding: 10px 0;">Produto</th>
                    <th style="padding: 10px 0; text-align: center;">Qtd</th>
                    <th style="padding: 10px 0; text-align: right;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="margin-top: 20px;">
                <p>Subtotal: R$ ${order.total.toFixed(2)}</p>
                <p>Frete: R$ ${order.shipping.toFixed(2)}</p>
                <div class="total">Total: R$ ${totalWithShipping.toFixed(2)}</div>
              </div>
              <p style="margin-top: 15px;"><strong>Método de pagamento:</strong> ${order.payment_method.toUpperCase()}</p>
            </div>
            <p style="text-align: center;">Acompanhe seu pedido pelo WhatsApp:</p>
            <p style="text-align: center;">
              <a href="https://wa.me/5521979674510" class="whatsapp-link">Falar no WhatsApp</a>
            </p>
            <p style="margin-top: 30px;">Atenciosamente,<br>Equipe Numar Store</p>
          </div>
          <div class="footer">
            <p>© 2024 Numar Store. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar e-mail via SendGrid
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')!;
    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: { email: 'contato@numarstore.com.br', name: 'Numar Store' },
        to: [{ email: order.customer_email, name: order.customer_name }],
        subject: `Pedido #${orderIdShort} confirmado — Numar Store`,
        content: [{ type: 'text/html', value: html }]
      })
    });

    if (!sendgridResponse.ok) {
      const errorText = await sendgridResponse.text();
      throw new Error(`Erro SendGrid: ${errorText}`);
    }

    // Atualizar email_sent = true na tabela orders
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('orders')
      .update({ email_sent: true })
      .eq('id', order.id);

    if (updateError) {
      throw new Error(`Erro ao atualizar pedido: ${updateError.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro em send-confirmation-email:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
