import { JSX, useEffect, useState } from "react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { ChevronRightSquare, CopyPlus, Download, Eye, File, FileBox, FileCog, FilePlus, FlaskConical, FoldVertical, FolderClosed, FolderEdit, FolderOpen, FolderPlus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { IFile } from "../db/ProjectsDB";
import { db } from "../db/db";
import { useLiveQuery } from "dexie-react-hooks";


function createFileSystem(addTab: (path: string, name: string) => void, files: IFile[], path: string): JSX.Element[]  {
  console.log('path', path)
  const fileSytem: JSX.Element[] = []
  files.forEach(file => {
    if (file.type === 'file') {
      fileSytem.push(
        <FileComponent path={path} name={file.name} addTab={addTab}/>
      )
    } else if (file.type === 'folder') {
      fileSytem.push(
        <FolderComponent path={path} name={file.name} addTab={addTab}/>
      )
    }
  })
  return fileSytem
}

export default function Files(
  props: {
    projectName: string;
    addTab: (path: string, name: string) => void;
  }
) {

  const contents = useLiveQuery(async () => {
    const project = await db.projects.get(props.projectName)
    if (!project) return [];
    const files = project.files;

    // Sort the files
    // All files with type folder should be at the top of the list and sorted alphabetically
    // All files with type file should be at the bottom of the list and sorted alphabetically
    const folders: IFile[] = []
    const filesArray: IFile[] = []
    files.forEach(file => {
      if (file.type === 'folder') {
        folders.push(file)
      } else {
        filesArray.push(file)
      }
    })
    // Sort the files and folders by name individually
    const sortedFiles = filesArray.sort((a, b) => a.name.localeCompare(b.name))
    const sortedFolders = folders.sort((a, b) => a.name.localeCompare(b.name))
    // Merge the sorted files and folders
    const merged = [...sortedFolders, ...sortedFiles]
    // Set the contents
    return merged || [];
  }, [props.projectName]);

  return (
    <div>
      {
        contents &&
        createFileSystem(props.addTab, contents, props.projectName)
      }
    </div>
  )
}

