import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';

const BreadCrumb: React.FC<{
  experimentId?: string;
  sessionId?: string;
  runId?: string;
}> = ({experimentId, sessionId, runId}) => {
  const experimentListLink = <Link href={`/experiments`}>Experiment list</Link>;
  const experimentLink = <Link href={`/experiment/${experimentId}`}>Experiment</Link>;
  const SessionLink = <Link href={`/experiment/${experimentId}/`}>Session</Link>;
  const RunLink = <Link href={`/experiment/${experimentId}/session/${sessionId}`}>Run</Link>;

  if (!experimentId) {
    return experimentListLink;
  }
  if (runId) {
    return (
      <div>
        {experimentListLink}
        {' >> '}
        {experimentLink}
        {' >> '}
        {SessionLink}
        {' >> '}
        {RunLink}
      </div>
    );
  }
  if (sessionId) {
    return (
      <div>
        {experimentListLink}
        {' >> '}
        {experimentLink}
        {' >> '}
        {SessionLink}
      </div>
    );
  }
  if (experimentId) {
    return (
      <div>
        {experimentListLink}
        {' >> '}
        {experimentLink}
      </div>
    );
  }
};

const Header: React.FC = () => {
  const router = useRouter();

  const links = [
    /* {id: 'home', href: '/', label: 'Home'}, */
    {id: 'experiments', href: '/experiments', label: 'Experiment overview'},
  ];
  const isActive: (pathname: string) => boolean = (pathname) => router.pathname === pathname;

  return (
    <nav>
      {/* {links.map(({id, href, label}) => (
        <Link key={id} href={href}>
          <a data-active={isActive('/')}>{label}</a>
        </Link>
      ))} */}
      {router.pathname !== '/' && (
        <BreadCrumb
          experimentId={router.query.experimentId as string}
          sessionId={router.query.sessionId as string}
          runId={router.query.runId as string}
        />
      )}
      <style jsx>{`
        nav {
          width: 100%;
          display: flex;
          padding: 2rem;
          align-items: center;
        }
      `}</style>
    </nav>
  );
};

export default Header;
