import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	// For now, allow all requests - will implement Supabase auth later
	return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/admin", "/admin/dashboard", "/admin/posts", "/admin/pages", "/admin/media", "/admin/categories", "/admin/tags", "/admin/users", "/admin/themes", "/admin/settings"], // Apply middleware to specific routes
};