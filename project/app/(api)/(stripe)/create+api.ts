import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18.acacia" });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, amount } = body;

    // Input validation
    if (!name || !email || !amount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, or amount" }),
        { status: 400 }
      );
    }

    // Generate a unique idempotency key
    const idempotencyKey = `unique-key-${Date.now()}`;

    // Check if customer already exists
    let customer;
    const doesCustomerExist = await stripe.customers.list({ email });

    if (doesCustomerExist.data.length > 0) {
      customer = doesCustomerExist.data[0];
    } else {
      const newCustomer = await stripe.customers.create({ name, email }, { idempotencyKey });
      customer = newCustomer;
    }

    // Create ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-06-20" }
    );

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: parseInt(amount) * 100, // Convert to cents
        currency: "usd", // Ensure this currency is supported for automatic methods
        customer: customer.id,
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey } // Pass the idempotency key here
    );

    // Return necessary data
    return new Response(
      JSON.stringify({
        paymentIntentClientSecret: paymentIntent.client_secret,
        ephemeralKeySecret: ephemeralKey.secret,
        customerId: customer.id,
      }),
      { status: 200 }
    );
  } catch (error) {
    // Specific error handling for network issues
    if (error instanceof stripe.errors.StripeConnectionError) {
      console.error("Network error with Stripe:", error);
      return new Response(
        JSON.stringify({ error: "Network error, please try again." }),
        { status: 502 }
      );
    }

    // General error handling
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
