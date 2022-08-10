import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest & {body: Prisma.ExperimentUpdateInput}, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const updatedExperiment = await prisma.experiment.update({
    data: JSON.parse(req.body.data),
    where: {id: JSON.parse(req.body.data.id)},
  });
  res.json(updatedExperiment);
};
