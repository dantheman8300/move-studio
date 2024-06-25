import { JSX, useContext, useEffect, useState } from "react";

import { BuildContext } from "@/Contexts/BuildProvider";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Separator } from "@/components/ui/separator";
import { useLiveQuery } from "dexie-react-hooks";
import {
  CopyPlus,
  Download,
  Eye,
  File,
  FileBox,
  FileCog,
  FilePlus,
  FolderClosed,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { IFile } from "../db/ProjectsDB";
import { db } from "../db/db";

function createFileSystem(
  addTab: (type: string, path: string, name: string) => void,
  files: IFile[],
  path: string
): JSX.Element[] {
  console.log("path", path);
  const fileSytem: JSX.Element[] = [];
  files.forEach((file) => {
    if (file.type === "file") {
      fileSytem.push(<FileComponent path={path} name={file.name} />);
    } else if (file.type === "folder") {
      fileSytem.push(<FolderComponent path={path} name={file.name} />);
    }
  });
  return fileSytem;
}

export default function Files(props: { projectName: string }) {
  const { addTab } = useContext(BuildContext);

  const contents = useLiveQuery(async () => {
    const project = await db.projects.get(props.projectName);
    if (!project) return [];
    const files = project.files;

    // Sort the files
    // All files with type folder should be at the top of the list and sorted alphabetically
    // All files with type file should be at the bottom of the list and sorted alphabetically
    const folders: IFile[] = [];
    const filesArray: IFile[] = [];
    files.forEach((file) => {
      if (file.type === "folder") {
        folders.push(file);
      } else {
        filesArray.push(file);
      }
    });
    // Sort the files and folders by name individually
    const sortedFiles = filesArray.sort((a, b) => a.name.localeCompare(b.name));
    const sortedFolders = folders.sort((a, b) => a.name.localeCompare(b.name));
    // Merge the sorted files and folders
    const merged = [...sortedFolders, ...sortedFiles];
    // Set the contents
    return merged || [];
  }, [props.projectName]);

  return (
    <div>
      {contents && createFileSystem(addTab, contents, props.projectName)}
    </div>
  );
}

function FileComponent(props: { path: string; name: string }) {
  const { addTab, removeTab } = useContext(BuildContext);

  const removeFile = async () => {
    let forks = (props.path + "/" + props.name).split("/");
    console.log("forks", forks);
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || "");
    if (!project) return;
    console.log("project", project);
    let currentFolder = project.files as IFile[];
    while (forks.length > 1) {
      console.log("current folder", currentFolder);
      currentFolder = currentFolder.find((file) => file.name === forks[0])
        ?.children as IFile[];
      forks.shift();
    }
    const fileIndex = currentFolder.findIndex((file) => file.name === forks[0]);
    currentFolder.splice(fileIndex, 1);
    console.log("current folder", currentFolder);
    console.log("project", project);
    await db.projects.put(project);

    // Remove the tab if it is open
    removeTab('code', props.path + "/" + props.name);
  };

  return (
    <div
      className="group px-1 w-full text-slate-200 antialiased h-8 font-mono flex flex-row justify-between hover:bg-accent hover:text-accent-foreground hover:text-teal-500 rounded items-center"
      onClick={(event) => {
        event?.preventDefault();
        addTab("code", props.path + "/" + props.name, props.name);
      }}
    >
      <div className="flex flex-row justify-start">
        {props.name.endsWith(".move") ? (
          <FileBox
            strokeWidth={1.25}
            className="mr-2 w-4 h-4 text-teal-500"
          />
        ) : props.name.endsWith(".toml") ? (
          <FileCog
            strokeWidth={1.25}
            className="mr-2 w-4 h-4 text-teal-500"
          />
        ) : (
          <File strokeWidth={1.25} className="mr-2 w-4 h-4 text-teal-500" />
        )}
        {props.name}
      </div>
      <div className="hidden group-hover:flex flex-row items-center">
        <Trash2
          className="w-[16px] h-[16px] text-white hover:text-teal-500 hover:cursor-pointer"
          onClick={(event) => {
            event.stopPropagation();
            removeFile();
          }}
        />
      </div>
    </div>
  );
}

