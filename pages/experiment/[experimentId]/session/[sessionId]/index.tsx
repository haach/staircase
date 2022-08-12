import {Prisma} from '@prisma/client';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {connect} from 'tls';
import {Session} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const session = await prisma.session.findUnique({
    where: {id: params.sessionId as string},
    include: {
      author: true,
      runs: true,
    },
  });
  return {
    props: {
      session: serialize(session),
    },
  };
};

const getFreshRuns = async (id) => {
  const data: Prisma.RunFindManyArgs = {
    where: {sessionId: id},
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  };
  const res = await fetch('/api/run/readMany', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Error fetching runs');
  }
  const sessionResponse = await res.json();
  return sessionResponse;
};

const deleteRun = async (run_id) => {
  const data: Prisma.RunDeleteArgs = {
    where: {id: run_id},
  };
  const res = await fetch('/api/run/delete', {method: 'POST', body: JSON.stringify(data)});
  if (!res.ok) {
    throw new Error('Error deleting run ' + run_id);
  }
  return res.json();
};

const createNewRun = async (sessionId) => {
  const data: Prisma.RunCreateInput = {
    Session: {connect: {id: sessionId}},
  };
  const res = await fetch('/api/run/create', {method: 'POST', body: JSON.stringify({data})});
  if (!res.ok) {
    throw new Error('Error creating run');
  }
  return res.json();
};

type Props = {
  session: Session;
};

const SessionDetail: React.FC<Props> = (props) => {
  const [runList, setRunList] = useState(props.session.runs); // Initially use prerendered props
  const router = useRouter();

  const updateRunList = () => {
    // Update session list and hydrate view
    getFreshRuns(props.session.id).then((data) => setRunList(data));
  };

  return (
    <Layout>
      <div className="page">
        <h1>Session recording started on {new Date(props.session.createdAt).toLocaleDateString()}</h1>
        <p>
          Author: {props.session.author?.name} ({props.session.author?.email})
        </p>
        <main>
          {runList.length < 1 && <div>There are no runs in this session.</div>}
          {runList.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>No.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {runList.map((run, idx) => (
                  <tr key={run.id} className="post">
                    {console.log('run', run)}
                    <td>{idx + 1}</td>
                    <td>
                      <Link href={{pathname: `${router.asPath}/run/${run.id}`}}>
                        <a>View</a>
                      </Link>
                      <button
                        onClick={() => {
                          deleteRun(run.id).then(() => updateRunList());
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
          <button
            onClick={() =>
              createNewRun(props.session.id).then((res) => {
                router.push(`${router.asPath}/run/${res.id}?runListLength=${runList.length}`);
              })
            }
          >
            Record a run
          </button>
        </main>
      </div>
    </Layout>
  );
};

export default SessionDetail;