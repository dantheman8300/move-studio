import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { track } from "@vercel/analytics";
import { useLiveQuery } from "dexie-react-hooks";
import { useContext, useState } from "react";
import { db } from "../db/db";
import { BuildContext } from "@/Contexts/BuildProvider";

export default function AddProjectCard() {
  const projectList = useLiveQuery(() => db.projects.toArray()) || [];

  const {
    setSelectedProjectName
  } = useContext(BuildContext);

  const [projectName, setProjectName] = useState("");

  const addProject = async () => {
    await db.projects.add({
      name: projectName,
      files: [
        {
          type: "folder",
          name: "sources",
          children: [],
        },
        {
          type: "file",
          name: "Move.toml",
          content: `[package]
name = "${projectName}"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet" }

[addresses]
${projectName} = "0x0"
`,
        },
      ],
    });
    track("project-created", {
      project: projectName,
    });

    setSelectedProjectName(projectName);
  };

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
          <Input
            id="projectName"
            placeholder="Enter project name..."
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
            }}
          />
        </div>
      </CardContent>
      <CardFooter>
        {projectList.find((project) => project.name === projectName) ? (
          <Button className="w-full" disabled>
            Project already exists
          </Button>
        ) : projectName.length > 0 && /^[a-zA-Z0-9_]+$/.test(projectName) ? ( 
          <DialogClose asChild>
            <Button className="w-full" onClick={addProject}>
              Add project
            </Button>
          </DialogClose>
        ) : (
          <Button className="w-full" disabled>
            Invalid project name
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
