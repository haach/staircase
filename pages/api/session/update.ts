import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest & {body: Prisma.SessionUpdateInput}, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const updatedSession = await prisma.session.update(JSON.parse(req.body));
  res.json(updatedSession);
};
