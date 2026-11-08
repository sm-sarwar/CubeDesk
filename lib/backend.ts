import { cookies } from "next/headers";

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function backendMutate(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<ActionResult> {
  const cookieStore = await cookies();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        Cookie: cookieStore.toString(),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      return { ok: false, message: json?.message ?? `Request failed (${res.status})` };
    }
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}