import { cookies } from "next/headers"

interface GetCustomersParams {
    source?: string;
    search?: string;
}
interface ServiceOptions {
    cache?: RequestCache;
    revalidate?: number;
}

export const customerService = {
    getCustomers: async function (params?: GetCustomersParams, options?: ServiceOptions) {
         const cookieStore = await cookies()
        try {
           
            const url = new URL(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/customers`)
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
            // console.error(err)
            return { data: null, error: { message: "something went wrong" } }
        }
    },

    getCustomerById : async function (id : string, options?: ServiceOptions) {
         const cookieStore = await cookies()
        try {
           
            const url = new URL(`${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/customers/${id}`)
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
        } catch(error) {
            // console.error(error)
            return { data: null, error: { message: "something went wrong" } }
        }
    }
}