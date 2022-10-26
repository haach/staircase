import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {RecordingSession} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const id: RecordingSession['id'] = req.body;
  if (!id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const nestedRuns = await prisma.run.findMany({
    where: {
      recordingSessionId: id,
    },
    select: {
      id: true,
    },
  });

  console.log('nestedRuns', nestedRuns);

  if (nestedRuns.length > 0) {
    const deleteRuns = prisma.run.deleteMany({
      where: {
        id: {in: nestedRuns.map((run) => run.id)},
      },
    });
    const deleteRecordingSession = prisma.recordingSession.delete({
      where: {id},
    });

    const result = await prisma.$transaction([deleteRuns, deleteRecordingSession]);
  }

  const result = await prisma.recordingSession.delete({
    where: {id},
  });

  res.json(result);
};
