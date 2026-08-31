import "server-only";

const XENDIT_API_BASE = "https://api.xendit.co";

function getAuthHeader(): string {
  const secretKey = process.env.XENDIT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing XENDIT_SECRET_KEY");
  }
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export type CreateInvoiceArgs = {
  externalId: string;
  amount: number;
  payerEmail: string;
  description: string;
  metadata: Record<string, string>;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  paymentMethods?: string[];
};

export type CreateInvoiceResult = {
  id: string;
  invoiceUrl: string;
};

export async function createInvoice({
  externalId,
  amount,
  payerEmail,
  description,
  metadata,
  successRedirectUrl,
  failureRedirectUrl,
  paymentMethods,
}: CreateInvoiceArgs): Promise<CreateInvoiceResult> {
  const response = await fetch(`${XENDIT_API_BASE}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: externalId,
      amount,
      currency: "IDR",
      payer_email: payerEmail,
      description,
      metadata,
      success_redirect_url: successRedirectUrl,
      failure_redirect_url: failureRedirectUrl,
      ...(paymentMethods ? { payment_methods: paymentMethods } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Xendit create invoice failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { id: string; invoice_url: string };
  return { id: data.id, invoiceUrl: data.invoice_url };
}
