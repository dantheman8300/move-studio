import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { track } from "@vercel/analytics";
import { useState } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { createProject } from "../db/db_utils";


export default function AddProjectCard() {

  const projectList = useLiveQuery(() => db.projects.toArray()) || [];

  const [projectName, setProjectName] = useState('');
  
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
                  <Button className="w-full" onClick={async () => {
                    await createProject(projectName);
                  }}>Add project</Button>
                </DialogClose>
              : 
                <Button className="w-full" disabled>Invalid project name</Button>
        }
      </CardFooter>
    </Card>
  )
}