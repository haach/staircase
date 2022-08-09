import {Prisma} from '@prisma/client';
import {GetStaticProps} from 'next';
import React from 'react';
import Layout from '../components/Layout';
import prisma from '../lib/prisma';

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.mouse.findMany({
    where: {deceased: false},
    /* include: {
      author: {
        select: {name: true},
      },
    }, */
  });
  console.log('feed', feed);
  return {
    props: {feed},
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
        <h1>Public Feed</h1>
        <main>
          {props.feed.map((post) => (
            <div key={post.id} className="post">
              {/* <Post post={post} /> */}
              {JSON.stringify(post)}
            </div>
          ))}
        </main>
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
