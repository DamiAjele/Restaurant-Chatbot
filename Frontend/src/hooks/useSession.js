import { useState, useEffect, useCallback, useRef } from "react";
import {
  createSession,
  sendMessage,
  initializePayment,
  verifyPayment,
} from "../api/client";

const DEVICE_ID_KEY = "chopbot_device_id";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = "device_" + Math.random().toString(36).substring(2, 15) + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/**
 * Message shape:
 * { id, sender: 'bot'|'user', text, options?, data?, type?: 'menu'|'order'|'checkout' }
 */

// Custom hook to manage chatbot session, messages, and interactions
export default function useSession() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const msgIdRef = useRef(0);

  const nextId = () => ++msgIdRef.current;

  const parseResponseType = useCallback((response) => {
    const { message, data } = response;
    const lowerMsg = (message || "").toLowerCase();

    // Menu: backend returns an array of menu items with prices
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].price !== undefined
    ) {
      return "menu";
    }

    // Checkout: backend responds with "Order placed!" and order data (orderId, items, total)
    // This must be checked BEFORE the generic "order" check below
    if (
      lowerMsg.includes("order placed") &&
      data &&
      (data.orderId || data.total != null)
    ) {
      return "checkout";
    }

    // Order view: current order ("97") or order history ("98") with data
    if (data && (data.items || data.orderItems || data.order || data.orders)) {
      return "order";
    }

    return "text";
  }, []);

  const addBotMessage = useCallback(
    (response) => {
      const type = parseResponseType(response);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          sender: "bot",
          text: response.message,
          options: response.options || [],
          data: response.data || null,
          type,
        },
      ]);
    },
    [parseResponseType],
  );

  // Initialize session
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const deviceId = getDeviceId();
        const response = await createSession(deviceId);
        if (cancelled) return;
        setSessionId(response.sessionId);
        addBotMessage(response);
      } catch (err) {
        console.error("Session init error:", err);
        if (!cancelled) {
          setMessages([
            {
              id: nextId(),
              sender: "bot",
              text: "Sorry, I could not connect to the server. Please try again later.",
              options: [],
              data: null,
              type: "text",
            },
          ]);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [addBotMessage]);

  const send = useCallback(
    async (text) => {
      if (!sessionId || !text.trim() || loading) return;

      // Add user message
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          sender: "user",
          text: text.trim(),
          options: [],
          data: null,
          type: "text",
        },
      ]);

      setLoading(true);
      try {
        const response = await sendMessage(sessionId, text.trim());
        addBotMessage(response);
      } catch (err) {
        console.error("Send error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            sender: "bot",
            text: "Oops! Something went wrong. Please try again.",
            options: [],
            data: null,
            type: "text",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, loading, addBotMessage],
  );

  // Payment handling using Paystack
  const pay = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      console.log("--- STARTING PAYMENT DIAGNOSTIC ---");

      const paystackData = await initializePayment(sessionId);
      console.log("1. Backend Data:", paystackData);

      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      console.log("2. Public Key:", publicKey ? "✅ LOADED" : "❌ MISSING");

      console.log(
        "3. Paystack Script:",
        window.PaystackPop ? "✅ LOADED" : "❌ MISSING",
      );

      // Attempt to safely extract the access code just in case it's nested
      const accessCode =
        paystackData?.access_code ||
        paystackData?.data?.access_code ||
        paystackData?.authorization?.access_code;
      console.log(
        "4. Access Code:",
        accessCode ? `✅ FOUND (${accessCode})` : "❌ MISSING",
      );

      // Manually trigger errors so they get caught by our catch block
      if (!window.PaystackPop)
        throw new Error(
          "Paystack script is not loaded in index.html or is blocked by an adblocker.",
        );
      if (!publicKey)
        throw new Error(
          "VITE_PAYSTACK_PUBLIC_KEY is undefined. Restart your Vite server!",
        );
      if (!accessCode)
        throw new Error(
          "Could not extract access_code from the backend response.",
        );

      const handler = window.PaystackPop.setup({
        key: publicKey,
        access_code: accessCode,
        email: paystackData.email,
        amount: paystackData.amount_in_smallest_unit,
        onClose: function () {
          console.log("Payment window closed by user.");
        },
        // FIX: Change to a standard synchronous function
        callback: function (response) {
          console.log(
            "Paystack popup successful, verifying on backend...",
            response,
          );

          // Handle the async verification inside the standard function
          verifyPayment(response.reference)
            .then((verificationResult) => {
              console.log("Payment Verified!", verificationResult);
              window.alert(
                "Payment successful! Your order is being processed.",
              );
            })
            .catch((verifyError) => {
              console.error("Backend verification failed:", verifyError);
            });
        },
      });

      console.log("5. Opening Paystack iframe now...");
      handler.openIframe();
    } catch (err) {
      console.error("🔥 THE EXACT ERROR IS:", err.message || err);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          sender: "bot",
          text: "Payment initialization failed. Please try again.",
          options: [],
          data: null,
          type: "text",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Reset session (for testing or starting over)
  const resetSession = useCallback(() => {
    localStorage.removeItem(DEVICE_ID_KEY);
    setSessionId(null);
    setMessages([]);
    setInitializing(true);
    msgIdRef.current = 0;

    // Re-init
    async function reinit() {
      try {
        const deviceId = getDeviceId();
        const response = await createSession(deviceId);
        setSessionId(response.sessionId);
        addBotMessage(response);
      } catch (err) {
        console.error("Reset error:", err);
      } finally {
        setInitializing(false);
      }
    }
    reinit();
  }, [addBotMessage]);

  return {
    messages,
    loading,
    initializing,
    send,
    pay,
    resetSession,
    sessionId,
  };
}
