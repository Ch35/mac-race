import { NextRequest, NextResponse } from "next/server";
import { updateSession, getSession } from "@/lib/login";

export async function middleware(request: NextRequest) {
  const authEndpoints = [
    '/admin',
    '/api/boats/add',
    '/api/lap',
    '/api/lap',
    '/api/races/start',
    '/api/editflags',
  ];

  if (request.url.includes('/login')) {
    return await updateSession(request);
  }

  const session = await getSession();
  const isAuthEndpoint = authEndpoints.some((endpoint) => request.url.includes(endpoint));

  if (isAuthEndpoint && !session) {
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