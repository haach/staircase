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
      sessions: true,
    },
  });
  return {
    props: {
      experiment: serialize(experiment),
    },
  };
};

const handleSubmit = async (experiment) => {
  // TODO: Figure out how to use PRISMA transactions with fetch API in case something goes wrong
  const updateExperiment = await fetch('/api/experiment/update', {
    method: 'POST',
    body: JSON.stringify({
      where: {id: experiment.id},
      data: {
        name: experiment.name,
        displayName: experiment.displayName,
        groups: {
          deleteMany: {},
          connectOrCreate: experiment.groups.map((group) => ({
            where: {id: group.id ?? ''},
            create: {
              ...group,
              experimentId: undefined,
              mice: {
                connectOrCreate: group.mice.map((mouse) => ({
                  where: {id: mouse.id ?? ''},
                  create: {...mouse, groupId: undefined},
                })),
              },
            },
          })),
        },
      },
    }),
  });
  if (!updateExperiment.ok) {
    throw new Error('Error updating experiment');
  }
  // TODO: User feedback for success and failure
  return 'success';
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
            cancelURL={`/experiment/${props.experiment.id}`}
            handleSubmit={(formState) =>
              handleSubmit(formState).then(() => router.push(`/experiment/${props.experiment.id}`))
            }
          />
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentUpdate;
