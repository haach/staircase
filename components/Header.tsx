import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/router';

const Header: React.FC = () => {
  const router = useRouter();

  const links = [
    {id: 'home', href: '/', label: 'Home'},
    {id: 'experiments', href: '/experiments', label: 'Experiment overview'},
  ];

  const isActive: (pathname: string) => boolean = (pathname) => router.pathname === pathname;

  return (
    <nav>
      {links.map(({id, href, label}) => (
        <Link key={id} href={href}>
          <a data-active={isActive('/')}>{label}</a>
        </Link>
      ))}
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
