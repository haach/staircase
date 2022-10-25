import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const {recordingSessionId, mouseId} = JSON.parse(req.body);
  if (!recordingSessionId || !mouseId) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const prismaRunCreateArgs: Prisma.RunCreateArgs = {
    data: {
      RecordingSession: {connect: {id: recordingSessionId}},
      Mouse: {connect: {id: mouseId}},
    },
  };

  const createdRun = await prisma.run.create(prismaRunCreateArgs);
  res.json(createdRun);
};
