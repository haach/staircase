import {Prisma} from '@prisma/client';
import {GetStaticProps} from 'next';
import Link from 'next/link';
import React from 'react';
import {Experiment} from 'types';
import Layout from '../components/Layout';
import prisma from '../lib/prisma';
import {serialize} from '../utils';

export const getStaticProps: GetStaticProps = async () => {
  const experiments = await prisma.experiment.findMany({
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  });
  return {
    props: {
      experiments: serialize(experiments),
    },
    revalidate: 10,
  };
};

type Props = {
  // Switch to correct aggregated type
  experiments: Array<Experiment>;
};

const ExperimentOverview: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="page">
        <h1>Experiment overview</h1>

        <Link href="/experiment/create">
          <a>Create experiment</a>
        </Link>

        <main>
          {props.experiments.length < 1 ? (
            <div>
              There are no experiments recorded yet.
              <Link href="/experiment/create">
                <a>Create experiment</a>
              </Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start date</th>
                  <th>Last updated</th>
                  <th>Sessions recorded</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {props.experiments.map((experiment) => (
                  <tr key={experiment.id} className="post">
                    <td>{experiment.name}</td>
                    <td>{new Date(experiment.createdAt).toLocaleString()}</td>
                    <td>{new Date(experiment.updatedAt).toLocaleString()}</td>
                    <td>{experiment.sessions?.length ?? 0}</td>
                    <td>
                      {experiment.closedAt ? (
                        <span title={`Closed at ${experiment.closedAt.toLocaleString()}`}>closed</span>
                      ) : (
                        <span>open</span>
                      )}
                    </td>
                    <td>
                      {!experiment.closedAt && (
                        <Link href={{pathname: `/experiment/${experiment.id}`}}>
                          <a>Edit</a>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentOverview;