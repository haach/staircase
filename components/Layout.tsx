/** @jsxImportSource @emotion/react */
import React, {ReactNode} from 'react';
import {Container} from 'react-bootstrap';
import Header from './Header';

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div>
    <Header />

    <Container css={{padding: '20px calc(var(--bs-gutter-x) * .5)'}}>
      <main css={{display: 'flex', flexDirection: 'column', gap: '16px'}}>{props.children}</main>
    </Container>
    <style jsx global>{`
      html {
        box-sizing: border-box;
      }

      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }

      body {
        margin: 0;
        padding: 0;
        font-size: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
          'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
        background: rgba(0, 0, 0, 0.05);
      }
    `}</style>
  </div>
);

export default Layout;
