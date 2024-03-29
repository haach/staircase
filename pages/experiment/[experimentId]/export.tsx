/** @jsxImportSource @emotion/react */
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import {FC, useEffect, useState} from 'react';
import {Alert, Button} from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import {CSVLink} from 'react-csv';
import {Experiment} from 'types';
import {formatDate, nameOrEmail, serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const experiment = await prisma.experiment.findUnique({
    where: {id: params.experimentId as string},
    include: {
      groups: {
        include: {
          mice: true,
        },
      },
      recordingSessions: {
        include: {
          author: true,
          runs: {
            include: {
              Mouse: {
                include: {
                  Group: true,
                },
              },
            },
          },
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

type Props = {
  experiment: Experiment;
};

const calcDate = (first, second) => {
  return Math.round((new Date(first).valueOf() - new Date(second).valueOf()) / (1000 * 60 * 60 * 24));
};

const ExperimentExport: FC<Props> = ({experiment}) => {
  const [csvData, setCsvData] = useState<Array<any>>();
  const [exportButton, setExportButton] = useState<JSX.Element>(null);

  useEffect(() => {
    const csvHeader = [
      'Experiment ID',
      'Group',
      'Pyrat-No.',
      'Mouse No.',
      'Chip No.',
      'genotype',
      'gender',
      'Date',
      'Day',
      'Stair 1 - right',
      'Stair 2 - right',
      'Stair 3 - right',
      'Stair 4 - right',
      'Stair 5 - right',
      'Stair 6 - right',
      'Stair 7 - right',
      'Stair 8 - right',
      'Floor - right',
      'Stair 1 - left',
      'Stair 2 - left',
      'Stair 3 - left',
      'Stair 4 - left',
      'Stair 5 - left',
      'Stair 6 - left',
      'Stair 7 - left',
      'Stair 8 - left',
      'Floor - left',
    ];
    const csvBody = [];
    (experiment.recordingSessions ?? []).forEach((recordingSession) => {
      (recordingSession.runs ?? []).forEach((run) => {
        const row = [
          experiment.displayId,
          run.Mouse.Group.groupNumber,
          run.Mouse.pyratId,
          run.Mouse.mouseNumber,
          run.Mouse.chipNumber,
          run.Mouse.genoType,
          run.Mouse.gender,
          recordingSession.createdAt,
          !!run.Mouse.surgeryDate ? calcDate(run.createdAt, run.Mouse.surgeryDate) : 'N/A',
          run.right[1],
          run.right[2],
          run.right[3],
          run.right[4],
          run.right[5],
          run.right[6],
          run.right[7],
          run.right[8],
          run.right[0],
          run.left[1],
          run.left[2],
          run.left[3],
          run.left[4],
          run.left[5],
          run.left[6],
          run.left[7],
          run.left[8],
          run.left[0],
        ].map((item) => String(item));
        csvBody.push(row);
      });
    });
    setCsvData([csvHeader, ...csvBody]);
  }, [setCsvData, experiment]);

  useEffect(() => {
    if (csvData) {
      setExportButton(
        <CSVLink
          data={csvData}
          filename={`experiment-${experiment.displayId}-export-${new Date().toLocaleDateString()}.csv`}
          // className="btn btn-primary"
          // target="_blank"
        >
          <Button css={{color: 'white'}}>Download data</Button>
        </CSVLink>
      );
    }
  }, [csvData, setExportButton, experiment]);

  return (
    <Layout>
      <>
        <h1>Export data for experiment: {experiment.name}</h1>
        {!experiment.closedAt && (
          <Alert variant="warning">
            ⚠️ Experiment is not concluded yet. There might be more data added after your export.
          </Alert>
        )}
        <h2>Experiment Setup</h2>
        <p>
          Groups: {experiment.groups.length} <br />
          Mice: {experiment.groups.flatMap((group) => group.mice).length}
        </p>
        <h2>Recording sessions</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Author</th>
              <th>Recording date</th>
              <th>Runs</th>
            </tr>
          </thead>
          <tbody>
            {experiment.recordingSessions.map((recordingSession, idx) => (
              <tr key={recordingSession.id}>
                <td>{idx + 1}</td>
                <td>{nameOrEmail(recordingSession.author)}</td>
                <td>{formatDate(recordingSession.createdAt)}</td>
                <td>
                  {recordingSession.runs.length} run{recordingSession.runs.length > 1 && 's'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!csvData && (
          <div>
            <Button>
              <Spinner animation="border" role="status" variant="light" size="sm">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Button>
          </div>
        )}
        {exportButton}
      </>
    </Layout>
  );
};
export default ExperimentExport;
