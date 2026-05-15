import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_51TWGoJEHONRD0CM7sPYz8SwJqCTo5OL0aioODennTAoRGt0K34i6mwBl5911dfofe6YDoVxfuR5Y9JuFjz5Tmzfl00Cq9aDGMV");

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "brl",
          product_data: { name: "Teste" },
          unit_amount: 10000,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: "http://localhost:8080/checkout/success",
      cancel_url: "http://localhost:8080/checkout/cancel",
    });
    console.log("✅ Stripe funcionando! URL:", session.url);
  } catch (e) {
    console.error("❌ Stripe erro:", e);
  }
}
test();
