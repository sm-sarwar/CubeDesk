import { NextRequest, NextResponse } from "next/server";
import { userService } from "./app/service/user.service";

export async function proxy ( request: NextRequest) {
    let isAuthenticated = false
    let isAdmin = false

    const { data } = await userService.getSession()

    if (data) {
        isAuthenticated = true
        isAdmin = data.user.role ==="admin"
    }

    if(!isAuthenticated && !isAdmin) {
        return NextResponse.redirect(new URL("/signin", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/","/customers","/orders","/due-tracker"]
}