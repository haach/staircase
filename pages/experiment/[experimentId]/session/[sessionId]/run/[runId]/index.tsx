import {Prisma} from '@prisma/client';
import {InputGenerator} from 'components/InputGenerator';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {ChangeEvent, useEffect, useState} from 'react';
import {Mouse, Run} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const run = await prisma.run.findUnique({
    where: {id: params.runId as string},
    include: {
      Mouse: {include: {Group: {select: {groupNumber: true}}}},
    },
  });
  return {
    props: {
      run: serialize(run),
    },
  };
};

export const getGroupsByExperimentId = async (experimentId): Promise<Array<Mouse>> => {
  const data: Prisma.GroupFindManyArgs = {
    where: {experimentId},
    orderBy: [
      {
        groupNumber: 'asc',
      },
    ],
    include: {
      mice: {
        orderBy: [
          {
            mouseNumber: 'asc',
          },
        ],
      },
    },
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

const handleSubmit = async (formState) => {
  const updateRun = await fetch('/api/run/update', {
    method: 'POST',
    body: JSON.stringify({
      where: {id: formState.id},
      data: {...formState, Mouse: undefined},
    }),
  });
  if (!updateRun.ok) {
    throw new Error('Error updating experiment');
  }
  // TODO: User feedback for success and failure
  return 'success';
};

const RunDetail: React.FC<Props> = (props) => {
  const [formState, setFormState] = useState<Partial<Run>>(props.run ?? {});

  const router = useRouter();
  const mouseId = Number(router.query.runListLength);

  // Const used for iterator
  const stairFields = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  /* const prefillMouse = () => {
    getGroupsByExperimentId(router.query.experimentId).then((res) => {
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
  }; */

  return (
    <Layout>
      <div className="page">
        <h1>
          Group {props.run.Mouse.Group.groupNumber} Mouse {props.run.Mouse.mouseNumber}{' '}
        </h1>
        <main>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(formState).then(() =>
                router.push(`/experiment/${router.query.experimentId}/session/${router.query.sessionId}`)
              );
            }}
          >
            <fieldset>
              <legend>Right paw:</legend>
              {InputGenerator(
                stairFields.map((stair) => ({
                  label: `Stair ${stair}`,
                  name: `rs${stair}`,
                  id: `rs${stair}`,
                  type: 'number',
                  defaultValue: 0,
                  required: true,
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    const newState = {...formState};
                    newState[e.target.name] = Number(e.target.value);
                    setFormState(newState);
                  },
                }))
              )}
            </fieldset>
            <fieldset>
              <legend>Left paw:</legend>
              {InputGenerator(
                stairFields.map((stair) => ({
                  label: `Stair ${stair}`,
                  name: `ls${stair}`,
                  id: `ls${stair}`,
                  type: 'number',
                  defaultValue: 0,
                  required: true,
                  onChange: (e: ChangeEvent<HTMLInputElement>) => {
                    const newState = {...formState};
                    newState[e.target.name] = Number(e.target.value);
                    setFormState(newState);
                  },
                }))
              )}
            </fieldset>
            <Link href={`/experiment/${router.query.experimentId}/session/${router.query.sessionId}`}>
              <button type="button">Cancel</button>
            </Link>
            <button type="submit">Done</button>
          </form>
        </main>
      </div>
    </Layout>
  );
};

export default RunDetail;
