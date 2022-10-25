import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const experiment: Prisma.ExperimentUpdateInput = JSON.parse(req.body);
  if (!experiment?.id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const prismaExperimentUpdateArgs: Prisma.ExperimentUpdateArgs = {
    where: {
      id: experiment.id as string,
    },
    data: {
      ...experiment,
    },
  };

  const updatedExperiment = await prisma.experiment.update(prismaExperimentUpdateArgs);
  res.json(updatedExperiment);
};
