"use server";

import { revalidatePath } from "next/cache";
import { backendMutate, type ActionResult } from "@/lib/backend";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";

function refresh() {
  for (const p of ["/", "/customers", "/orders", "/due-tracker"]) revalidatePath(p);
}

export async function createCustomer(input: CustomerInput): Promise<ActionResult> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid data. Please check the form." };

  const res = await backendMutate("/customers", "POST", parsed.data);
  if (res.ok) refresh();
  return res;
}

export async function updateCustomer(id: number, input: CustomerInput): Promise<ActionResult> {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid data. Please check the form." };

  const res = await backendMutate(`/customers/${id}`, "PATCH", parsed.data);
  if (res.ok) refresh();
  return res;
}

export async function deleteCustomer(id: number): Promise<ActionResult> {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, message: "Invalid customer." };

  const res = await backendMutate(`/customers/${id}`, "DELETE");
  if (res.ok) refresh();
  return res;
}