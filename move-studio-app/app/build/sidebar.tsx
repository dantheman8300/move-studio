
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
import { ChevronRightSquare, CopyPlus, Download, ExternalLink, Eye, FileBox, FileCog, FilePlus, FlaskConical, FoldVertical, FolderClosed, FolderEdit, FolderOpen, FolderPlus, GaugeCircle, ListChecks, ListX, Loader2, MoreVertical, PackageCheck, PackageX, Pencil, Rocket, Trash2 } from "lucide-react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { IFile, IProject, IndexedDb } from "../db/ProjectsDB";
import Files from "./files";
import { useToast } from "@/components/ui/use-toast";
import { db } from "../db/db";
import { useLiveQuery } from "dexie-react-hooks";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useWallet } from "@suiet/wallet-kit";

export default function Sidebar(
  props: {
    selectedProjectName: string;
    addTab: (path: string, name: string) => void;
    setError: (error: string) => void;

    addToDigests: (newDigests: {digestId: string, type: 'package' | 'object', name: string}[]) => void
  }
) {
  const wallet = useWallet();

  const { toast } = useToast();

  const currentProject = useLiveQuery(() => db.projects.get(props.selectedProjectName), [props.selectedProjectName]);

  const deleteProject = async () => {
    let confirm = window.confirm('Are you sure you want to delete this project?');
    if (confirm) {
      await db.projects.delete(props.selectedProjectName);
      window.location.reload();
    }
  }

  const addFile = async () => {
    let fileName = prompt('Enter file name');
    if (fileName) {
      let file: IFile = {
        type: 'file',
        name: fileName,
        content: ''
      }
      await db.projects.update(props.selectedProjectName, {files: [...currentProject?.files || [], file]});
    }
  }

  const addFolder = async () => {
    let folderName = prompt('Enter folder name');
    if (folderName) {
      let folder: IFile = {
        type: 'folder',
        name: folderName,
        children: []
      }
      await db.projects.update(props.selectedProjectName, {files: [...currentProject?.files || [], folder]});
    }
  }

  const compileProject = async (): Promise<{modules: string[], dependencies: string[], digest: number[]}> => {
    console.log('compile project');
    
    props.setError('');

    toast({
      description: <div className="flex flex-row gap-2 items-center justify-start">
        <GaugeCircle className="w-6 h-6 animate-spin" />
        Compiling...
      </div>,
    })

    const response = await fetch(
      'http://localhost:80/compile',
      {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentProject)
      }
    );

    const data = await response.json();
    
    if (data.error) {
      props.setError(data.errorMessage);
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageX className="w-6 h-6" />
          Project compilation failed
        </div>,
      })
      return {modules: [], dependencies: [], digest: []};
    } else {
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageCheck className="w-6 h-6" />
          Project compiled successfully
        </div>,
      })
      return data.compileResults;
    }
  }

  const testProject = async () => {
    console.log('test project');
    
    props.setError('');

    toast({
      description: <div className="flex flex-row gap-2 items-center justify-start">
        <FlaskConical className="w-6 h-6 animate-bounce" />
        Testing...
      </div>,
    })

    const response = await fetch(
      'http://localhost:80/test',
      {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentProject)
      }
    );

    const data = await response.json();

    console.log(data);
    
    if (data.error) {
      props.setError(data.errorMessage);
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <ListX className="w-6 h-6" />
          Project tests failed
        </div>,
      })
    } else {
      props.setError(data.testResults);
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <ListChecks className="w-6 h-6" />
          Project tests successful
        </div>,
      })
    }
  }

  const deployProject = async () => {

    const compiledModulesAndDependencies = await compileProject();

    toast({
      description: <div className="flex flex-row gap-2 items-center justify-start">
        <GaugeCircle className="w-6 h-6 animate-spin" />
        Deploying...
      </div>,
    })

    console.log(compiledModulesAndDependencies)

    if (compiledModulesAndDependencies.modules.length === 0) {
      return;
    }

    const txb = new TransactionBlock();
    
    const [upgradeCap] = txb.publish({
      modules: compiledModulesAndDependencies.modules,
      dependencies: compiledModulesAndDependencies.dependencies,
    });

    txb.transferObjects([upgradeCap], txb.pure(wallet.address));

    try {
      const publishTxn = await wallet.signAndExecuteTransactionBlock({ transactionBlock: txb as any });

      console.log(publishTxn);

      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageCheck className="w-6 h-6" />
          Project deployed successfully
          <a><ExternalLink className="w-4 h-4" href={`https://suiexplorer.com/txblock/${publishTxn.digest}`} /></a>
        </div>,
      })

      console.log(publishTxn.objectChanges)

      const newDigests = [] as {digestId: string, type: 'package' | 'object', name: string}[];
      for (let objectChange of publishTxn.objectChanges || []) {
        if (objectChange.type === 'published') {
          newDigests.push({
            name: props.selectedProjectName,
            digestId: objectChange.packageId,
            type: 'package'
          });
        } else if (objectChange.type === 'created') {
          newDigests.push({
            name: props.selectedProjectName,
            digestId: objectChange.objectId,
            type: 'object'
          });
        }
      }

      console.log(newDigests)

      if (newDigests) {
        props.addToDigests(newDigests);
      }

    } catch (error) {
      console.log(error);
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageX className="w-6 h-6" />
          Project deployment failed
        </div>,
      })
    }
  }

  const renameProject = async () => {
    let projectName = prompt('Enter new project name');
    if (projectName) {
      await db.projects.update(props.selectedProjectName, {name: projectName});
      window.location.reload();
    }
  }

  const duplicateProject = async () => {
    let projectName = prompt('Entry duplicate project name');
    if (projectName) {
      await db.projects.add({name: projectName, files: currentProject?.files || []});
    }
  }

  return (
    <div className="pl-2 pr-2 py-2 w-full h-full flex flex-col items-center justify-start gap-1 border rounded-xl shadow-lg shadow-sky-500/75">
      <Input className="bg-slate-900 h-8 focus-visible:ring-1 focus-visible:ring-ring" type="text" placeholder="Search..." />
      <Accordion type="multiple" className="w-full grow">
        <AccordionItem value="item-1" className="w-full">
          <AccordionTrigger className="w-full">
            <div className="w-full flex flex-row items-center justify-between">
              Files
              <div className="flex flex-row gap-1 items-end justify-center">
                <FilePlus className="w-4 h-4 hover:bg-accent rounded" onClick={addFile}/>
                <FolderPlus className="w-4 h-4 hover:bg-accent rounded" onClick={addFolder} />
                {/* <MoreVertical className="w-4 h-4 hover:bg-accent rounded" /> */}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="w-full h-fit max-h-96 overflow-y-auto">
            <Files projectName={props.selectedProjectName} addTab={props.addTab} />
          </AccordionContent>
        </AccordionItem>
        <Separator className="bg-slate-700" />
        <AccordionItem value="item-2">
          <AccordionTrigger>Tools</AccordionTrigger>
          <AccordionContent >
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-300 text-sm font-mono" onClick={compileProject}>
                <ChevronRightSquare strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500" /> Compile
              </Button>
              <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-300 text-sm font-mono" onClick={testProject}>
                <FlaskConical strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/> Test
              </Button>
              <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-300 text-sm font-mono" onClick={deployProject}>
                <Rocket strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/> Deploy
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
        <Separator className="bg-slate-700" />
        <AccordionItem value="item-3">
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="flex flex-row w-full justify-start" onClick={renameProject}>
                <FolderEdit strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500" /> Rename project
              </Button>
              <Button variant="ghost" className="flex flex-row w-full justify-start" onClick={duplicateProject}>
                <CopyPlus strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/> Duplicate project
              </Button>
              <Button variant="ghost" className="flex flex-row w-full justify-start" onClick={deleteProject}>
                <Trash2 strokeWidth={1.25} className="mr-2 w-4 h-4 text-slate-500"/> Delete project
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}