import {Experiment, Prisma} from '@prisma/client';
import ExperimentCreateUpdateForm from 'components/experiment/ExperimentCreateUpdateForm';
import Layout from 'components/Layout';
import {group} from 'console';
import {useRouter} from 'next/router';
import React, {useState} from 'react';

const createExperiment = async (experiment) => {
  const createExperiment = await fetch('/api/experiment/create', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        name: experiment.name,
        displayId: experiment.displayId,
        groups: {
          createMany: {
            data: (experiment.groups ?? []).map((group) => ({
              groupNumber: group.groupNumber,
            })),
          },
        },
      },
      include: {
        groups: true,
      },
    }),
  });
  if (!createExperiment.ok) {
    throw new Error('Error creating experiment');
  }
  createExperiment.json().then(async (res) => {
    // Update groups with mice
    for (const group of res.groups) {
      if (!group.mice?.length) continue;
      const updateGroups = await fetch('/api/group/update', {
        method: 'POST',
        body: JSON.stringify({
          where: {id: group.id},
          data: {
            mice: {
              createMany: {
                data: group.mice,
              },
            },
          },
        }),
      });
      if (!updateGroups.ok) {
        throw new Error('Error updating group ' + group.id);
      }
    }
  });
  // TODO: User feedback for success and failure
  return 'success';
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
            handleSubmit={(formState) => createExperiment(formState).then(() => router.push('/experiments'))}
          />
        </main>
      </div>
    </Layout>
  );
};

export default ExperimentCreate;
