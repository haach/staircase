/** @jsxImportSource @emotion/react */
import {InputGenerator} from 'components/InputGenerator';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {ChangeEvent, useState} from 'react';
import {Button} from 'react-bootstrap';
import {Run} from 'types';
import {isTouchDevice, serialize} from 'utils';

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

type Props = {
  run: Run;
};

const handleSubmit = async (forrmState) => {
  const res = await fetch('/api/run/update', {
    method: 'POST',
    body: JSON.stringify(forrmState),
  });
  if (!res.ok) {
    throw new Error('Error updating run');
  }
  // TODO: User feedback for success and failure
  return res.json();
};

const RunDetail: React.FC<Props> = (props) => {
  const [formState, setFormState] = useState<Partial<Run>>(props.run);
  const router = useRouter();

  const focusNext = (side: string, idx: number) => {
    if (side === 'right' && idx === 8) {
      // Focus first of left
      document.getElementById(`left-stair-0`).focus();
    } else if (side === 'left' && idx === 8) {
      // Focus submit?
    } else {
      // Focus next
      document.getElementById(`${side}-stair-${idx + 1}`).focus();
    }
  };

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
            css={{display: 'flex', flexDirection: 'column', gap: '16px'}}
          >
            <>
              <fieldset>
                <legend>Right paw:</legend>
                <div css={{display: 'flex', flexWrap: 'wrap', alignContent: 'start', gap: '8px'}}>
                  {InputGenerator(
                    formState.right.map((pellets, idx) => ({
                      label: idx === 8 ? 'Floor' : `Stair ${idx + 1}`,
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
                        // Jump to next field on touch devices
                        isTouchDevice() && e.target.value?.length > 0 && focusNext('right', idx);
                      },
                    }))
                  )}
                </div>
              </fieldset>
              <fieldset>
                <legend>Left paw:</legend>
                <div css={{display: 'flex', flexWrap: 'wrap', alignContent: 'start', gap: '8px'}}>
                  {InputGenerator(
                    formState.left.map((pellets, idx) => ({
                      label: idx === 8 ? 'Floor' : `Stair ${idx + 1}`,
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
                        // Jump to next field on touch devices
                        isTouchDevice() && e.target.value?.length > 0 && focusNext('left', idx);
                      },
                    }))
                  )}
                </div>
              </fieldset>

              <div css={{display: 'flex', alignContent: 'center', justifyContent: 'end', gap: '8px'}}>
                <Link href={`/experiment/${router.query.experimentId}/session/${router.query.recordingSessionId}`}>
                  <Button variant="danger" size="sm" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" size="sm" disabled={!!props.run.RecordingSession.Experiment.closedAt}>
                  Done
                </Button>
              </div>
            </>
          </form>
        </main>
      </div>
    </Layout>
  );
};

export default RunDetail;
