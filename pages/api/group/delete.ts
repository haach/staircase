import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {Group} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const id: Group['id'] = req.body;
  if (!id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const nestedMice = await prisma.mouse.findMany({
    where: {
      groupId: id,
    },
    select: {
      id: true,
    },
  });

  if (nestedMice.length > 0) {
    const deleteMice = prisma.run.deleteMany({
      where: {
        id: {in: nestedMice.map((run) => run.id)},
      },
    });
    const deleteGroup = prisma.group.delete({
      where: {id},
    });

    const result = await prisma.$transaction([deleteMice, deleteGroup]);
    res.json(result);
  }

  const result = await prisma.group.delete({
    where: {id},
  });

  res.json(result);
};
