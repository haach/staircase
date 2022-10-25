import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {RecordingSession} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const id: RecordingSession['id'] = await JSON.parse(req.body);
  if (!id) {
    return res.status(405).json({message: 'Cannot delete session without id'});
  }

  const nestedRuns = await prisma.run.findMany({
    where: {
      recordingSessionId: id,
    },
    select: {
      id: true,
    },
  });

  const deleteRuns = prisma.mouse.deleteMany({
    where: {
      id: {in: nestedRuns.map((run) => run.id)},
    },
  });
  const deleteRecordingSession = prisma.experiment.delete({
    where: {id},
  });

  const result = await prisma.$transaction([deleteRuns, deleteRecordingSession]);

  res.json(result);
};
