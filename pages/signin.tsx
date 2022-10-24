/* import {providers, signIn, getSession, csrfToken} from 'next-auth/client'; */

import {getCsrfToken, getProviders, getSession, signIn} from 'next-auth/react';

function signin({providers}: {providers: Array<{name: string; id: string}>}) {
  return (
    <div>
      <h1>Sign in you 💩</h1>
      {Object.values(providers).map((provider) => {
        return (
          <div key={provider.name}>
            <button onClick={() => signIn(provider.id)}>Sign in with {provider.name}</button>
          </div>
        );
      })}
    </div>
  );
}

export default signin;

export async function getServerSideProps(context) {
  const {req} = context;
  const session = await getSession({req});

  if (session) {
    return {
      redirect: {destination: '/'},
    };
  }

  return {
    props: {
      providers: await getProviders(),
      csrfToken: await getCsrfToken(context),
    },
  };
}
