/** @jsxImportSource @emotion/react */
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import {Session} from 'next-auth';
import {useSession} from 'next-auth/react';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {Badge, Button, Dropdown, Table} from 'react-bootstrap';
import {Experiment} from 'types';
import {serialize} from 'utils';
import {GoPlus} from 'react-icons/go';
import {FiMoreVertical} from 'react-icons/fi';
import {css} from '@emotion/react';

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

const deleteExperiment = async (experiment_id) => {
  const res = await fetch('/api/experiment/delete', {method: 'POST', body: experiment_id});
  if (!res.ok) {
    throw new Error('Error deleting sesion ' + experiment_id);
  }
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
      <div>
        <div css={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div css={{display: 'flex', alignItems: 'center'}}>
            <h1>
              {experiment.name} ({experiment.displayId}){' '}
            </h1>
            {!!experiment.closedAt && (
              <h5>
                <Badge bg="success" title={`Closed at ${experiment.closedAt.toLocaleString()}`}>
                  closed
                </Badge>
              </h5>
            )}
          </div>
          <Dropdown>
            <Dropdown.Toggle
              size="sm"
              css={css`
                border: 1px solid #333;
                background-color: transparent;
                color: #333;
                &:hover,
                &:active {
                  border-color: #333 !important;
                  background-color: #eee !important;
                  color: #333 !important;
                }
                &::after {
                  display: none;
                }
              `}
            >
              <FiMoreVertical />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item disabled={!!experiment.closedAt} href={`/experiment/${experiment.id}/update`}>
                ✏️ Edit setup
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  openCloseExperiment({...experiment, closedAt: experiment.closedAt ? null : new Date()}).then(
                    (res) => {
                      setExperiment({...experiment, ...res});
                    }
                  );
                }}
              >
                ✔ {!!experiment.closedAt ? 'Reopen' : 'Conclude'}
              </Dropdown.Item>
              <Dropdown.Item href={`/experiment/${experiment.id}/export`}>📥 Export</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                disabled={!!experiment.closedAt}
                onClick={() => {
                  deleteExperiment(experiment.id).then(() => router.push('/experiments'));
                }}
                css={{color: 'darkred'}}
              >
                🗑 Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div css={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <span>Created: {new Date(experiment.createdAt).toLocaleString()}</span>
          {!experiment.closedAt && <span>Last updated:{new Date(experiment.updatedAt).toLocaleString()}</span>}
          {!!experiment.closedAt && <span>Closed at {new Date(experiment.closedAt).toLocaleString()}</span>}
        </div>
      </div>

      <div css={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h2>Sessions </h2>
        <Button
          disabled={!!experiment.closedAt}
          size="sm"
          onClick={() =>
            createNewRecordingSession(session, experiment.id).then(() => {
              updateRecordingSessionList();
            })
          }
        >
          <GoPlus /> Add Session
        </Button>
      </div>

      {recordingSessionList.length < 1 && <p>🤷‍♀️ There are no sessions in this experiment.</p>}

      {recordingSessionList.length > 0 && (
        <Table striped bordered hover>
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
              <Link href={{pathname: `${router.asPath}/session/${recordingSession.id}`}} key={recordingSession.id}>
                <tr css={{cursor: 'pointer'}}>
                  <td>{idx + 1}</td>
                  <td>
                    {recordingSession.author.name} ({recordingSession.author.email})
                  </td>

                  <td>{new Date(recordingSession.createdAt).toLocaleString()}</td>
                  <td>{new Date(recordingSession.updatedAt).toLocaleString()}</td>
                  <td>{recordingSession.runs?.length ?? 0}</td>

                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={!!experiment.closedAt}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRecordingSession(recordingSession.id).then(() => updateRecordingSessionList());
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              </Link>
            ))}
          </tbody>
        </Table>
      )}
    </Layout>
  );
};

export default ExperimentDetail;
