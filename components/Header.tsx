/** @jsxImportSource @emotion/react */
import {signOut, useSession} from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React from 'react';
import {Dropdown} from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

const BreadCrumb: React.FC<{
  experimentId?: string;
  recordingSessionId?: string;
  runId?: string;
}> = ({experimentId, recordingSessionId, runId}) => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) => router.asPath === pathname;
  const experimentListLink = (
    <Nav.Link href="/experiments" active={isActive('/experiments')}>
      Experiment list
    </Nav.Link>
  );
  const experimentLink = (
    <Nav.Link href={`/experiment/${experimentId}`} active={isActive(`/experiment/${experimentId}`)}>
      Experiment
    </Nav.Link>
  );
  const SessionLink = (
    <Nav.Link
      href={`/experiment/${experimentId}/session/${recordingSessionId}`}
      active={isActive(`/experiment/${experimentId}/session/${recordingSessionId}`)}
    >
      Session
    </Nav.Link>
  );
  const RunLink = (
    <Nav.Link
      href={`/experiment/${experimentId}/session/${recordingSessionId}/run/${runId}`}
      active={isActive(`/experiment/${experimentId}/session/${recordingSessionId}/run/${runId}`)}
    >
      Run
    </Nav.Link>
  );

  if (!experimentId) {
    return experimentListLink;
  }
  if (runId) {
    return (
      <>
        {experimentListLink}
        {'/'}
        {experimentLink}
        {'/'}
        {SessionLink}
        {'/'}
        {RunLink}
      </>
    );
  }
  if (recordingSessionId) {
    return (
      <>
        {experimentListLink}
        {'/'}
        {experimentLink}
        {'/'}
        {SessionLink}
      </>
    );
  }
  if (experimentId) {
    return (
      <>
        {experimentListLink}
        {'/'}
        {experimentLink}
      </>
    );
  }
};

const Header: React.FC = () => {
  const router = useRouter();
  const {data: session, status} = useSession();

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand
            href="/"
            css={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Image src="/favicon.svg" alt="Staircase recorder logo" width={22} height={22} />
            <span>Staircase Recorder</span>
          </Navbar.Brand>
          <Navbar.Collapse>
            <Nav className="me-auto">
              {router.pathname !== '/' && (
                <div css={{display: 'flex', alignItems: 'center'}}>
                  <BreadCrumb
                    experimentId={router.query.experimentId as string}
                    recordingSessionId={router.query.recordingSessionId as string}
                    runId={router.query.runId as string}
                  />
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
          {status === 'loading' && <div>Loading login status...</div>}
          {status !== 'loading' && !session && (
            <Link href="/api/auth/signin">
              <span>Log in</span>
            </Link>
          )}
          {status !== 'loading' && session && (
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                id="dropdown-basic"
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  background: 'none',
                  color: 'inherit',
                  '&:hover': {
                    border: 'none',
                    backgroundColor: '#efefef',
                    color: 'inherit',
                  },
                  '&:active': {
                    border: 'none',
                    backgroundColor: '#efefef !important',
                    color: 'inherit !important',
                  },
                }}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt="User image"
                    width={30}
                    height={30}
                    css={{
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <div css={{width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#DDD'}}>
                    <Image
                      src="/user-avatar.svg"
                      alt="User image placeholder"
                      width={30}
                      height={30}
                      css={{
                        borderRadius: '50%',
                      }}
                    />
                  </div>
                )}
                <span>
                  {session.user.name} ({session.user.email})
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => signOut()} css={{color: 'darkred'}}>
                  <span>Log out</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
