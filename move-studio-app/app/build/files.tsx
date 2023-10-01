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


function createFileSystem(addTab: (path: string, name: string) => void, files: IFile[], path = ''): JSX.Element[]  {
  const fileSytem: JSX.Element[] = []
  files.forEach(file => {
    if (file.type === 'file') {
      fileSytem.push(
        <FileComponent path={path} name={file.name} addTab={addTab}/>
      )
    } else if (file.type === 'folder') {
      fileSytem.push(
        <FolderComponent path={path} name={file.name} files={file.children || []} addTab={addTab}/>
      )
    }
  })
  return fileSytem
}

export default function Files(
  props: {
    files: IFile[],
    addTab: (path: string, name: string) => void;
  }
) {

  const [contents, setContents] = useState<IFile[]>([])

  useEffect(() => {
    // Sort the files 
    // All files with type folder should be at the top of the list and sorted alphabetically
    // All files with type file should be at the bottom of the list and sorted alphabetically
    const files: IFile[] = []
    const folders: IFile[] = []
    props.files.forEach(file => {
      if (file.type === 'folder') {
        folders.push(file)
      } else {
        files.push(file)
      }
    })
    // Sort the files and folders by name individually
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name))
    const sortedFolders = folders.sort((a, b) => a.name.localeCompare(b.name))
    // Merge the sorted files and folders
    const merged = [...sortedFolders, ...sortedFiles]
    // Set the contents
    setContents(merged)

  }, [props])

  return (
    <div>
      {
        createFileSystem(props.addTab, contents)
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
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div 
          className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center"
          onClick={(event) => {
            event?.preventDefault()
            console.log(props.path + '/' + props.name)
            props.addTab(props.path + '/' + props.name, props.name)
          }}
        >
          {
            props.name.endsWith('.move') ?
            <FileBox className="mr-2 w-4 h-4"/> : 
            props.name.endsWith('.toml') ?
            <FileCog className="mr-2 w-4 h-4"/> : 
            <File className="mr-2 w-4 h-4"/>
          }
          {props.name}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-slate-900">
        <ContextMenuItem>
          <Pencil className="mr-2 w-4 h-4"/> Rename
        </ContextMenuItem>
        <Separator />
        <ContextMenuItem>
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
        <ContextMenuItem>
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
    files: IFile[];
    addTab: (path: string, name: string) => void;
  }
) {

  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <div>
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center"
            onClick={(event) => {
              event?.preventDefault()
              setIsOpen(!isOpen)
            }}
          >
            {
              isOpen ? 
              <FolderOpen className="mr-2 w-4 h-4"/> :
              <FolderClosed className="mr-2 w-4 h-4"/>
            }
            {props.name}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-slate-900">
          <ContextMenuItem>
            <Pencil className="mr-2 w-4 h-4"/> Rename
          </ContextMenuItem>
          <Separator />
          <ContextMenuItem>
            <FilePlus className="mr-2 w-4 h-4"/> Add file 
          </ContextMenuItem>
          <ContextMenuItem>
            <FolderPlus className="mr-2 w-4 h-4"/> Add folder 
          </ContextMenuItem>
          <ContextMenuItem>
            <FoldVertical className="mr-2 w-4 h-4"/> Collaspe child folders 
          </ContextMenuItem>
          <Separator />
          <ContextMenuItem>
            <Trash2 className="mr-2 w-4 h-4"/> Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {
        isOpen &&
        <div className="pl-2 w-full font-mono flex flex-row justify-start gap-2 items-center">
          <Separator className={`h-${(8*props.files.length).toString()} border`} orientation="vertical" />
          {
            createFileSystem(props.addTab, props.files, props.path + '/' + props.name)
          }
        </div>
      }
    </div>
  )
}