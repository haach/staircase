import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export const prismaExperimentFindManyArgs: Prisma.ExperimentFindManyArgs = {
  orderBy: [
    {
      updatedAt: 'desc',
    },
    {
      createdAt: 'desc',
    },
  ],
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
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const readManyExperiments = await prisma.experiment.findMany(prismaExperimentFindManyArgs);
  res.json(readManyExperiments);
};
