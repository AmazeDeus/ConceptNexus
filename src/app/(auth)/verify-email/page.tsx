import VerifyEmail from '@/components/VerifyEmail';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined; // key = token
  };
}

const VerifyEmailPage = ({ searchParams }: PageProps) => {
  const token = searchParams.token;
  const toEmail = searchParams.to;

  return (
    <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        {token && typeof token === 'string' ? (
          <div className='grid gap-6'>
            <VerifyEmail token={token} />
          </div>
        ) : (
          <div className='flex h-full flex-col items-center justify-center space-y-1'>
            <div className='relative mb-4 h-60 w-80 text-muted-foreground'>
              <Image src='/email-sent.png' fill alt='email sent image' />
            </div>

            <h3 className='font-semibold text-2xl'>Check your email</h3>

            {toEmail ? (
              <p className='text-muted-foreground text-center'>
                We&apos;ve sent a verification link to{' '}
                <span className='font-semibold'>{toEmail}</span>.
              </p>
            ) : (
              <p className='text-muted-foreground text-center'>
                We&apos;ve sent a verification link to your email.
              </p>
            )}
          </div>
        )}

        {!process.env.RESEND_EMAIL && (
          <p className='text-green-700 text-center'>
            This is simply to display how email verification would work.
            Currently, there is no custom email domain setup, so you are free to
            {' '}&rarr; <Link href='/sign-in' className='underline'>sign in</Link>.
          </p>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;
