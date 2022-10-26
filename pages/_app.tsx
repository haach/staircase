import {SessionProvider} from 'next-auth/react';
import {AppProps} from 'next/app';
import {Session} from 'next-auth';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = ({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default App;
