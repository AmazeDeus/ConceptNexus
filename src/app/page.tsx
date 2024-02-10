import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowDownToLine, CheckCircle, Leaf } from 'lucide-react';
import Link from 'next/link';

const perks = [
  {
    name: 'Unique Designs',
    Icon: ArrowDownToLine,
    description:
      'Discover one-of-a-kind concept art pieces and resources created with passion and quality.',
  },
  {
    name: 'Inspiration',
    Icon: CheckCircle,
    description:
      'Get inspired by the large collection and bring your creative ideas to life.',
  },
  {
    name: 'Exclusive Access',
    Icon: Leaf,
    description:
      'Access exclusive concept art collections and limited edition prints :)',
  },
];

export default function Home() {
  return (
    <>
      <MaxWidthWrapper>
        <div className='py-20 mx-auto text-center flex flex-col items-center max-w-3xl'>
          <h1 className='text-4-xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
            Welcome to Nexus! A marketplace for high-quality{' '}
            <span className='text-purple-600'>digital assets</span>.
          </h1>
          <p className='mt-6 text-lg max-w-prose text-muted-foreground'>
            Welcome to Niereon Nexus. Every asset on this platform is verified
            to ensure the highest quality standards.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 mt-6'>
            <Link href='/products' className={buttonVariants()}>
              Browse Trending
            </Link>
            <Button variant='ghost'>For quality promise &rarr;</Button>
          </div>
        </div>

        {/* TODO: List products */}
      </MaxWidthWrapper>

      <section className='border-t border-gray-200 bg-gray-50'>
        <MaxWidthWrapper className='py-20'>
          <div className='grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0'>
            {perks.map((perk) => (
              <div
                key={perk.name}
                className='text-center md:flex md:items-start md:text-left lg:block lg:text-center'
              >
                <div className='md:flex-shrink-0 flex justify-center'>
                  <div className='h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-900'>
                    {<perk.Icon className='w-1/3 h-1/3' />}
                  </div>
                </div>

                <div className='mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6'>
                  <h3 className='text-base font-mdeium text-gray-900'>
                    {perk.name}
                  </h3>
                  <p className='mt-3 text-sm text-muted-foreground'>
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>
    </>
  );
}

/* keybinds:
shift+alt+q= select start of elemt to end of element
shift+alt+o = remove unused imports
*/
