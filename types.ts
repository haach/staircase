interface dbBaseProps {
  id: string; // UUID
  createdAt: Date;
  updatedAt: Date;
}

type dbArray<T> = Array<T> & {_count: number};

export interface User extends dbBaseProps {
  name: string;
  email: string;
}

export interface Group extends dbBaseProps {
  groupNumber: number;
  mice: dbArray<Mouse>;
}

export interface Mouse extends dbBaseProps {
  pyratId: string; // Internal ID
  chipNumber: number; // number from 0 - 99
  mouseNumber: number;
  gender: 'FEMALE' | 'MALE';
  deceasedAt?: Date;
  genoType?: string; // Specific genetic modification of the subject

  Group: Group;
}

export interface Run extends dbBaseProps {
  Mouse: Mouse;
  // Right steps 0 - 8
  rs0: number;
  rs1: number;
  rs2: number;
  rs3: number;
  rs4: number;
  rs5: number;
  rs6: number;
  rs7: number;
  rs8: number;

  // Left steps 0 - 8
  ls0: number;
  ls1: number;
  ls2: number;
  ls3: number;
  ls4: number;
  ls5: number;
  ls6: number;
  ls7: number;
  ls8: number;

  Experiment: Experiment;
}

export interface Session extends dbBaseProps {
  author: User;
  runs: dbArray<Run>;
  Experiment: Experiment;
}

export interface Experiment extends dbBaseProps {
  name: string;
  displayId: string;
  closedAt?: Date;
  sessions?: dbArray<Session>;
  groups?: dbArray<Group>;
}
