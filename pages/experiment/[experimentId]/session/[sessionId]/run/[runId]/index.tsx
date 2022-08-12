import {Prisma} from '@prisma/client';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {Mouse, Run} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const run = await prisma.run.findUnique({
    where: {id: params.runId as string},
    include: {
      Mouse: true,
    },
  });
  return {
    props: {
      run: serialize(run),
    },
  };
};

export const getMiceByExperimentId = async (experimentId) => {
  const data: Prisma.MouseFindManyArgs = {
    where: {experimentId},
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  };
  const res = await fetch('/api/mouse/readMany', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Error fetching mice');
  }
  return res.json();
};

const linkMouseToRun = async (experimentId, mouseId) => {
  const data: Prisma.RunUpdateArgs = {
    where: {id: experimentId},
    data: {
      Mouse: {
        connect: {
          id: mouseId,
        },
      },
    },
  };
  const res = await fetch('/api/run/update', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error('Error connecting mouse to run');
  }
  return res.json();
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
  const runListLength = Number(router.query.runListLength);
  const [mouse, setMouse] = useState<Mouse>(props.run.Mouse);

  useEffect(() => {
    !mouse && prefillMouse();
  }, []);

  const prefillMouse = () => {
    getMiceByExperimentId(router.query.experimentId).then((res) => {
      // Prefill the mouse with the next mouse in the experiment
      const nextMouse = (): Mouse => {
        if (runListLength > 0) {
          if (runListLength < res.length) return res[runListLength];
          else return res[res.length - 1];
        } else return res[0];
      };
      linkMouseToRun(props.run.id, nextMouse().id);
      setMouse(nextMouse());
    });
  };

  return (
    <Layout>
      <div className="page">
        <h1>Mouse</h1>
        {mouse && (
          <p>
            Chip {mouse.chipId} - Pyrat {mouse.pyratId} - {mouse.gender.toLowerCase()}
          </p>
        )}
        <main></main>
      </div>
    </Layout>
  );
};

export default RunDetail;
