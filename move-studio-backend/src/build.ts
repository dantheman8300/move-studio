import { IFile, IProject } from "./schema/user-schema";
import { execSync } from 'child_process';
import * as fs from 'fs';

const TEMP_DIR = `${__dirname}/../temp-packages`;

/*
  Takes a IProject object and sets up the project in the file system under 
  the TEMP_DIR directory. 


*/
function createProjectInFileSystem(files: IFile[], path = '') {

  // Create root directory
  fs.mkdirSync(path);

  // Create files and folder
  while (files.length > 0) {
    const file = files.shift();
    console.log('file', file)
    if (file) {
      if (file.type === 'folder') {
        const folderPath = `${path}/${file.name}`;
        createProjectInFileSystem(file.children || [], folderPath);
      } else {
        const filePath = `${path}/${file.name}`;
        fs.writeFileSync(filePath, file.content || '');
      }
    }
  }
}

/*
  Takes a IProject object and compiles it. Returns a string of the compiled 
  project. 
*/
export async function compile(project: IProject): Promise<string | string[]> {

  // Create project in file system
  createProjectInFileSystem(project.files, `${TEMP_DIR}/${project.name}`);

  // Compile project
  const projectPath = `${TEMP_DIR}/${project.name}`;
  
  try {
    const compiledModules = execSync(
      `sui move build --dump-bytecode-as-base64 --path ${projectPath}`,
      { encoding: 'utf-8'}
    );

    console.log("compiledModules", compiledModules);

    // Remove the temporary project directory
    fs.rmdirSync(projectPath, { recursive: true });


    return compiledModules as unknown as string[];

  } catch (error: any) {
    console.log('error', error)
    const errorMessage = error.stdout;

    // Check error message for update needed message - TODO

    // Remove the temporary project directory
    // fs.rmdirSync(projectPath, { recursive: true });
    

    return errorMessage as string;
  }
}