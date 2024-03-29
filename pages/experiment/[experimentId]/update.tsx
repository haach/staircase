import {Prisma} from '@prisma/client';
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
      recordingSessions: true,
    },
  });
  return {
    props: {
      experiment: serialize(experiment),
    },
  };
};

const handleSubmit = async (experiment) => {
  const res = await fetch('/api/experiment/update', {
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
