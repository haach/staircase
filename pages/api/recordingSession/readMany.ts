import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const body = JSON.parse(req.body);
  const experimentId = body.experimentId;

  const prismaRecordingSessionFindManyArg: Prisma.RecordingSessionFindManyArgs = {
    include: {
      author: true,
      runs: true,
    },
    orderBy: [
      {
        updatedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  };

  if (experimentId) {
    // Get by experiment id
    prismaRecordingSessionFindManyArg.where = {
      experimentId,
    };
  }

  const readManyRecordingSessions = await prisma.recordingSession.findMany(prismaRecordingSessionFindManyArg);
  res.json(readManyRecordingSessions);
};
