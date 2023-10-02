import Dexie, { Table } from 'dexie';

export type IProject = {
  name: string;
  files: IFile[];
}

export type IFile = {
  type: 'file' | 'folder';
  name: string;
  content?: string;
  children?: IFile[];
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  projects!: Table<IProject>; 

  constructor() {
    super('myDatabase');
    this.version(1).stores({
      projects: 'name'
    });
  }
}

export const db = new MySubClassedDexie();