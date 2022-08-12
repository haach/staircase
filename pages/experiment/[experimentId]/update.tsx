import ExperimentCreateUpdateForm from 'components/experiment/ExperimentCreateUpdateForm';
import Layout from 'components/Layout';
import prisma from 'lib/prisma';
import {GetServerSideProps} from 'next';
import {useRouter} from 'next/router';
import React from 'react';
import {Experiment} from 'types';
import {serialize} from 'utils';

export const getServerSideProps: GetServerSideProps = async ({params}) => {
  const experiment = await prisma.experiment.findUnique({
    where: {id: params.id as string},
    include: {mice: true},
  });
  return {
    props: {
      experiment: serialize(experiment),
    },
  };
};

const handleSubmit = async (formState, callback: () => void) => {
  // TODO: Figure out how to use PRISMA transactions with fetch API in case something goes wrong
  // disconnect all mice from experiment
  const disconnectMice = await fetch('/api/experiment/update', {
    method: 'POST',
    body: JSON.stringify({
      where: {id: formState.id},
      data: {mice: {set: []}},
    }),
  });
  // use create or connect to update experiment
  const updateExperiment = await fetch('/api/experiment/update', {
    method: 'POST',
    body: JSON.stringify({
      where: {id: formState.id},
      data: {
        name: formState.name,
        mice: {
          connectOrCreate: formState.mice.map((mouse) => ({
            where: {id: mouse.id ?? ''},
            create: {...mouse, experimentId: undefined},
          })),
        },
      },
    }),
  });
  if (!updateExperiment.ok) {
    throw new Error('Error updating experiment');
  }
  // TODO: User feedback for success and failure
  alert('Changes saved');
  callback();
};

type Props = {
  experiment: Experiment;
};

const ExperimentUpdate: React.FC<Props> = (props) => {
  const router = useRouter();
  return (
    <Layout>
      <div className="page">
        <h1>Update experiment</h1>
        <main>
          <ExperimentCreateUpdateForm
            experiment={props.experiment}
            handleSubmit={(formState) => handleSubmit(formState, () => router.push(`/experiments`))}
          />
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentUpdate;
