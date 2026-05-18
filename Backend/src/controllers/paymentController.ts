import { Request, Response } from "express";
import * as payService from "../services/paystackService";
import {prisma} from "../utils/prisma";

// Controller for handling payment initialization and verification
export async function initializePayment(req: Request, res: Response) {
  const { sessionId } = req.body;
  if (!sessionId)
    return res.status(400).json({ message: "sessionId required" });

  const order = await prisma.order.findFirst({
    where: { sessionId, status: "PLACED" },
    orderBy: { createdAt: "desc" },
  });
  if (!order) return res.status(404).json({ message: "No placed order found" });

  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });
  const total = items.reduce((s: number, it: any) => s + it.price * it.quantity, 0);

  const init = await payService.initializePayment({
    amount: total,
    reference: order.id,
    email: "customer@example.com",
  });
  
  // Send only the necessary data to the frontend for payment processing
  const responseDataToFrontend = {
    authorization_url: init.authorization_url,
    access_code: init.access_code,
    reference: init.reference,
    amount_in_smallest_unit: Math.round(total * 100), // explicitly calculate and attach this!
    email: "customer@example.com", // explicitly attach this!
  };
  res.json(responseDataToFrontend);
}

export async function verifyPayment(req: Request, res: Response) {
  const { reference } = req.query as any;
  if (!reference)
    return res.status(400).json({ message: "reference required" });

  const verify = await payService.verifyPayment(String(reference));
  if (verify && verify.status === "success") {
    await prisma.order.update({
      where: { id: String(reference) },
      data: { status: "PAID" },
    });
    return res.json({ success: true, message: "Payment verified" });
  }
  res.status(400).json({ success: false });
}

export async function webhook(req: Request, res: Response) {
  // Paystack webhook handling (simple)
  const event = req.body;
  if (event && event.data && event.event === "charge.success") {
    const ref = event.data.reference;
    await prisma.order.updateMany({
      where: { id: ref },
      data: { status: "PAID" },
    });
  }
  res.json({ received: true });
}
