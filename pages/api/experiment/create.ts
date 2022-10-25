import {Prisma} from '@prisma/client';
import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import {Experiment} from 'types';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const experiment: Experiment = JSON.parse(req.body);

  if (req.method !== 'POST') {
    return res.status(400).json({message: 'Method not allowed'});
  }

  const prismaExperimentCreateArgs: Prisma.ExperimentCreateArgs = {
    data: {
      name: experiment.name,
      displayId: experiment.displayId,
      groups: experiment.groups
        ? {
            create: experiment.groups.map((group) => ({
              groupNumber: group.groupNumber,
              mice: group.mice
                ? {
                    create: group.mice.map((mouse) => ({
                      pyratId: mouse.pyratId,
                      chipNumber: mouse.chipNumber,
                      mouseNumber: mouse.mouseNumber,
                      gender: mouse.gender,
                      genoType: mouse.genoType,
                    })),
                  }
                : {},
            })),
          }
        : {},
    },
  };
  const response = await prisma.experiment.create(prismaExperimentCreateArgs);
  res.json(response);
};
