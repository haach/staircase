import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const {userEmail, experimentId} = JSON.parse(req.body);

  if (!userEmail || !experimentId) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const prismaRecordingSessionCreateArgs: Prisma.RecordingSessionCreateArgs = {
    data: {
      author: {connect: {email: userEmail}},
      Experiment: {
        connect: {
          id: experimentId,
        },
      },
    },
  };

  const createdRecordingSession = await prisma.recordingSession.create(prismaRecordingSessionCreateArgs);
  res.json(createdRecordingSession);
};
