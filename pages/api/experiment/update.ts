import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {Experiment} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const experiment: Experiment = JSON.parse(req.body);
  console.log('experiment', experiment);
  if (!experiment?.id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const createdGroups = [];

  // TODO: cannot be rolled back if one of the groups fails
  for (const group of experiment.groups) {
    if (group.id) {
      // Update existing group

      const newMice = group.mice.filter((mouse) => !mouse.id);
      const existingMice = group.mice.filter((mouse) => mouse.id);

      const prismaGroupUpdateArgs: Prisma.GroupUpdateArgs = {
        where: {id: group.id},
        data: {
          ...group,
          mice: {
            updateMany:
              existingMice.length > 0
                ? existingMice.map((mouse) => ({
                    where: {id: mouse.id},
                    data: {
                      ...mouse,
                      // automatically connected through nested query
                      groupId: undefined,
                    },
                  }))
                : undefined,
            ...(newMice.length > 0
              ? {
                  createMany: {
                    data: newMice.map((mouse) => ({
                      ...mouse,
                      // automatically connected through nested query
                      groupId: undefined,
                    })),
                  },
                }
              : {}),
          },
        },
      };

      await prisma.group.update(prismaGroupUpdateArgs);
    } else {
      // Create new group
      const prismaGroupCreateArgs: Prisma.GroupCreateArgs = {
        data: {
          ...group,
          experimentId: experiment.id,
          mice: {
            createMany: {
              data: group.mice.map((mouse) => ({
                ...mouse,
                groupId: group.id,
              })),
            },
          },
        },
      };
      const result = await prisma.group.create(prismaGroupCreateArgs);
      createdGroups.push(result);
    }
  }

  const prismaExperimentUpdateArgs: Prisma.ExperimentUpdateArgs = {
    where: {id: experiment.id as string},
    data: {
      name: experiment.name,
      displayId: experiment.displayId,
      groups: {
        connect: createdGroups.map((group) => ({id: group.id})),
      },
    },
  };

  const updatedExperiment = await prisma.experiment.update(prismaExperimentUpdateArgs);

  res.json(updatedExperiment);
};
