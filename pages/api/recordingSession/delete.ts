import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const prismaRecordingSessionDeleteArgs: Prisma.RecordingSessionDeleteArgs = {
    where: {id: req.body as string},
  };
  const deletedRecordingSession = await prisma.recordingSession.delete(prismaRecordingSessionDeleteArgs);
  res.json(deletedRecordingSession);
};
