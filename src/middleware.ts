import { NextRequest, NextResponse } from "next/server";
import { updateSession, getSession } from "@/lib/login";

export async function middleware(request: NextRequest) {
  const endpoints = [
    '/login',
    '/api'
  ];

  if (!endpoints.some((endpoint) => request.url.includes(endpoint))) {
    return await updateSession(request);
  }

  if (!request.url.includes('/login') && !await getSession()) {
    if (request.method === 'POST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // dont use GET for API requests
    if (request.method === 'GET') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return await updateSession(request);
}