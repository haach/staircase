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

  const prismaExperimentUpdateArgs: Prisma.ExperimentUpdateArgs = {
    where: {id: experiment.id as string},
    data: {
      name: experiment.name,
      displayId: experiment.displayId,
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
  };

  const updatedExperiment = await prisma.experiment.update(prismaExperimentUpdateArgs);
  res.json(updatedExperiment);
};
