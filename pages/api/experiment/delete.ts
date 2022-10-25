import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {Experiment} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  const id: Experiment['id'] = req.body;
  if (!id) {
    return res.status(400).json({message: 'Invalid Input'});
  }

  const nestedGroups = await prisma.group.findMany({
    where: {
      experimentId: id,
    },
    select: {
      id: true,
      mice: {
        select: {
          id: true,
        },
      },
    },
  });
  const obsoleteGroups = nestedGroups.map((group) => group.id);
  const obsoleteMice = nestedGroups.flatMap((group) => group.mice.map((mouse) => mouse.id));

  const deleteGroups = prisma.group.deleteMany({
    where: {
      id: {in: obsoleteGroups},
    },
  });
  const deleteMice = prisma.mouse.deleteMany({
    where: {
      id: {in: obsoleteMice},
    },
  });
  const deleteExperiment = prisma.experiment.delete({
    where: {id},
  });

  const result = await prisma.$transaction([deleteMice, deleteGroups, deleteExperiment]);

  res.json(result);
};
