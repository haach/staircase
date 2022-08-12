import {Prisma} from '@prisma/client';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import React, {useEffect, useState} from 'react';
import {Experiment} from 'types';
import Layout from '../components/Layout';
import prisma from '../lib/prisma';
import {serialize} from '../utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const experimentList = await prisma.experiment.findMany({
    include: {mice: true, sessions: true},
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
      experimentList: serialize(experimentList),
    },
  };
};

const getFreshExperimentList = async () => {
  const data: Prisma.ExperimentFindManyArgs = {
    include: {mice: true, sessions: true},
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  };
  const res = await fetch('/api/experiment/readMany', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Error fetching experiment list');
  }
  return res.json();
};

const deleteExperiment = async (experiment_id) => {
  const data: Prisma.ExperimentDeleteArgs = {
    where: {id: experiment_id},
  };
  const res = await fetch('/api/experiment/delete', {method: 'POST', body: JSON.stringify(data)});
  if (!res.ok) {
    throw new Error('Error deleting sesion ' + experiment_id);
  }
  return res.json();
};

type Props = {
  experimentList: Array<Experiment>;
};

const ExperimentOverview: React.FC<Props> = (props) => {
  const [experimentList, setExperimentList] = useState<Array<Experiment>>(props.experimentList); // Initially use prerendered props

  const updateExperimentList = () => {
    // Update experiment list and hydrate view
    getFreshExperimentList().then((data) => setExperimentList(data));
  };

  return (
    <Layout>
      <div className="page">
        <h1>Experiment overview</h1>

        <main>
          {experimentList.length < 1 && <div>There are no experiments recorded yet.</div>}
          {experimentList.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start date</th>
                  <th>Last updated</th>
                  <th>Sessions</th>
                  <th>Mice</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {experimentList.map((experiment) => (
                  <tr key={experiment.id} className="post">
                    <td>{experiment.name}</td>
                    <td>{new Date(experiment.createdAt).toLocaleString()}</td>
                    <td>{new Date(experiment.updatedAt).toLocaleString()}</td>
                    <td>{experiment.sessions?.length ?? 0}</td>
                    <td>{experiment.mice?.length ?? 0}</td>
                    <td>
                      {experiment.closedAt ? (
                        <span title={`Closed at ${experiment.closedAt.toLocaleString()}`}>closed</span>
                      ) : (
                        <span>open</span>
                      )}
                    </td>
                    <td>
                      {!experiment.closedAt && (
                        <>
                          <Link href={{pathname: `/experiment/${experiment.id}`}}>
                            <a>View</a>
                          </Link>
                          <Link href={{pathname: `/experiment/${experiment.id}/update`}}>
                            <a>Edit setup</a>
                          </Link>
                          <button
                            onClick={() => {
                              deleteExperiment(experiment.id).then(() => updateExperimentList());
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link href="/experiment/create">
            <a>Create experiment</a>
          </Link>
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentOverview;
