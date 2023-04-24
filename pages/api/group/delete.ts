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
      Run: true,
    },
  });

  if (nestedMice.length > 0) {
    // TODO: check if this works properly now
    const deleteRuns = prisma.run.deleteMany({
      where: {
        id: {in: nestedMice.flatMap((mouse) => mouse.Run.map((run) => run.id))},
      },
    });
    const deleteMice = prisma.mouse.deleteMany({
      where: {id: {in: nestedMice.map((mouse) => mouse.id)}},
    });

    const result = await prisma.$transaction([deleteRuns, deleteMice]);
    res.json(result);
  }

  const result = await prisma.group.delete({
    where: {id},
  });

  res.json(result);
};
