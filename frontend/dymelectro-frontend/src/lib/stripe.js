import { loadStripe } from '@stripe/stripe-js';

// Promesa unica y reutilizable: loadStripe() no debe llamarse en cada render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default stripePromise;