import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { track } from "@vercel/analytics";
import { useLiveQuery } from "dexie-react-hooks";
import { useContext, useState } from "react";
import { IFile } from "../db/ProjectsDB";
import { db } from "../db/db";
import { BuildContext } from "@/Contexts/BuildProvider";


export default function UploadProjectCard() {

  const projectList = useLiveQuery(() => db.projects.toArray()) || [];

  const { 
    setSelectedProjectName
  } = useContext(BuildContext);


  const [inputFiles, setInputFiles] = useState<FileList | null>(null);

  const UploadProjectCard = async () => {

    console.log(inputFiles)

    if (!inputFiles) {
      alert('Please select a folder to upload');
      return;
    }

    if (inputFiles.length === 0) {
      alert('Please select a folder to upload');
      return;
    }

    if (inputFiles.length > 20) {
      alert('Folder size is too large. Please select a folder with less than 20 files');
      return;
    }

    const projectName = inputFiles![0].webkitRelativePath.split('/')[0];

    if (projectList.find(p => p.name === projectName)) {
      alert('A project with the same name already exists');
      return;
    }

    const files = [] as IFile[];

    for (let i = 0; i < inputFiles!.length; i++) {
      console.log(inputFiles![i].webkitRelativePath)

      const path = inputFiles![i].webkitRelativePath.split('/').slice(1);
      console.log(path)

      let currentFile = files;

      for (let j = 0; j < path.length - 1; j++) {
        console.log(path[j])

        const file = currentFile.find(f => f.name === path[j])

        if (file) {
          if (file.type === 'folder') {
            currentFile = file.children || [];
          } else {
            throw new Error('File already exists')
          }
        } else {
          const newFile = {
            type: 'folder',
            name: path[j],
            children: []
          } as IFile;
          currentFile.push(newFile);
          currentFile = newFile.children || [];
        }
      }

      const file = currentFile.find(f => f.name === path[path.length - 1])

      if (file) {
        if (file.type === 'file') {
          throw new Error('File already exists')
        } else {
          throw new Error('Folder already exists')
        }
      } else {
        const newFile = {
          type: 'file',
          name: path[path.length - 1],
          content: await inputFiles![i].text()
        } as IFile;
        currentFile.push(newFile);
      } 
    }

    await db.projects.add({name: projectName, files});
    track('project-created', {
      project: projectName
    });

    setSelectedProjectName(projectName);
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload project from your system</CardTitle>
        <CardDescription>
          Choose a folder from your system to upload as a project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="">
          {/* @ts-expect-error */}
          <Input id="projectName" type="file" directory="" webkitdirectory="" className="hover:cursor-pointer hover:opacity-70 active:scale-90 transition-transform" onChange={(e) => {
            if (e.target.files) {
              setInputFiles(e.target.files)
            }
          }} />
        </div>
      </CardContent>
      <CardFooter>
        {
          inputFiles ? (
            inputFiles.length > 20 ? (
              <Button className="w-full" disabled>Folder size is too large (20 or more)</Button>
            ) : (
              inputFiles.length === 0 ? (
                <Button className="w-full" disabled>Empty directory</Button>
              ) : (
                <DialogClose className="w-full">
                  <Button className="w-full" onClick={UploadProjectCard}>Upload project</Button>
                </DialogClose>
              )
            )
          )
          : (
            <Button className="w-full" disabled>Select a directory</Button>
          )
        }
      </CardFooter>
    </Card>
  )
}