import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {Mouse} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const id: Mouse['id'] = req.body;
  if (!id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const result = await prisma.mouse.delete({
    where: {id},
  });

  res.json(result);
};
