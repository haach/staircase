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
  surgeryDate?: Date;
  genoType?: string; // Specific genetic modification of the subject

  Group: Group;
}

export interface Run extends dbBaseProps {
  Mouse: Mouse;

  // Right steps 0 - 8
  right: Array<number>;
  // Left steps 0 - 8
  left: Array<number>;

  Experiment: Experiment;
  RecordingSession: RecordingSession;
}

export interface RecordingSession extends dbBaseProps {
  author: User;
  runs: dbArray<Run>;
  Experiment: Experiment;
}

export interface Experiment extends dbBaseProps {
  name: string;
  displayId: string;
  closedAt?: Date;
  recordingSessions?: dbArray<RecordingSession>;
  groups?: dbArray<Group>;
}
