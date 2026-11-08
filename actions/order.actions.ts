"use server";

import { revalidatePath } from "next/cache";
import { backendMutate, type ActionResult } from "@/lib/backend";
import {
  orderSchema,
  orderUpdateBase,
  type OrderInput,
  type OrderUpdateInput,
} from "@/lib/validations/order";

function refresh() {
  for (const p of ["/", "/customers", "/orders", "/due-tracker"]) revalidatePath(p);
}

export async function createOrder(input: OrderInput): Promise<ActionResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid data. Please check the form." };
  const d = parsed.data;

  const res = await backendMutate("/orders", "POST", {
    customerId: Number(d.customerId),
    totalAmount: Number(d.totalAmount),
    paidAmount: Number(d.paidAmount),
    status: d.status,
  });
  if (res.ok) refresh();
  return res;
}

export async function updateOrder(id: number, input: OrderUpdateInput): Promise<ActionResult> {
  const parsed = orderUpdateBase.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid data. Please check the form." };
  const d = parsed.data;

  const res = await backendMutate(`/orders/${id}`, "PATCH", {
    customerId: Number(d.customerId),
    // Prisma full ISO DateTime chay, shudhu "2026-06-30" na
    orderDate: `${d.orderDate}T00:00:00.000Z`,
    totalAmount: Number(d.totalAmount),
    status: d.status,
    notes: d.notes,
  });
  if (res.ok) refresh();
  return res;
}