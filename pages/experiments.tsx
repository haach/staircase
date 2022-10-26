/** @jsxImportSource @emotion/react */
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {prismaExperimentFindManyArgs} from 'pages/api/experiment/readMany';
import React, {useState} from 'react';
import {Badge, Button, Table} from 'react-bootstrap';
import {Experiment} from 'types';
import Layout from '../components/Layout';
import prisma from '../lib/prisma';
import {serialize} from '../utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const experimentList = await prisma.experiment.findMany(prismaExperimentFindManyArgs);
  return {
    props: {
      experimentList: serialize(experimentList),
    },
  };
};

const getFreshExperimentList = async () => {
  const res = await fetch('/api/experiment/readMany', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Error fetching experiment list');
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
      <h1>Experiment list</h1>

      <main>
        {experimentList.length < 1 && <div>There are no experiments recorded yet.</div>}
        {experimentList.length > 0 && (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                {/* <th>Start date</th> */}
                <th>Last updated</th>
                <th>Sessions</th>
                <th>Groups</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {experimentList.map((experiment) => (
                <Link href={{pathname: `/experiment/${experiment.id}`}} key={experiment.id}>
                  <tr css={{cursor: 'pointer'}}>
                    <td>{experiment.name}</td>
                    <td>{experiment.displayId}</td>
                    {/* <td>
                      {new Date(experiment.createdAt).toLocaleString()}
                    </td> */}
                    <td>{new Date(experiment.updatedAt).toLocaleString()}</td>
                    <td>{experiment.recordingSessions?.length ?? 0}</td>
                    <td>{experiment.groups?.length ?? 0}</td>
                    <td>
                      {experiment.closedAt ? (
                        <Badge bg="success" title={`Closed at ${experiment.closedAt.toLocaleString()}`}>
                          closed
                        </Badge>
                      ) : (
                        <Badge bg="light" text="dark">
                          open
                        </Badge>
                      )}
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </Table>
        )}
        <Link href="/experiment/create">
          <Button>Create experiment</Button>
        </Link>
      </main>
    </Layout>
  );
};

export default ExperimentOverview;
