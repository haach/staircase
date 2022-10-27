import {useSession} from 'next-auth/react';
import Link from 'next/link';
import React from 'react';
import {Button} from 'react-bootstrap';
import Layout from '../components/Layout';

const Index: React.FC = () => {
  const {data: session} = useSession();
  return (
    <Layout>
      {session?.user ? (
        <>
          <h1>Hey {session?.user.name}! 👋</h1>
          <p>
            Sorry there is not much to see here yet. In the future there could be a dashboard here or a log of the last
            edits.
          </p>
          <Link href="/experiments">
            <Button variant="primary">Go to experiment list</Button>
          </Link>
        </>
      ) : (
        <>
          <h1>Please log in</h1>
        </>
      )}
    </Layout>
  );
};

export default Index;
