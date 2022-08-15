import {Prisma} from '@prisma/client';
import {GetStaticProps} from 'next';
import React from 'react';
import Layout from '../components/Layout';
import prisma from '../lib/prisma';
import Link from 'next/link';

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.mouse.findMany({
    /* where: {deceased: not!== undefined={}}, */
  });
  return {
    props: {
      feed: JSON.parse(JSON.stringify(feed)),
    },
    revalidate: 10,
  };
};

type Props = {
  feed: Prisma.MouseMinAggregateOutputType[];
};

const Blog: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <h1>Mouse</h1>
        <main>
          {props.feed.map((post) => (
            <div key={post.id} className="post">
              {/* <Post post={post} /> */}
              {JSON.stringify(post)}
            </div>
          ))}
        </main>
        <nav>
          <Link href={{pathname: '/overview'}}>
            <a>Overview</a>
          </Link>
          <Link href={{pathname: '/reord-run', query: {mouseId: ''}}}>
            <a>Run recorder</a>
          </Link>
        </nav>
      </div>
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  );
};

export default Blog;
