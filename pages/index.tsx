import {Prisma} from '@prisma/client';
import {GetStaticProps} from 'next';
import React from 'react';
import Layout from '../components/Layout';
import prisma from '../lib/prisma';
import Link from 'next/link';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="page">
        <h1>Staircase experiment recorder</h1>
        <nav>
          <Link href={{pathname: '/experiments'}}>
            <a>Go to experiment list</a>
          </Link>
        </nav>
      </div>
    </Layout>
  );
};

export default Index;
