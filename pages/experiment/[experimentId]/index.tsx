import {Prisma} from '@prisma/client';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {Experiment} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const experiment = await prisma.experiment.findUnique({
    where: {id: params.experimentId as string},
    include: {
      mice: true,
      sessions: {
        include: {
          author: true,
          runs: true,
        },
      },
    },
  });
  return {
    props: {
      experiment: serialize(experiment),
    },
  };
};

const getFreshSessions = async (id) => {
  const data: Prisma.SessionFindManyArgs = {
    where: {experimentId: id},
    include: {
      author: true,
      runs: true,
    },
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  };
  const res = await fetch('/api/session/readMany', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Error fetching sesions');
  }
  const sessionResponse = await res.json();
  return sessionResponse;
};

const deleteSession = async (session_id) => {
  const data: Prisma.SessionDeleteArgs = {
    where: {id: session_id},
  };
  const res = await fetch('/api/session/delete', {method: 'POST', body: JSON.stringify(data)});
  if (!res.ok) {
    throw new Error('Error deleting sesion ' + session_id);
  }
  return res.json();
};

const createNewSession = async (experimentId) => {
  const data: Prisma.SessionCreateInput = {
    author: {
      connect: {
        // Hard code for now before we have Auth
        // TODO: Fix later
        id: 'cl6nyyt2c003715gxk49nm5gi',
      },
    },
    Experiment: {
      connect: {
        id: experimentId,
      },
    },
  };
  const res = await fetch('/api/session/create', {method: 'POST', body: JSON.stringify({data})});
  if (!res.ok) {
    throw new Error('Error creating run');
  }
  return res.json();
};

type Props = {
  experiment: Experiment;
};

const ExperimentDetail: React.FC<Props> = (props) => {
  const [sessionList, setSessionList] = useState(props.experiment.sessions); // Initially use prerendered props
  const router = useRouter();
  console.log('router', router);

  const updateSessionList = () => {
    // Update session list and hydrate view
    getFreshSessions(props.experiment.id).then((data) => setSessionList(data));
  };

  return (
    <Layout>
      <div className="page">
        <h1>Experiment: {props.experiment.name}</h1>

        <p>Created {new Date(props.experiment.createdAt).toLocaleString()}</p>
        {!props.experiment.closedAt && <p>Last Updated {new Date(props.experiment.updatedAt).toLocaleString()}</p>}
        {!!props.experiment.closedAt && (
          <p>
            Closed at {new Date(props.experiment.closedAt).toLocaleString()} <button>REOPEN</button>
          </p>
        )}
        <p>Mice count: {props.experiment.mice?.length ?? 0}</p>
        <main>
          <h2>Sessions </h2>
          {sessionList.length < 1 && <div>There are no sessions in this experiment.</div>}

          {sessionList.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Author</th>
                  <th>Created at</th>
                  <th>Last updated</th>
                  <th>Runs</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sessionList.map((session, idx) => (
                  <tr key={session.id} className="post">
                    <td>{idx + 1}</td>
                    <td>
                      {session.author.name} ({session.author.email})
                    </td>

                    <td>{new Date(session.createdAt).toLocaleString()}</td>
                    <td>{new Date(session.updatedAt).toLocaleString()}</td>
                    <td>{session.runs?.length ?? 0}</td>

                    <td>
                      <Link href={{pathname: `${router.asPath}/session/${session.id}`}}>
                        <a>View</a>
                      </Link>
                      <button
                        onClick={() => {
                          deleteSession(session.id).then(() => updateSessionList());
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button onClick={() => createNewSession(props.experiment.id).then(() => updateSessionList())}>
            Start a new session
          </button>
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentDetail;
