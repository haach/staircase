interface dbBaseProps {
  id: string; // UUID
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends dbBaseProps {
  name: string;
  email: string;
}

export interface Mouse extends dbBaseProps {
  pyratId: string; // Internal ID
  chipId: string; // number from 0 - 99
  gender: 'm' | 'f';
  deceasedAt?: Date;
  genoType?: string; // Specific genetic modification of the subject
}

export interface Run extends dbBaseProps {
  mouse: Mouse;

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
}

export interface Session extends dbBaseProps {
  author: User;
  runs: Array<Run>;
}

export interface Experiment extends dbBaseProps {
  name: string;
  closedAt?: Date;
  sessions: Array<Session>;
}
