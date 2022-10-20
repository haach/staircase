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
      groups: {
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
      },
      recordingSessions: {
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
  const body: Prisma.RecordingSessionFindManyArgs = {
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
  const res = await fetch('/api/recordingSession/readMany', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Error fetching sesions');
  }
  return res.json();
};

const deleteSession = async (recordingSession_id) => {
  const body: Prisma.SessionDeleteArgs = {
    where: {id: recordingSession_id},
  };
  const res = await fetch('/api/recordingSession/delete', {method: 'POST', body: JSON.stringify(body)});
  if (!res.ok) {
    throw new Error('Error deleting sesion ' + recordingSession_id);
  }
  return res.json();
};

const createNewSession = async (experimentId) => {
  const body: Prisma.RecordingSessionCreateArgs = {
    data: {
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
    },
  };
  const res = await fetch('/api/recordingSession/create', {method: 'POST', body: JSON.stringify(body)});
  if (!res.ok) {
    throw new Error('Error creating run');
  }
  return res.json();
};

const openCloseExperiment = async (experimentId, setClosed: boolean) => {
  const body: Prisma.ExperimentUpdateArgs = {
    where: {id: experimentId},
    data: {
      closedAt: setClosed ? new Date() : null,
    },
  };
  const res = await fetch('/api/experiment/update', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('Error updating experiment');
  }
  // TODO: User feedback for success and failure
  return res.json();
};

type Props = {
  experiment: Experiment;
};

const ExperimentDetail: React.FC<Props> = (props) => {
  const [recordingSessionList, setRecordingSessionList] = useState(props.experiment.recordingSessions); // Initially use prerendered props
  const [closed, setClosed] = useState<boolean>(props.experiment.closedAt !== null);
  const router = useRouter();

  const updateSessionList = () => {
    // Update recordingSession list and hydrate view
    getFreshSessions(props.experiment.id).then((data) => setRecordingSessionList(data));
  };

  return (
    <Layout>
      <div className="page">
        <h1>
          Experiment: {props.experiment.name} {props.experiment.displayId} {closed && '🔓 closed'}
        </h1>

        <p>Created {new Date(props.experiment.createdAt).toLocaleString()}</p>
        {!props.experiment.closedAt && <p>Last Updated {new Date(props.experiment.updatedAt).toLocaleString()}</p>}
        {!!props.experiment.closedAt && <p>Closed at {new Date(props.experiment.closedAt).toLocaleString()}</p>}
        <p>{props.experiment.groups?.length ?? 0} groups</p>

        <Link href={{pathname: `/experiment/${props.experiment.id}/update`}}>
          <button disabled={closed}>Edit setup</button>
        </Link>

        <button
          onClick={() => {
            openCloseExperiment(props.experiment.id, !closed).then(() => {
              setClosed(!closed);
            });
          }}
        >
          {closed ? 'Reopen experiment' : 'Close experiment'}
        </button>

        <main>
          <h2>Sessions </h2>
          {recordingSessionList.length < 1 && <div>There are no sessions in this experiment.</div>}

          {recordingSessionList.length > 0 && (
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
                {recordingSessionList.map((recordingSession, idx) => (
                  <tr key={recordingSession.id} className="post">
                    <td>{idx + 1}</td>
                    <td>
                      {recordingSession.author.name} ({recordingSession.author.email})
                    </td>

                    <td>{new Date(recordingSession.createdAt).toLocaleString()}</td>
                    <td>{new Date(recordingSession.updatedAt).toLocaleString()}</td>
                    <td>{recordingSession.runs?.length ?? 0}</td>

                    <td>
                      <Link href={{pathname: `${router.asPath}/session/${recordingSession.id}`}}>
                        <a>View</a>
                      </Link>
                      <button
                        disabled={closed}
                        onClick={() => {
                          deleteSession(recordingSession.id).then(() => updateSessionList());
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
            disabled={closed}
            onClick={() => createNewSession(props.experiment.id).then(() => updateSessionList())}
          >
            Start a new session
          </button>
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentDetail;
