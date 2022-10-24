import {Prisma} from '@prisma/client';
import ExperimentCreateUpdateForm from 'components/experiment/ExperimentCreateUpdateForm';
import Layout from 'components/Layout';
import {useRouter} from 'next/router';
import React from 'react';

const createExperiment = async (experiment) => {
  const createExperiment = await fetch('/api/experiment/create', {
    method: 'POST',
    body: JSON.stringify(experiment),
  });
  if (!createExperiment.ok) {
    throw new Error('Error creating experiment');
  }
  return await createExperiment.json();
};

const ExperimentCreate: React.FC = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="page">
        <h1>New experiment</h1>
        <main>
          <ExperimentCreateUpdateForm
            cancelURL={'/experiments'}
            handleSubmit={(formState) =>
              createExperiment(formState).then((res) => router.push(`/experiment/${res.id}`))
            }
          />
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentCreate;
