import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import {Session} from 'next-auth';
import {useSession} from 'next-auth/react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {CSVDownload, CSVLink} from 'react-csv';
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

const getFreshRecordingSessions = async (id) => {
  const res = await fetch('/api/recordingSession/readMany', {
    method: 'POST',
    body: JSON.stringify({experimentId: id}),
  });
  if (!res.ok) {
    throw new Error('Error fetching sesions');
  }
  return res.json();
};

const deleteRecordingSession = async (recordingSession_id) => {
  const res = await fetch('/api/recordingSession/delete', {method: 'POST', body: recordingSession_id});
  if (!res.ok) {
    throw new Error('Error deleting sesion ' + recordingSession_id);
  }
  return res.json();
};

const createNewRecordingSession = async (session: Session, experimentId: string) => {
  if (!session?.user?.email) {
    throw new Error('User email missing in session');
  }
  const res = await fetch('/api/recordingSession/create', {
    method: 'POST',
    body: JSON.stringify({experimentId, userEmail: session.user.email}),
  });
  if (!res.ok) {
    throw new Error('Error creating recording session');
  }
  return res.json();
};

const openCloseExperiment = async (experiment: Experiment) => {
  const res = await fetch('/api/experiment/close', {
    method: 'POST',
    body: JSON.stringify(experiment),
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
  const [experiment, setExperiment] = useState<Experiment>(props.experiment); // Initially use prerendered props
  const [recordingSessionList, setRecordingSessionList] = useState(experiment?.recordingSessions); // Initially use prerendered props
  const router = useRouter();
  const {data: session} = useSession();

  const updateRecordingSessionList = () => {
    // Update recordingSession list and hydrate view
    getFreshRecordingSessions(experiment.id).then((data) => setRecordingSessionList(data));
  };

  return (
    <Layout>
      <div className="page">
        <h1>
          Experiment: {experiment.name} {experiment.displayId} {!!experiment.closedAt && '🔓 closed'}
        </h1>
        <div>
          <Link href={{pathname: `/experiment/${experiment.id}/export`}}>
            <button>💾 Download experiment data</button>
          </Link>
        </div>

        <p>Created {new Date(experiment.createdAt).toLocaleString()}</p>
        {!experiment.closedAt && <p>Last Updated {new Date(experiment.updatedAt).toLocaleString()}</p>}
        {!!experiment.closedAt && <p>Closed at {new Date(experiment.closedAt).toLocaleString()}</p>}
        <p>{experiment.groups?.length ?? 0} groups</p>

        <Link href={{pathname: `/experiment/${experiment.id}/update`}}>
          <button disabled={!!experiment.closedAt}>Edit setup</button>
        </Link>

        <button
          onClick={() => {
            openCloseExperiment({...experiment, closedAt: experiment.closedAt ? null : new Date()}).then((res) => {
              setExperiment({...experiment, ...res});
            });
          }}
        >
          {!!experiment.closedAt ? 'Reopen experiment' : 'Close experiment'}
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
                        disabled={!!experiment.closedAt}
                        onClick={() => {
                          deleteRecordingSession(recordingSession.id).then(() => updateRecordingSessionList());
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
            disabled={!!experiment.closedAt}
            onClick={() =>
              createNewRecordingSession(session, experiment.id).then(() => {
                updateRecordingSessionList();
              })
            }
          >
            Start a new session
          </button>
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentDetail;
