import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { track } from "@vercel/analytics";
import { useState } from "react";
import { DialogClose } from "@/components/ui/dialog";


export default function AddProjectCard() {

  const projectList = useLiveQuery(() => db.projects.toArray()) || [];

  const [projectName, setProjectName] = useState('');

  const addProject = async () => {
    await db.projects.add({name: projectName, files: [
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
    ]});
    track('project-created', {
      project: projectName
    })
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>
          Project names must be alphanumeric and cannot contain spaces.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Input id="projectName" placeholder="Enter project name..." value={projectName} onChange={(e) => {
            setProjectName(e.target.value);
          }}/>
        </div>
      </CardContent>
      <CardFooter>
        {
          projectList.find((project) => project.name === projectName) ?
            <Button className="w-full" disabled>Project already exists</Button>
          :
            (projectName.length > 0) && /^[a-zA-Z0-9]+$/.test(projectName) ?
                <DialogClose asChild>
                  <Button className="w-full" onClick={addProject}>Add project</Button>
                </DialogClose>
              : 
                <Button className="w-full" disabled>Invalid project name</Button>
        }
      </CardFooter>
    </Card>
  )
}