import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {Experiment} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id: Experiment['id'] = await JSON.parse(req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
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
