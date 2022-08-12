import {Experiment, Prisma} from '@prisma/client';
import ExperimentCreateUpdateForm from 'components/experiment/ExperimentCreateUpdateForm';
import Layout from 'components/Layout';
import {useRouter} from 'next/router';
import React, {useState} from 'react';

const handleSubmit = async (formState, callback: () => void) => {
  const data: Prisma.ExperimentCreateInput = {...formState, mice: {create: formState.mice}};
  const res = await fetch('/api/experiment/create', {method: 'POST', body: JSON.stringify({data})});
  if (!res.ok) {
    throw new Error('Error creating experiment');
  }
  // TODO: User feedback for success and failure
  callback();
};

const ExperimentCreate: React.FC = () => {
  const router = useRouter();
  return (
    <Layout>
      <div className="page">
        <h1>New experiment</h1>
        <main>
          <ExperimentCreateUpdateForm
            handleSubmit={(formState) => handleSubmit(formState, () => router.push(`/experiments`))}
          />
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentCreate;