function FolderComponent(props: { path: string; name: string }) {
  const { addTab } = useContext(BuildContext);

  const [fileBarHeight, setFileBarHeight] = useState<number>(0);
  useEffect(() => {
    console.log("file bar height", fileBarHeight);
    console.log(`h-[${fileBarHeight}px] border rounded-full w-[2.5px]`);
  }, [fileBarHeight]);

  const files = useLiveQuery(async () => {
    const project = await db.projects.get(props.path.split("/")[0]);
    if (!project) return [];
    let forks = (props.path + "/" + props.name).split("/").splice(1);
    if (!forks) return [];
    let currentFolder = project.files as IFile[];
    while (forks.length > 0) {
      currentFolder = currentFolder.find((file) => file.name === forks[0])
        ?.children as IFile[];
      forks.shift();
    }

    if (currentFolder) {
      setFileBarHeight(30 * currentFolder.length);
    }

    return currentFolder || [];
  }, [props.path, props.name]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const addFile = async () => {
    let fileName = prompt("Enter file name");
    if (!fileName || fileName.split(".").length > 2 || !(fileName.endsWith(".move") || fileName.endsWith(".toml"))) {
      alert("File name should end with .move or .toml");
      return
    }
    let forks = (props.path + "/" + props.name).split("/");
    console.log(forks);
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || "");
    if (!project) return;
    console.log("project", project);
    let currentFolder = project.files as IFile[];
    while (forks.length > 0) {
      console.log("current folder", currentFolder);
      currentFolder = currentFolder.find((file) => file.name === forks[0])
        ?.children as IFile[];
      forks.shift();
    }
    if (fileName) {
      let file: IFile = {
        type: "file",
        name: fileName,
        content: "",
      };
      currentFolder.push(file);
      await db.projects.put(project);
      addTab("code", props.path + "/" + props.name + "/" + fileName, fileName);
    }
  };

  const addFolder = async () => {
    let folderName = prompt("Enter folder name");
    if (!folderName || folderName.split(".").length > 1) {
      alert("Invalid folder name");
      return
    }
    let forks = (props.path + "/" + props.name).split("/");
    console.log(forks);
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || "");
    if (!project) return;
    console.log("project", project);
    let currentFolder = project.files as IFile[];
    while (forks.length > 0) {
      console.log("current folder", currentFolder);
      currentFolder = currentFolder.find((file) => file.name === forks[0])
        ?.children as IFile[];
      forks.shift();
    }
    if (folderName) {
      let folder: IFile = {
        type: "folder",
        name: folderName,
        children: [],
      };
      currentFolder.push(folder);
      await db.projects.put(project);
    }
  };

  const deleteFolder = async () => {
    let forks = (props.path + "/" + props.name).split("/");
    console.log(forks);
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || "");
    if (!project) return;
    console.log("project", project);
    let currentFolder = project.files as IFile[];
    while (forks.length > 1) {
      console.log("current folder", currentFolder);
      currentFolder = currentFolder.find((file) => file.name === forks[0])
        ?.children as IFile[];
      forks.shift();
    }
    const folderIndex = currentFolder.findIndex(
      (file) => file.name === forks[0]
    );
    currentFolder.splice(folderIndex, 1);
    console.log("current folder", currentFolder);
    console.log("project", project);
    await db.projects.put(project);
  };

  const renameFolder = async () => {
    let newName = prompt("Enter new name");
    if (!newName || newName.split(".").length > 1) {
      alert("Invalid folder name");
      return
    }
    let forks = (props.path + "/" + props.name).split("/");
    console.log(forks);
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || "");
    if (!project) return;
    console.log("project", project);
    let currentFolder = project.files as IFile[];
    while (forks.length > 1) {
      console.log("current folder", currentFolder);
      currentFolder = currentFolder.find((file) => file.name === forks[0])
        ?.children as IFile[];
      forks.shift();
    }
    const folderIndex = currentFolder.findIndex(
      (file) => file.name === forks[0]
    );
    currentFolder[folderIndex].name = newName || "";
    console.log("current folder", currentFolder);
    console.log("project", project);
    await db.projects.put(project);
  };

  return (
    <div>
      <div
        className="group px-1 w-full text-slate-200 antialiased h-8 font-mono flex flex-row justify-between hover:bg-accent hover:text-accent-foreground hover:text-teal-500 rounded items-center"
        onClick={(event) => {
          event?.preventDefault();
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex flex-row justify-start items-center">
          {isOpen ? (
            <FolderOpen
              strokeWidth={1.25}
              className="mr-2 w-4 h-4 text-teal-500"
            />
          ) : (
            <FolderClosed
              strokeWidth={1.25}
              className="mr-2 w-4 h-4 text-teal-500"
            />
          )}
          {props.name}
        </div>
        <div className="hidden group-hover:flex flex-row items-center gap-1">
          <Pencil 
            className="w-[16px] h-[16px] text-white hover:text-teal-500 hover:cursor-pointer" 
            onClick={(event) => {
              event.stopPropagation();
              renameFolder();
            }}
          />
          <FilePlus 
            className="w-[16px] h-[16px] text-white hover:text-teal-500 hover:cursor-pointer" 
            onClick={(event) => {
              event.stopPropagation();
              addFile();
            }}
          />
          <FolderPlus 
            className="w-[16px] h-[16px] text-white hover:text-teal-500 hover:cursor-pointer" 
            onClick={(event) => {
              event.stopPropagation();
              addFolder();
            }}
          />
          <Trash2 
            className="w-[16px] h-[16px] text-white hover:text-teal-500 hover:cursor-pointer" 
            onClick={(event) => {
              event.stopPropagation();
              deleteFolder();
            }}
          />
        </div>
      </div>
      {files && files.length > 0 && isOpen && (
        <div className="pl-2 w-full font-mono flex flex-row justify-start gap-2 items-center">
          <Separator
            className={`h-[${fileBarHeight.toString()}px] rounded-full bg-slate-300`}
            orientation="vertical"
          />
          <div className="w-full">
            {createFileSystem(addTab, files, props.path + "/" + props.name)}
          </div>
        </div>
      )}
    </div>
  );
}
