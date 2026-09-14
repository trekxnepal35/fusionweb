import {
  NextResponse,
} from "next/server";

import {
  jwtVerify,
} from "jose";


export async function middleware(
  request
) {

  const pathname =
    request.nextUrl.pathname;


  // ==========================================
  // ALLOW ADMIN LOGIN
  // ==========================================

  if (
    pathname ===
    "/admin/login"
  ) {

    return NextResponse.next();

  }


  const token =
    request.cookies.get(
      "admin_token"
    )?.value;


  if (!token) {

    return NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url
      )
    );

  }


  try {

    const secret =
      new TextEncoder().encode(
        process.env.JWT_SECRET
      );


    const {
      payload,
    } = await jwtVerify(
      token,
      secret
    );


    if (
      payload.role !== "admin"
    ) {

      return NextResponse.redirect(
        new URL(
          "/admin/login",
          request.url
        )
      );

    }


    return NextResponse.next();


  } catch (error) {

    return NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url
      )
    );

  }

}


export const config = {

  matcher: [
    "/admin/:path*",
  ],

};