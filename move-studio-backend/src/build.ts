import { IFile, IProject } from "./schema/user-schema";
import { execSync } from 'child_process';
import * as fs from 'fs';

const TEMP_DIR = `${__dirname}/../temp-packages`;

type CompileResult = {
  error: boolean;
  errorMessage?: string;
  compiledModules?: string[];
}

type TestResult = {
  error: boolean;
  errorMessage?: string;
  testResults?: string[];
}

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
export async function compile(project: IProject): Promise<CompileResult> {

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


    return {
      error: false,
      compiledModules: compiledModules as unknown as string[]
    }

  } catch (error: any) {
    console.log('error', error)

    // Check error message for update needed message - TODO

    // Remove the temporary project directory
    fs.rmdirSync(projectPath, { recursive: true });
    

    if (error.stderr != '') {
      return {
        error: true,
        errorMessage: error.stderr
      }
    } else {
      return {
        error: true,
        errorMessage: error.stdout
      }
    }
  }
}

/*
  Takes a IProject object and tests it. Returns a string of the compiled 
  project. 
*/
export async function test(project: IProject): Promise<TestResult> {

  // Create project in file system
  createProjectInFileSystem(project.files, `${TEMP_DIR}/${project.name}`);

  // Compile project
  const projectPath = `${TEMP_DIR}/${project.name}`;
  
  try {
    const testResults = execSync(
      `sui move test --path ${projectPath}`,
      { encoding: 'utf-8'}
    );

    console.log("testResults", testResults);

    // Remove the temporary project directory
    fs.rmdirSync(projectPath, { recursive: true });

    return {
      error: false,
      testResults: testResults as unknown as string[]
    }

  } catch (error: any) {
    console.log('error', error)

    // Check error message for update needed message - TODO

    // Remove the temporary project directory
    fs.rmdirSync(projectPath, { recursive: true });
    

    return {
      error: true,
      errorMessage: error.stdout
    }
  }
}