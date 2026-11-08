import { cookies } from "next/headers"

interface GetOrdersParams {
    status?: string;
    search?: string;
}
interface ServiceOptions {
    cache?: RequestCache;
    revalidate?: number;
}

export const ordersService = {
    getOrders: async function (params?: GetOrdersParams, options?: ServiceOptions) {
        const cookieStore = await cookies()
        try {
            
            const url = new URL(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/orders`)
            if(params) {
                Object.entries(params).forEach(([key, value]) => {
                    if(value !== undefined && value !== null && value !== "") {
                        url.searchParams.append(key, String(value))
                    }
                })
            }

            const config: RequestInit = {}

            if (options?.cache) {
                config.cache = options.cache
            }

            const res = await fetch(url.toString(), {
                headers: { Cookie: cookieStore.toString() },
                ...config
            })
            const data = await res.json()
            return { data, error: null }

        } catch (err) {
            console.error(err)
            return { data: null, error: { message: "something went wrong" } }
        }
    }
}