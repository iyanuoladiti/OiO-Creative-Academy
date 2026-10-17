/**
 * Paystack Inline Payment Gateway Service
 * Documentation: https://paystack.com/docs/payments/inline/
 */

export interface PaystackCustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

export interface PaystackMetadata {
  custom_fields?: PaystackCustomField[];
  cart_items?: string[];
  student_name?: string;
  student_whatsapp?: string;
  course_name?: string;
  [key: string]: unknown;
}

export interface PaystackSuccessResponse {
  reference: string;
  trans?: string;
  status?: string;
  message?: string;
  transaction?: string;
  trxref?: string;
  redirecturl?: string;
}

export interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number; // Amount in KOBO (e.g. 20,000 NGN = 2,000,000 kobo)
  currency?: "NGN" | "USD" | "GHS";
  ref?: string;
  metadata?: PaystackMetadata;
  channels?: Array<"card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer">;
  callback: (response: PaystackSuccessResponse) => void | Promise<void>;
  onClose: () => void | Promise<void>;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackSetupOptions) => {
        openIframe: () => void;
      };
    };
  }
}

/**
 * Ensures the Paystack Inline popup script is loaded into the browser
 */
export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.PaystackPop) {
      resolve(true);
      return;
    }

    // Check if script tag is already in DOM
    const existingScript = document.querySelector('script[src*="paystack.co"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      // In case it already finished loading
      if (window.PaystackPop) resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Paystack Inline JS script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Converts Nigerian Naira amount to Kobo (multiply by 100)
 */
export function convertNairaToKobo(nairaAmount: number): number {
  return Math.round(Number(nairaAmount) * 100);
}

/**
 * Generates a clean unique transaction reference
 */
export function generatePaystackReference(prefix = "OIO"): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Initializes and triggers Paystack popup modal
 */
export async function triggerPaystackCheckout(
  options: Omit<PaystackSetupOptions, "currency"> & { currency?: "NGN" }
): Promise<boolean> {
  const loaded = await loadPaystackScript();
  if (!loaded || !window.PaystackPop) {
    throw new Error(
      "Paystack Inline checkout failed to load. Please check your internet connection or disable adblockers."
    );
  }

  // Ensure amount is strictly a positive integer (in Kobo)
  const cleanAmount = Math.round(Number(options.amount));
  if (isNaN(cleanAmount) || cleanAmount <= 0) {
    throw new Error("Invalid payment amount. Amount must be a positive number.");
  }

  const userCallback = options.callback;
  const userOnClose = options.onClose;

  // CRITICAL FIX: Paystack Inline v1 checks:
  // function isFunction(t){ return t && "[object Function]" === {}.toString.call(t); }
  // In JavaScript, {}.toString.call(async () => {}) returns "[object AsyncFunction]",
  // which fails Paystack's check and throws "Attribute callback must be a valid function".
  // Using a plain ES5 function declaration ensures {}.toString.call(fn) is strictly "[object Function]".
  function safeCallback(response: PaystackSuccessResponse) {
    if (typeof userCallback === "function") {
      try {
        const result: unknown = userCallback(response);
        if (result && typeof result === "object" && "catch" in result) {
          (result as Promise<unknown>).catch((err: unknown) => {
            console.error("Error inside Paystack success callback handler:", err);
          });
        }
      } catch (err) {
        console.error("Error executing Paystack callback:", err);
      }
    }
  }

  function safeOnClose() {
    if (typeof userOnClose === "function") {
      try {
        const result: unknown = userOnClose();
        if (result && typeof result === "object" && "catch" in result) {
          (result as Promise<unknown>).catch((err: unknown) => {
            console.warn("Error inside Paystack onClose handler:", err);
          });
        }
      } catch (err) {
        console.warn("Error executing Paystack onClose:", err);
      }
    }
  }

  try {
    const handler = window.PaystackPop.setup({
      key: options.key,
      email: options.email,
      amount: cleanAmount,
      currency: options.currency || "NGN",
      ref: options.ref,
      metadata: options.metadata || {},
      channels: options.channels || ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
      callback: safeCallback,
      onClose: safeOnClose,
    });

    if (handler && typeof handler.openIframe === "function") {
      handler.openIframe();
      return true;
    } else {
      throw new Error("Paystack checkout could not open iframe dialog.");
    }
  } catch (err) {
    console.error("Error setting up PaystackPop:", err);
    throw err;
  }
}

