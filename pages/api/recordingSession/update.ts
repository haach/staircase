import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest & {body: Prisma.RecordingSessionUpdateInput}, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const updatedRecordingSession = await prisma.recordingSession.update(JSON.parse(req.body));
  res.json(updatedRecordingSession);
};
