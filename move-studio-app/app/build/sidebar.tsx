
const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CaretSortIcon, CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronRightSquare, CopyPlus, Download, Eye, FileBox, FileCog, FilePlus, FlaskConical, FoldVertical, FolderClosed, FolderEdit, FolderOpen, FolderPlus, MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { IFile, IProject, IndexedDb } from "../db/ProjectsDB";
import Files from "./files";

export default function Sidebar(
  props: {
    selectProjectName: string;
    addTab: (path: string, name: string) => void;
  }
) {

  const [currentProject, setCurrentProject] = useState<IProject | null>(null);

  let indexedDb: IndexedDb;

  useEffect(() => {
    console.log("project name", props.selectProjectName);

    getProjectData(props.selectProjectName).then((project) => {
      setCurrentProject(project);
    })
  }, [props.selectProjectName])

  const getProjectData = async (project: string) => {
    indexedDb = new IndexedDb('test');
    await indexedDb.createObjectStore(['projects'], {keyPath: 'name'});
    const projectData = await indexedDb.getValue('projects', project);
    return projectData;
    // console.log('projectData', projectData);
    // return projectData;
  }

  return (
    <div className="pl-2 pr-1 py-2 w-full h-full flex flex-col items-center justify-start gap-1">
      <Input className="bg-slate-900 h-8" type="text" placeholder="Search..." />
      <Accordion type="multiple" className="w-full grow">
        <AccordionItem value="item-1" className="w-full">
          <AccordionTrigger className="w-full">
            <div className="w-full flex flex-row items-center justify-between">
              Files
              <div className="flex flex-row gap-1 items-end justify-center">
                <FilePlus className="w-4 h-4 hover:bg-accent rounded" />
                <FolderPlus className="w-4 h-4 hover:bg-accent rounded" />
                <MoreVertical className="w-4 h-4 hover:bg-accent rounded" />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="w-full h-fit max-h-96 overflow-y-auto">
            <Files files={currentProject?.files || []} addTab={props.addTab} />
          </AccordionContent>
        </AccordionItem>
        <Separator />
        <AccordionItem value="item-2">
          <AccordionTrigger>Tools</AccordionTrigger>
          <AccordionContent >
            <div className="flex flex-col gap-1">
              <Button variant="outline" className="">
                <ChevronRightSquare className="mr-2 w-4 h-4" /> Compile
              </Button>
              <Button variant="outline">
                <FlaskConical className="mr-2 w-4 h-4"/> Test
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        <Separator />
        <AccordionItem value="item-3">
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              <Button variant="outline" className="">
                <FolderEdit className="mr-2 w-4 h-4" /> Rename project
              </Button>
              <Button variant="outline">
                <CopyPlus className="mr-2 w-4 h-4"/> Duplicate project
              </Button>
              <Button variant="destructive">
                <Trash2 className="mr-2 w-4 h-4"/> Delete project
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}