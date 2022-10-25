import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const recordingSessionId = req.body;

  const prismaRunFindManyArgs: Prisma.RunFindManyArgs = {
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
    include: {
      Mouse: true,
    },
  };

  if (recordingSessionId) {
    prismaRunFindManyArgs.where = {recordingSessionId};
  }

  const readManyRuns = await prisma.run.findMany(prismaRunFindManyArgs);
  res.json(readManyRuns);
};
