import { User } from '../payload-types';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { NextRequest } from 'next/server';

export const getServerSideUser = async (
  cookies: NextRequest['cookies'] | ReadonlyRequestCookies
) => {
  // Get current user
  const token = cookies.get('payload-token')?.value;

  // Automatic CMS endpoint
  const meRes = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`,
    {
      headers: {
        Authorization: `JWT ${token}`,
      },
    }
  );

  // Get logged in user or null
  const { user } = (await meRes.json()) as { user: User | null };

  return { user };
};
