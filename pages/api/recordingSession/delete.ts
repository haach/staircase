import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const deletedRecordingSession = await prisma.recordingSession.delete(JSON.parse(req.body));
  res.json(deletedRecordingSession);
};
