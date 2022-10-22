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
      RecordingSession: {include: {Experiment: {select: {closedAt: true}}}},
    },
  });
  return {
    props: {
      run: serialize(run),
    },
  };
};

export const getGroupsByExperimentId = async (experimentId): Promise<Array<Mouse>> => {
  const body: Prisma.GroupFindManyArgs = {
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
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Error fetching mice');
  }
  return res.json();
};

type Props = {
  run: Run;
};

const handleSubmit = async (forrmState) => {
  const body: Prisma.RunUpdateArgs = {
    where: {id: forrmState.id},
    data: {...forrmState, Mouse: undefined},
  };
  const res = await fetch('/api/run/update', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Error updating experiment');
  }
  // TODO: User feedback for success and failure
  return res.json();
};

const RunDetail: React.FC<Props> = (props) => {
  const [formState, setFormState] = useState<Partial<Run>>(props.run);
  const router = useRouter();

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
              // TODO: Check validity of form input
              handleSubmit(formState).then(() =>
                router.push(`/experiment/${router.query.experimentId}/session/${router.query.recordingSessionId}`)
              );
            }}
          >
            <>
              <fieldset>
                <legend>Right paw:</legend>
                {InputGenerator(
                  formState.right.map((pellets, idx) => ({
                    label: `Stair ${idx}`,
                    name: `right-stair-${idx}`,
                    id: `right-stair-${idx}`,
                    type: 'number',
                    min: 0,
                    max: 8,
                    defaultValue: pellets,
                    required: true,
                    readOnly: !!props.run.RecordingSession.Experiment.closedAt,
                    onChange: (e: ChangeEvent<HTMLInputElement>) => {
                      const newState = {...formState};
                      newState.right[idx] = Number(e.target.value);
                      setFormState(newState);
                    },
                  }))
                )}
              </fieldset>
              <fieldset>
                <legend>Left paw:</legend>
                {InputGenerator(
                  formState.left.map((pellets, idx) => ({
                    label: `Stair ${idx}`,
                    name: `left-stair-${idx}`,
                    id: `left-stair-${idx}`,
                    type: 'number',
                    min: 0,
                    max: 8,
                    defaultValue: pellets,
                    required: true,
                    readOnly: !!props.run.RecordingSession.Experiment.closedAt,
                    onChange: (e: ChangeEvent<HTMLInputElement>) => {
                      const newState = {...formState};
                      newState.left[idx] = Number(e.target.value);
                      setFormState(newState);
                    },
                  }))
                )}
              </fieldset>
              {console.log('router.query', router.query)}
              <Link href={`/experiment/${router.query.experimentId}/session/${router.query.recordingSessionId}`}>
                <button type="button">Cancel</button>
              </Link>
              <button type="submit" disabled={!!props.run.RecordingSession.Experiment.closedAt}>
                Done
              </button>
            </>
          </form>
        </main>
      </div>
    </Layout>
  );
};

export default RunDetail;
