import { track } from '@vercel/analytics';
import { IFile, IProject, db } from './db';

export type StringifiedProject = {
  path: string;
  content: string;
}

export async function getProject(projectName: string): Promise<IProject | null> {
  const project = await db.projects.get(projectName);

  if (project === undefined) {
    return null;
  }

  return project;
}

export async function createProject(projectName: string): Promise<boolean> {
  let project = {name: projectName, files: [
    {
      type: 'folder', 
      name: 'sources',
      children: []
    }, 
    {
      type: 'file', 
      name: 'Move.toml',
      content: `[package]
name = "${projectName}"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet" }

[addresses]
${projectName} = "0x0"
`
    }
  ]} as IProject;

  try {
    await db.projects.add(project);
    track('project-created', {
      project: projectName
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteProject(projectName: string): Promise<boolean> {
  try {
    await db.projects.delete(projectName);
    track('project-deleted', {
      project: projectName
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function duplicateProject(projectName: string, newProjectName: string): Promise<boolean> {
  const project = await getProject(projectName);

  if (project === null) {
    return false;
  }

  try {
    await db.projects.add({...project, name: newProjectName});
    track('project-duplicated', {
      project: projectName, 
      duplicateProject: newProjectName
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function renameProject(projectName: string, newProjectName: string): Promise<boolean> {
  const project = await getProject(projectName);

  if (project === null) {
    return false;
  }

  try {
    await db.projects.update(projectName, {name: newProjectName});
    track("project-renamed", {
      oldProjectName: projectName,
      newProjectName: newProjectName,
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function getFile(projectName: string, path: string): Promise<IFile | null> {
  const project = await getProject(projectName);

  if (project === null) {
    return null;
  }

  const pathParts = path.split('/').filter(part => part !== '');
  let currentDirectory = project.files;

  for (const part of pathParts.slice(0, pathParts.length - 1)) {
    const file = currentDirectory.find(file => file.name === part);

    if (file === undefined) {
      return null;
    }

    currentDirectory = file.children || [];
  }

  const file = currentDirectory.find(file => file.name === pathParts[pathParts.length - 1]);

  if (file === undefined) {
    return null;
  }

  return file;
}

export async function addFile(projectName: string, path: string): Promise<boolean> {
  const project = await getProject(projectName);

  if (project === null) {
    return false;
  }

  const pathParts = path.split('/').filter(part => part !== '');
  let currentDirectory = project.files;

  for (const part of pathParts.slice(0, pathParts.length - 1)) {
    const file = currentDirectory.find(file => file.name === part);

    if (file === undefined) {
      return false;
    }

    currentDirectory = file.children || [];
  }

  currentDirectory.push({
    type: 'file',
    name: pathParts[pathParts.length - 1],
    content: '',
    children: []
  });

  try {
    await db.projects.update(projectName, {files: project.files});
    track('file-added', {
      project: projectName,
      path: path
    });
    return true;
  } catch (e) {
    return false;
  }

}

export async function updateFileContents(projectName: string, path: string, content: string): Promise<boolean> {
  const project = await getProject(projectName);

  if (project === null) {
    return false;
  }

  const pathParts = path.split('/').filter(part => part !== '');
  let currentDirectory = project.files;

  for (const part of pathParts.slice(0, pathParts.length - 1)) {
    const file = currentDirectory.find(file => file.name === part);

    if (file === undefined) {
      return false;
    }

    currentDirectory = file.children || [];
  }

  const file = currentDirectory.find(file => file.name === pathParts[pathParts.length - 1]);

  if (file === undefined) {
    return false;
  }

  file.content = content;

  try {
    await db.projects.update(projectName, {files: project.files});
    track('file-updated', {
      project: projectName,
      path: path
    });
    return true;
  } catch (e) {
    return false;
  }
}