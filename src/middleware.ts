import { NextRequest, NextResponse } from 'next/server';
import { getServerSideUser } from './lib/payload-utils';

// Redirect when logged in users try to access the sign-in/sign-up page
export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;

  // Get currently logged in user
  const { user } = await getServerSideUser(cookies);

  if (user && ['/sign-in', '/sign-up'].includes(nextUrl.pathname)) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SERVER_URL}/`);
  }

  // Perform next action
  return NextResponse.next();
}
