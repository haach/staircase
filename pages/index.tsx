import {signOut, useSession} from 'next-auth/react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React from 'react';
import Layout from '../components/Layout';
import Image from 'next/image';

const Index: React.FC = () => {
  const {data: session, status} = useSession();
  console.log('session', session);
  console.log('status', status);
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) => router.pathname === pathname;
  return (
    <Layout>
      <div className="page">
        <Image src="/favicon.svg" alt="Staircase recorder logo" width={200} height={200} />
        <h1>Staircase experiment recorder</h1>
        <nav>
          {status === 'loading' && <div>Loading login status...</div>}
          {!session && (
            <Link href="/api/auth/signin">
              <a data-active={isActive('/signup')}>Log in</a>
            </Link>
          )}
          {session && (
            <>
              <p>
                {session.user.name} ({session.user.email})
              </p>
              <button onClick={() => signOut()}>
                <a>Log out</a>
              </button>
              <Link href={{pathname: '/experiments'}}>
                <a data-active={isActive('/experiments')}>Go to experiment list</a>
              </Link>
            </>
          )}
        </nav>
        <Link href={{pathname: '/experiments'}}>
          <a data-active={isActive('/experiments')}>Experiment List</a>
        </Link>{' '}
        -{' '}
        <Link href={{pathname: '/experiment/create'}}>
          <a data-active={isActive('/experiments/create')}>Experiment create</a>
        </Link>
      </div>
    </Layout>
  );
};

export default Index;
