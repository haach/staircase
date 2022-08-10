import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const deletedSession = await prisma.session.delete({where: {id: JSON.parse(req.body).id}});
  res.json(deletedSession);
};
