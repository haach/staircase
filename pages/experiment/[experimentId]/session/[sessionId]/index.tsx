import {Prisma} from '@prisma/client';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {Group, Mouse, Run, Session} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const session = await prisma.session.findUnique({
    where: {id: params.sessionId as string},
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
      session: serialize(session),
      groups: serialize(groups),
    },
  };
};

const getFreshRuns = async (id) => {
  const body: Prisma.RunFindManyArgs = {
    where: {sessionId: id},
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
    include: {
      Mouse: true,
    },
  };
  const res = await fetch('/api/run/readMany', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Error fetching runs');
  }
  return res.json();
};

const deleteRun = async (run_id) => {
  const body: Prisma.RunDeleteArgs = {
    where: {id: run_id},
  };
  const res = await fetch('/api/run/delete', {method: 'POST', body: JSON.stringify(body)});
  if (!res.ok) {
    throw new Error('Error deleting run ' + run_id);
  }
  return res.json();
};

const createNewRun = async (sessionId, mouseId) => {
  const body: Prisma.RunCreateArgs = {
    data: {
      Session: {connect: {id: sessionId}},
      Mouse: {connect: {id: mouseId}},
    },
  };
  const res = await fetch('/api/run/create', {method: 'POST', body: JSON.stringify(body)});
  if (!res.ok) {
    throw new Error('Error creating run');
  }
  return res.json();
};

const markMouseAsDeceased = async (mouse_id) => {
  const body: Prisma.MouseUpdateArgs = {
    where: {id: mouse_id},
    data: {
      deceasedAt: new Date(),
    },
  };
  const res = await fetch('/api/mouse/update', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Error marking mouse as deceased');
  }
  return res.json();
};

type Props = {
  session: Session;
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

const SessionDetail: React.FC<Props> = (props) => {
  const [structuredRunList, setStructuredRunList] = useState(getRunsPerGroup(props.groups, props.session.runs));

  const router = useRouter();
  const updateRunList = () => {
    // Update session and hydrate view
    getFreshRuns(props.session.id).then((data) => setStructuredRunList(getRunsPerGroup(props.groups, data)));
  };

  return (
    <Layout>
      <div className="page">
        <h1>Session recording started on {new Date(props.session.createdAt).toLocaleDateString()}</h1>
        <p>
          Author: {props.session.author?.name} ({props.session.author?.email})
        </p>
        <main>
          {structuredRunList.map((group) => (
            <div key={group.id}>
              <h2>Group {group.groupNumber}</h2>
              {group.mice?.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Mouse No.</th>
                      <th>Chip No.</th>
                      <th>Gender</th>
                      <th>Geno Type</th>
                      <th>Deceased</th>
                      <th>Recorded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.mice.map((mouse) => (
                      <tr key={mouse.id} className={mouse.run ? 'green' : 'grey'}>
                        <td>{mouse.mouseNumber}</td>
                        <td>{mouse.chipNumber}</td>
                        <td>{mouse.gender}</td>
                        <td>{mouse.genoType}</td>
                        <td>
                          {mouse.deceasedAt ?? (
                            <button onClick={() => markMouseAsDeceased(mouse.id)}>Mark as deceased</button>
                          )}
                        </td>
                        <td>
                          {mouse.run ? (
                            <>
                              <Link href={{pathname: `${router.asPath}/run/${mouse.run.id}`}}>
                                <a>View</a>
                              </Link>
                              <button
                                disabled={!!props.session.Experiment.closedAt}
                                onClick={() => {
                                  deleteRun(mouse.run.id).then(() => updateRunList());
                                }}
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                createNewRun(props.session.id, mouse.id).then((res) => {
                                  router.push(`${router.asPath}/run/${res.id}`);
                                })
                              }
                              disabled={!!props.session.Experiment.closedAt}
                            >
                              Record a run
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}

          {(!!props.session.Experiment.closedAt || props.session.Experiment.groups?._count < 1) && (
            <p>
              ⚠️ This experiment is not properly set up yet. Please create subjects before you start recording data.{' '}
              <Link href={`/experiment/${props.session.Experiment.id}/update`}>
                <a>Go to experiment setup</a>
              </Link>
            </p>
          )}
        </main>
      </div>
      <style jsx>{`
        .grey {
          color: grey;
        }
        .green {
          color: green;
        }
      `}</style>
    </Layout>
  );
};

export default SessionDetail;
