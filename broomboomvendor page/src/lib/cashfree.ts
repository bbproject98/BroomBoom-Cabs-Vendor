export interface CashfreeCartItem {
  item_name: string;
  item_price: number;
  item_quantity: number;
}

export interface CashfreeOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  orderNote?: string;
  orderTags?: Record<string, string>;
  cartDetails?: {
    cart_items: CashfreeCartItem[];
  };
}

export interface CashfreeOrderResponse {
  cfOrderId?: string;
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  orderStatus: string;
  paymentSessionId?: string;
  entity?: string;
  raw?: any;
}

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "";
const CASHFREE_ENV = (process.env.CASHFREE_ENV || "sandbox").toLowerCase();

const CASHFREE_BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

/**
 * Creates a payment order on Cashfree Payment Gateway
 */
export async function createCashfreeOrder(
  params: CashfreeOrderParams
): Promise<{ success: boolean; data?: CashfreeOrderResponse; error?: string }> {
  try {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      throw new Error(
        "Cashfree credentials missing. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env"
      );
    }

    const payload = {
      order_id: params.orderId,
      order_amount: Math.round(params.orderAmount * 100) / 100,
      order_currency: params.orderCurrency || "INR",
      customer_details: {
        customer_id: params.customerId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50),
        customer_name: params.customerName.trim().slice(0, 50),
        customer_email: params.customerEmail.trim(),
        customer_phone: params.customerPhone.replace(/[^0-9]/g, "").slice(-10),
      },
      order_meta: {
        return_url: params.returnUrl,
      },
      order_note: params.orderNote || "BroomBoom Vendor Partner Subscription",
      order_tags: params.orderTags || null,
      cart_details: params.cartDetails || null,
    };

    const res = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[CASHFREE ERROR]", data);
      return {
        success: false,
        error: data.message || `Cashfree API returned error ${res.status}`,
      };
    }

    return {
      success: true,
      data: {
        cfOrderId: data.cf_order_id,
        orderId: data.order_id,
        orderAmount: data.order_amount,
        orderCurrency: data.order_currency,
        orderStatus: data.order_status,
        paymentSessionId: data.payment_session_id,
        entity: data.entity,
        raw: data,
      },
    };
  } catch (err: any) {
    console.error("[CASHFREE EXCEPTION]", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with Cashfree PG",
    };
  }
}

/**
 * Fetches and verifies order status from Cashfree
 */
export async function getCashfreeOrder(
  orderId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      throw new Error("Cashfree credentials missing in .env");
    }

    const res = await fetch(`${CASHFREE_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.message || `Cashfree API returned error ${res.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch order from Cashfree",
    };
  }
}

export function getCashfreeMode(): "sandbox" | "production" {
  return CASHFREE_ENV === "production" ? "production" : "sandbox";
}

