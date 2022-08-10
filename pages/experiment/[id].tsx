import {Prisma} from '@prisma/client';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import React, {useEffect, useState} from 'react';
import {Experiment, Session, User} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const experiment = await prisma.experiment.findUnique({
    where: {id: params.id as string},
  });
  return {
    props: {
      experiment: serialize(experiment),
    },
  };
};

type Props = {
  experiment: Experiment;
};

const ExperimentDetail: React.FC<Props> = (props) => {
  const [sessions, setSessions] = useState([]);

  const getFreshSessions = async () => {
    const res = await fetch('/api/session/readMany', {
      method: 'POST',
      body: JSON.stringify({
        where: {experimentId: props.experiment.id},
        include: {
          author: true,
        },
      }),
    });
    if (!res.ok) {
      throw new Error('Error fetching sesions');
    }
    const sessionResponse = await res.json();
    setSessions(sessionResponse);
  };

  const createNewSession = async () => {
    const data: Prisma.SessionCreateInput = {
      author: {
        connect: {
          // Hard code for now before we have Auth
          // TODO: Fix later
          id: 'cl6nyyt2c003715gxk49nm5gi',
        },
      },
      experiment: {
        connect: {
          id: props.experiment.id,
        },
      },
    };
    const res = await fetch('/api/session/create', {method: 'POST', body: JSON.stringify({data})});
    if (!res.ok) {
      throw new Error('Error fetching sesions');
    }
    getFreshSessions();
  };

  const deleteSession = async (session_id) => {
    const data: Prisma.SessionDeleteArgs = {
      where: {id: session_id},
    };
    const res = await fetch('/api/session/delete', {method: 'POST', body: JSON.stringify(data)});
    if (!res.ok) {
      throw new Error('Error deleting sesion ' + session_id);
    }
    getFreshSessions();
  };

  useEffect(() => {
    // Initially load sessions in run time
    getFreshSessions();
  }, []);

  return (
    <Layout>
      <div className="page">
        <h1>Experiment: {props.experiment.name}</h1>

        <button onClick={() => createNewSession()}>Start a new session</button>

        <p>Created {new Date(props.experiment.createdAt).toLocaleString()}</p>
        {!props.experiment.closedAt && <p>Last Updated {new Date(props.experiment.updatedAt).toLocaleString()}</p>}
        {!!props.experiment.closedAt && (
          <p>
            Closed at {new Date(props.experiment.closedAt).toLocaleString()} <button>REOPEN</button>
          </p>
        )}
        <main>
          <h2>Sessions </h2>
          {sessions?.length > 0 ? (
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
                {sessions.map((session, idx) => (
                  <tr key={session.id} className="post">
                    <td>{idx + 1}</td>
                    <td>
                      {session.author.name} ({session.author.email})
                    </td>

                    <td>{new Date(session.createdAt).toLocaleString()}</td>
                    <td>{new Date(session.updatedAt).toLocaleString()}</td>
                    <td>{session.runs?.length ?? 0}</td>

                    <td>
                      <Link href={{pathname: `/experiment/${session.id}`}}>
                        <a>Edit</a>
                      </Link>
                      <button onClick={() => deleteSession(session.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>
              There are no sessions in this experiment.
              <button onClick={() => createNewSession()}>Start a new session</button>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentDetail;
