import {Prisma} from '@prisma/client';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {connect} from 'tls';
import {Run, Session} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const run = await prisma.run.findUnique({
    where: {id: params.runId as string},
  });
  return {
    props: {
      session: serialize(run),
    },
  };
};

/* const getFreshRuns = async (id) => {
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
}; */

/* const deleteRun = async (session_id) => {
  const data: Prisma.RunDeleteArgs = {
    where: {id: session_id},
  };
  const res = await fetch('/api/run/delete', {method: 'POST', body: JSON.stringify(data)});
  if (!res.ok) {
    throw new Error('Error deleting run ' + session_id);
  }
  return res.json();
}; */

/* const createNewRun = async (sessionId) => {
  const data: Prisma.RunCreateInput = {
    Session: {connect: {id: sessionId}},
  };
  const res = await fetch('/api/run/create', {method: 'POST', body: JSON.stringify({data})});
  if (!res.ok) {
    throw new Error('Error creating run');
  }
  return res.json();
}; */

type Props = {
  run: Run;
};

const RunDetail: React.FC<Props> = (props) => {
  const router = useRouter();
  return (
    <Layout>
      <div className="page">
        <h1>Mouse {}</h1>
        <main></main>
      </div>
    </Layout>
  );
};

export default RunDetail;
