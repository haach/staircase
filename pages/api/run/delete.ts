import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const prismaRunDeleteArgs: Prisma.RunDeleteArgs = {
    where: {id: req.body},
  };

  const deletedRun = await prisma.run.delete(prismaRunDeleteArgs);
  res.json(deletedRun);
};
