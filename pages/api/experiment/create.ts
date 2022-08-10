import prisma from 'lib/prisma';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({message: 'Method not allowed'});
  }
  const createdExperiment = await prisma.experiment.create({data: JSON.parse(req.body)});
  res.json(createdExperiment);
};

/* export async function experimentCreate(data: Prisma.ExperimentCreateInput) {
  const create = await prisma.experiment.create({data});
}
export async function experimentUpdate(data: Prisma.ExperimentUpdateInput) {
  const update = await prisma.experiment.update({data, where: {id: data.id as string}});
}
export async function experimentDelete(data: {id: string}) {
  const update = await prisma.experiment.delete({where: {id: data.id}});
} */
