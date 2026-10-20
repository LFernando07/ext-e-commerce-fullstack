import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('nenis_session');

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
