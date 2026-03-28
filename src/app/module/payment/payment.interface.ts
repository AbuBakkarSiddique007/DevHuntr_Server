export interface CheckoutSessionInput {
    productId?: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CheckoutSessionResponse {
    sessionId: string;
    sessionUrl: string | null;
}
