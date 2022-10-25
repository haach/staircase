import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const id: string = req.body;
  const prismaExperimentFindUniqueArgs: Prisma.ExperimentFindUniqueArgs = {
    where: {
      id,
    },
    include: {
      groups: {
        include: {
          mice: true,
        },
      },
    },
  };

  const readExperiment = await prisma.experiment.findUnique(prismaExperimentFindUniqueArgs);
  res.json(readExperiment);
};
