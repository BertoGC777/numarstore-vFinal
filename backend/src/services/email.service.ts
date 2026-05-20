import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'contato@numarstore.com.br';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Numar Store';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (data: EmailData): Promise<boolean> => {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email send');
    return false;
  }

  try {
    await sgMail.send({
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
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
        .button { display: inline-block; padding: 12px 30px; background: #C9973A; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Bem-vinda à Numar Store!</h1>
        </div>
        <div class="content">
          <p>Olá, ${name}!</p>
          <p>Obrigada por se cadastrar na Numar Store. Estamos muito felizes em ter você conosco!</p>
          <p>Confira nosso catálogo com as últimas tendências da moda feminina.</p>
          <a href="https://numarstore.com.br/catalogo" class="button">Ver Catálogo</a>
          <p style="margin-top: 30px;">Se você tiver qualquer dúvida, estamos aqui para ajudar.</p>
          <p>Atenciosamente,<br>Equipe Numar Store</p>
        </div>
        <div class="footer">
          <p>© 2024 Numar Store. Todos os direitos reservados.</p>
          <p>Este email foi enviado para ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Bem-vinda à Numar Store! 🎉',
    html,
    text: `Olá ${name}! Obrigada por se cadastrar na Numar Store. Confira nosso catálogo em https://numarstore.com.br/catalogo`,
  });
};

export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
): Promise<boolean> => {
  const itemsHtml = items
    .map(item => `<p>${item.name} - Qtd: ${item.quantity} - R$ ${item.price.toFixed(2)}</p>`)
    .join('');

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
        .total { font-size: 18px; font-weight: bold; color: #C9973A; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Confirmação de Pedido</h1>
        </div>
        <div class="content">
          <p>Olá, ${name}!</p>
          <p>Seu pedido foi confirmado com sucesso!</p>
          <div class="order-info">
            <p><strong>Pedido #${orderId}</strong></p>
            ${itemsHtml}
            <p class="total">Total: R$ ${total.toFixed(2)}</p>
          </div>
          <p>Você receberá atualizações sobre o status do seu pedido por email.</p>
          <p>Atenciosamente,<br>Equipe Numar Store</p>
        </div>
        <div class="footer">
          <p>© 2024 Numar Store. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Confirmação do Pedido #${orderId}`,
    html,
    text: `Olá ${name}! Seu pedido #${orderId} foi confirmado. Total: R$ ${total.toFixed(2)}`,
  });
};

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<boolean> => {
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
        .button { display: inline-block; padding: 12px 30px; background: #C9973A; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Redefinição de Senha</h1>
        </div>
        <div class="content">
          <p>Olá!</p>
          <p>Você solicitou a redefinição da sua senha na Numar Store.</p>
          <p>Clique no botão abaixo para criar uma nova senha:</p>
          <a href="${resetLink}" class="button">Redefinir Senha</a>
          <p style="margin-top: 20px;">Este link expira em 1 hora.</p>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          <p>Atenciosamente,<br>Equipe Numar Store</p>
        </div>
        <div class="footer">
          <p>© 2024 Numar Store. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Redefinição de Senha',
    html,
    text: `Redefina sua senha clicando no link: ${resetLink}`,
  });
};

export const sendCartAbandonmentEmail = async (
  email: string,
  name: string,
  itemCount: number,
  total: number
): Promise<boolean> => {
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
        .button { display: inline-block; padding: 12px 30px; background: #C9973A; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Seu carrinho está esperando! 🛍️</h1>
        </div>
        <div class="content">
          <p>Olá, ${name}!</p>
          <p>Você deixou ${itemCount} item(ns) no seu carrinho com total de R$ ${total.toFixed(2)}.</p>
          <p>Não perca suas peças favoritas!</p>
          <a href="https://numarstore.com.br/checkout" class="button">Finalizar Compra</a>
          <p style="margin-top: 20px;">Lembre-se: frete grátis para compras acima de R$300!</p>
          <p>Atenciosamente,<br>Equipe Numar Store</p>
        </div>
        <div class="footer">
          <p>© 2024 Numar Store. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Seu carrinho está esperando! 🛍️',
    html,
    text: `Olá ${name}! Você deixou ${itemCount} itens no carrinho. Finalize sua compra em https://numarstore.com.br/checkout`,
  });
};
