import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest & {body: Prisma.MouseUpdateInput}, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const updatedMouse = await prisma.mouse.update(JSON.parse(req.body));
  res.json(updatedMouse);
};
