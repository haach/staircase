import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {Experiment} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const experiment: Experiment = JSON.parse(req.body);
  if (!experiment?.id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const updatedGroups = [];
  // Not pretty but des the job
  try {
    for (const group of experiment.groups) {
      if (group.id) {
        // Update existing group
        const prismaGroupUpdateArgs: Prisma.GroupUpdateArgs = {
          where: {id: group.id},
          data: {
            ...group,
            experimentId: undefined,
            mice: {
              deleteMany: {},
              // UPDATE DOESNT WORK
              connectOrCreate: group.mice.map((mouse) => ({
                where: {id: mouse.id ?? ''},

                create: {
                  ...mouse,
                  deceasedAt: mouse.deceasedAt ?? undefined,
                  surgeryDate: mouse.surgeryDate ?? undefined,
                  groupId: undefined,
                },
              })),
            },
          },
        };
        const result = await prisma.group.update(prismaGroupUpdateArgs);
        updatedGroups.push(result);
      } else {
        // Create new group
        const prismaGroupCreateArgs: Prisma.GroupCreateArgs = {
          data: {
            ...group,
            experimentId: experiment.id,
            mice: {
              connectOrCreate: group.mice.map((mouse) => ({
                where: {id: mouse.id ?? ''},
                create: {
                  ...mouse,
                  deceasedAt: mouse.deceasedAt ?? undefined,
                  surgeryDate: mouse.surgeryDate ?? undefined,
                  groupId: undefined,
                },
              })),
            },
          },
        };
        const result = await prisma.group.create(prismaGroupCreateArgs);
        updatedGroups.push(result);
      }
    }
  } catch (e) {
    return e;
  }

  const prismaExperimentUpdateArgs: Prisma.ExperimentUpdateArgs = {
    where: {id: experiment.id as string},
    data: {
      name: experiment.name,
      displayId: experiment.displayId,
      groups: {
        connect: updatedGroups.map((group) => ({id: group.id})),
      },
    },
  };

  const updatedExperiment = await prisma.experiment.update(prismaExperimentUpdateArgs);

  res.json(updatedExperiment);
};
