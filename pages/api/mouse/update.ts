import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const mouse = JSON.parse(req.body);
  if (!mouse?.id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const prismaMouseUpdateArgs: Prisma.MouseUpdateArgs = {
    where: {id: mouse.id},
    data: {
      ...mouse,
    },
  };

  const updatedMouse = await prisma.mouse.update(prismaMouseUpdateArgs);
  res.json(updatedMouse);
};
