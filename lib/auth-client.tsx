import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    fetchOptions : {
        /** The credentials option to use for fetch requests (optional) */
        credentials: "include",
    },
})