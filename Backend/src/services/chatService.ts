import {prisma} from "../utils/prisma";

const OPTIONS = [
  "Reply with:",
  "1 - Place an order",
  "99 - Checkout",
  "98 - Order history",
  "97 - Current order",
  "0 - Cancel order",
];

function optionsFooter() {
  return OPTIONS;
}

export async function handleMessage(sessionId: string, message: string) {
  // ensure session exists
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) throw new Error("Invalid sessionId");

  // schedule command
  if (message.toLowerCase().startsWith("schedule ")) {
    const dateStr = message.slice(9).trim();
    const date = new Date(dateStr);
    if (isNaN(date.getTime()))
      return { message: "Invalid date format", options: optionsFooter() };
    // attach to pending order
    const order = await getOrCreatePendingOrder(sessionId);
    await prisma.order.update({
      where: { id: order.id },
      data: { scheduledFor: date },
    });
    return {
      message: `Order scheduled for ${date.toISOString()}`,
      options: optionsFooter(),
    };
  }

  if (message === "1") {
    const items = await prisma.menuItem.findMany({
      where: { available: true },
    });
    const list = items
      .map((i: any) => `${i.id} - ${i.name} - ₦${i.price.toFixed(2)}`)
      .join("\n");
    return { message: `Menu:\n${list}`, options: optionsFooter(), data: items };
  }

  if (message === "99") {
    // place order
    const order = await prisma.order.findFirst({
      where: { sessionId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    if (!order)
      return { message: "No order to place", options: optionsFooter() };
    const items = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { menuItem: true },
    });
    if (items.length === 0)
      return { message: "No items in current order", options: optionsFooter() };
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PLACED" },
    });
    const total = items.reduce(
      (s: number, it: any) => s + it.price * it.quantity,
      0,
    );
    return {
      message: `Order placed! Items:\n${items.map((i: any) => `${i.menuItem.name} x${i.quantity}`).join("\n")}\nTotal: ₦${total.toFixed(2)}`,
      options: optionsFooter(),
      data: { orderId: order.id, items, total },
    };
  }

  if (message === "98") {
    const orders = await prisma.order.findMany({
      where: { sessionId, status: { in: ["PLACED", "PAID"] } },
      include: { items: { include: { menuItem: true } } },
    });
    if (orders.length === 0)
      return { message: "No past orders", options: optionsFooter() };
    const summary = orders
      .map((o: any) => {
        const total = o.items.reduce(
          (s: number, it: any) => s + it.price * it.quantity,
          0,
        );
        return `Order ${o.id} - ${o.status} - ₦${total.toFixed(2)}`;
      })
      .join("\n");
    return {
      message: `Orders:\n${summary}`,
      options: optionsFooter(),
      data: orders,
    };
  }

  if (message === "97") {
    const order = await prisma.order.findFirst({
      where: { sessionId, status: "PENDING" },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
    });
    if (!order || order.items.length === 0)
      return { message: "No current pending order", options: optionsFooter() };
    const total = order.items.reduce(
      (s: number, it: any) => s + it.price * it.quantity,
      0,
    );
    const list = order.items
      .map(
        (i: any) =>
          `${i.menuItem.name} x${i.quantity} - ₦${(i.price * i.quantity).toFixed(2)}`,
      )
      .join("\n");
    return {
      message: `Current order:\n${list}\nTotal: ₦${total.toFixed(2)}`,
      options: optionsFooter(),
      data: { order, total },
    };
  }

  if (message === "0") {
    const order = await prisma.order.findFirst({
      where: { sessionId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
    if (!order)
      return {
        message: "No pending order to cancel",
        options: optionsFooter(),
      };
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return { message: "Pending order cancelled", options: optionsFooter() };
  }

  // If message is numeric or of form 1-<N>
  const selectMatch = message.match(/^1-(\d+)$/) || message.match(/^(\d+)$/);
  if (selectMatch) {
    const id = Number(selectMatch[1] || selectMatch[2]);
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item)
      return { message: "Invalid menu selection", options: optionsFooter() };
    const order = await getOrCreatePendingOrder(sessionId);
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuItemId: item.id,
        quantity: 1,
        price: item.price,
      },
    });
    return { message: `Added ${item.name} to order`, options: optionsFooter() };
  }

  return {
    message: `Unrecognized input.\n${OPTIONS.join("\n")}`,
    options: optionsFooter(),
  };
}

async function getOrCreatePendingOrder(sessionId: string) {
  let order = await prisma.order.findFirst({
    where: { sessionId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  if (!order) {
    order = await prisma.order.create({ data: { sessionId } });
  }
  return order;
}
