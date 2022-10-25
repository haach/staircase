import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const run = JSON.parse(req.body);
  const prismaRunUpdateArgs: Prisma.RunUpdateArgs = {
    where: {id: run.id},
    data: {...run, Mouse: undefined, RecordingSession: undefined},
  };

  const updatedRun = await prisma.run.update(prismaRunUpdateArgs);
  res.json(updatedRun);
};
