import * as z from "zod";

export const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"] as const;

const amount = z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount");

export const orderSchema = z
  .object({
    customerId: z.string().min(1, "Select a customer"),
    totalAmount: amount.refine((v) => Number(v) > 0, "Total must be greater than 0"),
    paidAmount: amount,
    status: z.enum(ORDER_STATUSES),
  })
  .refine((d) => Number(d.paidAmount) <= Number(d.totalAmount), {
    message: "Paid amount cannot exceed total",
    path: ["paidAmount"],
  });

export type OrderInput = z.infer<typeof orderSchema>;

export const orderUpdateBase = z.object({
  customerId: z.string().min(1, "Select a customer"),
  orderDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  totalAmount: amount.refine((v) => Number(v) > 0, "Total must be greater than 0"),
  status: z.enum(ORDER_STATUSES),
  notes: z.string().max(500, "Max 500 characters"),
});

// Form e paid amount jana thake, tai total ta paid er cheye kom hote parbe na
export const makeOrderUpdateSchema = (paid: number) =>
  orderUpdateBase.refine((d) => Number(d.totalAmount) >= paid, {
    message: `Total cannot be less than the paid amount (৳${paid})`,
    path: ["totalAmount"],
  });

export type OrderUpdateInput = z.infer<typeof orderUpdateBase>;