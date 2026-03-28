import Stripe from "stripe";
import { StatusCodes } from "http-status-codes";
import { requireEnv } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import { CheckoutSessionInput, CheckoutSessionResponse } from "./payment.interface.js";

const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));

const createCheckoutSession = async (
    userId: string,
    payload: CheckoutSessionInput
): Promise<CheckoutSessionResponse> => {

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: "DevHuntr Premium - Lifetime Membership",
                        description: "Get unlimited access to all premium tech products on DevHuntr forever.",
                    },
                    unit_amount: 5000,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: payload.successUrl,
        cancel_url: payload.cancelUrl,
        client_reference_id: userId,
        metadata: {
            userId,
            productId: payload.productId || "lifetime_subscription",
        },
    });

    return {
        sessionId: session.id,
        sessionUrl: session.url,
    };
};

const handleWebhook = async (rawBody: Buffer, signature: string) => {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            requireEnv("STRIPE_WEBHOOK_SECRET")
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        throw new AppError(StatusCodes.BAD_REQUEST, `Webhook error: ${message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { isSubscribed: true }
            });
            console.log(`[Stripe Webhook] Fulfillment successful for user ${userId}.`);
        }
    }

    return { received: true };
};

export const PaymentServer = {
    createCheckoutSession,
    handleWebhook,
};
