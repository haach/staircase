import {Prisma} from '@prisma/client';
import ExperimentCreateUpdateForm from 'components/experiment/ExperimentCreateUpdateForm';
import Layout from 'components/Layout';
import {useRouter} from 'next/router';
import React from 'react';

const createExperiment = async (experiment) => {
  // Create groups with mice
  const groups = await Promise.all(
    experiment.groups.map(async (group) => {
      // create Mice
      const mice = await Promise.all(
        group.mice.map(async (mouse) => {
          const createMouseBody: Prisma.MouseCreateArgs = {
            data: {
              ...mouse,
              groupId: group.id,
            },
          };
          const createMouse = await fetch('/api/mouse/create', {
            method: 'POST',
            body: JSON.stringify(createMouseBody),
          });
          return await createMouse.json();
        })
      );

      const createGroupBody: Prisma.GroupCreateArgs = {
        data: {
          ...group,
          mice: {
            connect: mice.map(({id}) => ({id})),
          },
        },
        include: {
          mice: true,
        },
      };

      const createGroup = await fetch('/api/group/create', {
        method: 'POST',
        body: JSON.stringify(createGroupBody),
      });

      return await createGroup.json();
    })
  );
  // Create experiment and connect previouslycreated groups
  const createExperimentBody: Prisma.ExperimentCreateArgs = {
    data: {
      name: experiment.name,
      displayId: experiment.displayId,
      groups: {
        connect: groups.map(({id}) => ({id})),
      },
    },
  };
  const createExperiment = await fetch('/api/experiment/create', {
    method: 'POST',
    body: JSON.stringify(createExperimentBody),
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
