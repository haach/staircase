import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const experiment: Prisma.ExperimentUpdateInput = JSON.parse(req.body);

  const prismaExperimentUpdateArgs: Prisma.ExperimentUpdateArgs = {
    where: {
      id: experiment.id as string,
    },
    data: {
      closedAt: experiment.closedAt,
    },
  };

  const updatedExperiment = await prisma.experiment.update(prismaExperimentUpdateArgs);
  res.json(updatedExperiment);
};
