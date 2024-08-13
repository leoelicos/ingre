import Stripe from 'stripe';
import { Checkout } from 'schemas/types';

const stripe = new Stripe('sk_test_4eC39HqLyjWDarjtT1zdp7dc', { apiVersion: '2020-08-27' });

export const checkout = async (_parent: any, _args: any, context: any): Promise<Checkout> => {
  try {
    const url = new URL(context.headers.referer).origin;

    const product = await stripe.products.create({
      name: 'ingré PRO',
      description: 'Access instructions to cook each recipe',
      images: [`https://play-lh.googleusercontent.com/Ie88X5s51HN8-vfuNv_LYfamon6JAvFnxfbIrxXrI0LRd9vpnEQWAq5Pz83bEJU4Sfc`]
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 500,
      currency: 'usd'
    });

    const response = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price.id, quantity: 1 }],
      mode: 'payment',
      success_url: `${url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url}/`
    });
    if (!response) throw new Error('could not create stripe response');
    return { session: response.id };
  } catch (e: any) {
    throw e;
  }
};
