/** @jsxImportSource @emotion/react */
import {css} from '@emotion/react';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {Button, Table} from 'react-bootstrap';
import {Group, RecordingSession, Run} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const recordingSession = await prisma.recordingSession.findUnique({
    where: {id: params.recordingSessionId as string},
    include: {
      author: true,
      runs: {
        include: {
          Mouse: true,
        },
      },
      Experiment: {
        select: {
          id: true,
          name: true,
          closedAt: true,
          groups: {
            select: {
              _count: true,
            },
          },
        },
      },
    },
  });
  const groups = await prisma.group.findMany({
    where: {experimentId: params.experimentId as string},
    include: {
      mice: true,
    },
  });
  return {
    props: {
      recordingSession: serialize(recordingSession),
      groups: serialize(groups),
    },
  };
};

const getFreshRuns = async (id) => {
  const res = await fetch('/api/run/readMany', {
    method: 'POST',
    body: id,
  });
  if (!res.ok) {
    throw new Error('Error fetching runs');
  }
  return res.json();
};

const deleteRun = async (run_id) => {
  const res = await fetch('/api/run/delete', {method: 'POST', body: run_id});
  if (!res.ok) {
    throw new Error('Error deleting run ' + run_id);
  }
  return res.json();
};

const createNewRun = async (recordingSessionId, mouseId) => {
  const res = await fetch('/api/run/create', {method: 'POST', body: JSON.stringify({recordingSessionId, mouseId})});
  if (!res.ok) {
    throw new Error('Error creating run');
  }
  return res.json();
};

const updateMouse = async (mouse) => {
  const res = await fetch('/api/mouse/update', {
    method: 'POST',
    body: JSON.stringify({...mouse, run: undefined}),
  });
  if (!res.ok) {
    throw new Error('Error marking mouse as deceased');
  }
  return res.json();
};

type Props = {
  recordingSession: RecordingSession;
  groups: Group[];
};

const getRunsPerGroup = (groups: Group[] = [], runs: Run[] = []) => {
  // used to check if a mouse has already a recorded run
  const miceIdOfRecordedRuns = runs.map((run) => run.Mouse.id);

  return groups.map((group) => ({
    ...group,
    mice: group.mice.map((mouse) => ({
      ...mouse,
      run: miceIdOfRecordedRuns.includes(mouse.id) ? runs.find((run) => run.Mouse.id === mouse.id) : null,
    })),
  }));
};

const RecordingSessionDetail: React.FC<Props> = (props) => {
  const [structuredRunList, setStructuredRunList] = useState(
    getRunsPerGroup(props.groups, props.recordingSession.runs)
  );

  const router = useRouter();
  const updateRunList = () => {
    // Update recordingSession and hydrate view
    getFreshRuns(props.recordingSession.id).then((data) => setStructuredRunList(getRunsPerGroup(props.groups, data)));
  };

  return (
    <Layout>
      <div className="page">
        <h1>Session recording started on {new Date(props.recordingSession.createdAt).toLocaleDateString()}</h1>
        <p>
          Author: {props.recordingSession.author?.name} ({props.recordingSession.author?.email})
        </p>
        <main>
          {structuredRunList.map((group) => (
            <div key={group.id}>
              <h2>Group {group.groupNumber}</h2>
              {group.mice?.length > 0 && (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Mouse No.</th>
                      <th>Chip No.</th>
                      <th>Gender</th>
                      <th>Geno Type</th>
                      <th>Deceased</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.mice.map((mouse) => {
                      const tableRow = (
                        <>
                          <td>{mouse.run ? '✅' : '⬜️'}</td>
                          <td>
                            <span>{mouse.mouseNumber}</span>
                          </td>
                          <td>
                            <span>{mouse.chipNumber}</span>
                          </td>
                          <td>
                            <span>{mouse.gender}</span>
                          </td>
                          <td>
                            <span>{mouse.genoType}</span>
                          </td>
                          <td>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={!!props.recordingSession.Experiment.closedAt}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMouse({...mouse, deceasedAt: mouse.deceasedAt ? null : new Date()}).then(() => {
                                  console.log('Need to update recordingSession');
                                });
                              }}
                            >
                              {mouse.deceasedAt ? 'Mark as alive 🐭' : 'Mark as deceased 💀'}
                            </Button>
                          </td>
                          <td>
                            {mouse.run && (
                              <Button
                                variant="danger"
                                size="sm"
                                disabled={!!props.recordingSession.Experiment.closedAt || !!mouse.deceasedAt}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteRun(mouse.run.id).then(() => updateRunList());
                                }}
                              >
                                Delete
                              </Button>
                            )}
                          </td>
                        </>
                      );
                      return mouse.run ? (
                        <Link key={mouse.id} href={`${router.asPath}/run/${mouse.run.id}`}>
                          <tr
                            css={css`
                              cursor: pointer;
                            `}
                            key={mouse.id}
                          >
                            {tableRow}
                          </tr>
                        </Link>
                      ) : (
                        <tr
                          css={[
                            css`
                              cursor: pointer;
                            `,
                            !!mouse.deceasedAt &&
                              css`
                                opacity: 0.8;
                                cursor: not-allowed;
                                &:hover {
                                  td {
                                    --bs-table-accent-bg: transparent !important;
                                  }
                                }
                              `,
                          ]}
                          key={mouse.id}
                          onClick={() =>
                            !mouse.deceasedAt &&
                            createNewRun(props.recordingSession.id, mouse.id).then((res) => {
                              router.push(`${router.asPath}/run/${res.id}`);
                            })
                          }
                        >
                          {tableRow}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          ))}

          {(props.recordingSession.Experiment.groups?._count < 1 || props.recordingSession.Experiment.closedAt) && (
            <p>
              {props.recordingSession.Experiment.groups?._count < 1 && (
                <>
                  ⚠️ The experiment <b>{props.recordingSession.Experiment.name}</b> is not properly set up yet. Please
                  create subjects before you start recording data.{' '}
                </>
              )}
              {props.recordingSession.Experiment.closedAt && (
                <>
                  ⚠️ The experiment <b>{props.recordingSession.Experiment.name}</b> was concluded. If you want to add
                  more data, it needs to be re-opened.{' '}
                </>
              )}
              <Link href={`/experiment/${props.recordingSession.Experiment.id}/update`}>
                <a>Go to experiment setup</a>
              </Link>
            </p>
          )}
        </main>
      </div>
    </Layout>
  );
};

export default RecordingSessionDetail;
