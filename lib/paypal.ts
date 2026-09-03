// Single switch between the demo (sandbox) and live credential sets below.
// NEXT_PUBLIC_ because the client component needs to read the same flag to
// pick which client id to hand the PayPal SDK — an environment name isn't
// sensitive, so it's fine to expose.
const IS_LIVE = process.env.NEXT_PUBLIC_PAYPAL_ENV === "live";

const PAYPAL_API_BASE = IS_LIVE
  ? process.env.LIVE_PAYPAL_API_BASE ?? "https://api-m.paypal.com"
  : process.env.DEMO_PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";

function getCredentials() {
  const clientId = IS_LIVE
    ? process.env.NEXT_PUBLIC_LIVE_PAYPAL_CLIENT_ID
    : process.env.NEXT_PUBLIC_DEMO_PAYPAL_CLIENT_ID;
  const clientSecret = IS_LIVE
    ? process.env.LIVE_PAYPAL_CLIENT_SECRET
    : process.env.DEMO_PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(`Missing PayPal ${IS_LIVE ? "live" : "demo"} credentials`);
  }
  return { clientId, clientSecret };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal OAuth failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createOrder(amount: string, currency: string): Promise<string> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`PayPal create order failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { id: string };
  return data.id;
}

export type CaptureResult = {
  status: string;
  amount: string | null;
  currency: string | null;
};

type PayPalCaptureResponse = {
  status: string;
  purchase_units?: {
    payments?: {
      captures?: { amount?: { value?: string; currency_code?: string } }[];
    };
  }[];
};

export async function captureOrder(orderId: string): Promise<CaptureResult> {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`PayPal capture order failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as PayPalCaptureResponse;
  const capturedAmount = data.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
  return {
    status: data.status,
    amount: capturedAmount?.value ?? null,
    currency: capturedAmount?.currency_code ?? null,
  };
}
