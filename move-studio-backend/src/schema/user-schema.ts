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