function FileComponent(
  props: {
    path: string;
    name: string;
    addTab: (path: string, name: string) => void;
  }
) {

  const removeFile = async () => {
    let forks = (props.path + '/' + props.name).split('/');
    console.log('forks', forks)
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || '');
    if (!project) return;
    console.log('project', project)
    let currentFolder = project.files as IFile[];
    while (forks.length > 1) {
      console.log('current folder', currentFolder)
      currentFolder = currentFolder.find(file => file.name === forks[0])?.children as IFile[];
      forks.shift();
    }
    const fileIndex = currentFolder.findIndex(file => file.name === forks[0]);
    currentFolder.splice(fileIndex, 1);
    console.log('current folder', currentFolder)
    console.log('project', project)
    await db.projects.put(project);
  }


  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          className="px-1 w-full text-slate-300 h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center"
          onClick={(event) => {
            event?.preventDefault()
            console.log(props.path + '/' + props.name)
            props.addTab(props.path + '/' + props.name, props.name)
          }}
        >
          {
            props.name.endsWith('.move') ?
            <FileBox strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/> : 
            props.name.endsWith('.toml') ?
            <FileCog strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/> : 
            <File strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/>
          }
          {props.name}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-slate-900">
        <ContextMenuItem>
          <Pencil className="mr-2 w-4 h-4"/> Rename
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem
          onClick={(event) => {
            event?.preventDefault()
            console.log(props.path + '/' + props.name)
            props.addTab(props.path + '/' + props.name, props.name)
          }}
        >
          <Eye className="mr-2 w-4 h-4"/> Open
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem>
          <CopyPlus className="mr-2 w-4 h-4"/> Duplicate
        </ContextMenuItem>
        <ContextMenuItem>
          <Download className="mr-2 w-4 h-4"/> Move
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem onClick={removeFile}>
          <Trash2 className="mr-2 w-4 h-4"/> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function FolderComponent(
  props: {
    path: string;
    name: string;
    addTab: (path: string, name: string) => void;
  }
) {

  const [fileBarHeight, setFileBarHeight] = useState<number>(0);
  useEffect(() => {
    console.log('file bar height', fileBarHeight)
    console.log(`h-[${fileBarHeight}px] border rounded-full w-[2.5px]`)
  }, [fileBarHeight])

  const files = useLiveQuery(async () => {
    const project = await db.projects.get(props.path.split('/')[0])
    if (!project) return [];
    let forks = (props.path + '/' + props.name).split('/').splice(1);
    if (!forks) return [];
    let currentFolder = project.files as IFile[];
    while (forks.length > 0) {
      currentFolder = currentFolder.find(file => file.name === forks[0])?.children as IFile[];
      forks.shift();
    }

    if (currentFolder) {
      setFileBarHeight(30 * currentFolder.length);
    }

    return currentFolder || [];
  }, [props.path, props.name])

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const addFile = async () => {
    let fileName = prompt('Enter file name');
    let forks = (props.path + '/' + props.name).split('/');
    console.log(forks)
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || '');
    if (!project) return;
    console.log('project', project)
    let currentFolder = project.files as IFile[];
    while (forks.length > 0) {
      console.log('current folder', currentFolder)
      currentFolder = currentFolder.find(file => file.name === forks[0])?.children as IFile[];
      forks.shift();
    }
    if (fileName) {
      let file: IFile = {
        type: 'file',
        name: fileName,
        content: ''
      }
      currentFolder.push(file);
      await db.projects.put(project);
    }
  }

  const addFolder = async () => {
    let folderName = prompt('Enter folder name');
    let forks = (props.path + '/' + props.name).split('/');
    console.log(forks)
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || '');
    if (!project) return;
    console.log('project', project)
    let currentFolder = project.files as IFile[];
    while (forks.length > 0) {
      console.log('current folder', currentFolder)
      currentFolder = currentFolder.find(file => file.name === forks[0])?.children as IFile[];
      forks.shift();
    }
    if (folderName) {
      let folder: IFile = {
        type: 'folder',
        name: folderName,
        children: []
      }
      currentFolder.push(folder);
      await db.projects.put(project);
    }
  }

  const deleteFolder = async () => {
    let forks = (props.path + '/' + props.name).split('/');
    console.log(forks)
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || '');
    if (!project) return;
    console.log('project', project)
    let currentFolder = project.files as IFile[];
    while (forks.length > 1) {
      console.log('current folder', currentFolder)
      currentFolder = currentFolder.find(file => file.name === forks[0])?.children as IFile[];
      forks.shift();
    }
    const folderIndex = currentFolder.findIndex(file => file.name === forks[0]);
    currentFolder.splice(folderIndex, 1);
    console.log('current folder', currentFolder)
    console.log('project', project)
    await db.projects.put(project);
  }

  const renameFolder = async () => {
    let newName = prompt('Enter new name');
    let forks = (props.path + '/' + props.name).split('/');
    console.log(forks)
    let projectName = forks.shift();
    let project = await db.projects.get(projectName || '');
    if (!project) return;
    console.log('project', project)
    let currentFolder = project.files as IFile[];
    while (forks.length > 1) {
      console.log('current folder', currentFolder)
      currentFolder = currentFolder.find(file => file.name === forks[0])?.children as IFile[];
      forks.shift();
    }
    const folderIndex = currentFolder.findIndex(file => file.name === forks[0]);
    currentFolder[folderIndex].name = newName || '';
    console.log('current folder', currentFolder)
    console.log('project', project)
    await db.projects.put(project);
  }

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className="px-1 w-full text-slate-300 h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center"
            onClick={(event) => {
              event?.preventDefault()
              setIsOpen(!isOpen)
            }}
          >
            {
              isOpen ? 
              <FolderOpen strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/> :
              <FolderClosed strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/>
            }
            {props.name}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-slate-900">
          <ContextMenuItem onClick={renameFolder}>
            <Pencil className="mr-2 w-4 h-4"/> Rename
          </ContextMenuItem>
          <Separator />
          <ContextMenuItem onClick={addFile}>
            <FilePlus className="mr-2 w-4 h-4"/> Add file 
          </ContextMenuItem>
          <ContextMenuItem onClick={addFolder}>
            <FolderPlus className="mr-2 w-4 h-4"/> Add folder 
          </ContextMenuItem>
          {/* <ContextMenuItem>
            <FoldVertical className="mr-2 w-4 h-4"/> Collaspe child folders 
          </ContextMenuItem> */}
          <Separator />
          <ContextMenuItem onClick={deleteFolder}>
            <Trash2 className="mr-2 w-4 h-4"/> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {
        files &&
        files.length > 0 &&
        isOpen &&
        <div className="pl-2 w-full font-mono flex flex-row justify-start gap-2 items-center">
          <Separator className={`h-[${fileBarHeight.toString()}px] rounded-full bg-slate-300`} orientation="vertical"/>
          <div className="w-full">
            {
              createFileSystem(props.addTab, files, props.path + '/' + props.name)
            }
          </div>
        </div>
      }
    </div>
  )
}