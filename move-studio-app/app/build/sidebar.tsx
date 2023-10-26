
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { BookMarked, Calculator, Calendar, CreditCard, PanelLeftClose, PanelLeftOpen, Settings, Smile, User } from 'lucide-react';
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
import { Blocks, ChevronDown, ChevronRightSquare, CopyPlus, Disc3, Download, DownloadCloud, ExternalLink, Eye, FileBox, FileCog, FilePlus, FlaskConical, FoldVertical, FolderClosed, FolderEdit, FolderOpen, FolderPlus, GaugeCircle, ListChecks, ListX, Loader2, MoreVertical, Orbit, PackageCheck, PackagePlus, PackageX, Pencil, Rocket, Trash2, UploadCloud } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CubeSpinner, WhisperSpinner } from "react-spinners-kit";
import { Badge } from "@/components/ui/badge";

export default function Sidebar(
  props: {
    selectedProjectName: string;
    addTab: (type: string, identifier: string, name: string) => void;
    setError: (error: string) => void;
    transactionDigests: {digestId: string, objects: {type: string, modified: string, objectId: string}[]}[];
    addTransactionDigest: (digestId: string, objects: {type: string, modified: string, objectId: string}[]) => void
    addToDigests: (newDigests: {digestId: string, type: 'package' | 'object', name: string}[]) => void
  }
) {
  const wallet = useWallet();

  const { toast } = useToast();

  const currentProject = useLiveQuery(() => db.projects.get(props.selectedProjectName), [props.selectedProjectName]);

  const [addedPackage, setAddedPackage] = useState('');

  const [commandOpen, setCommandOpen] = useState(false)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((commandOpen) => !commandOpen)
      }
    }
 
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

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
      description: <div className="flex flex-row gap-5 items-center justify-start">
        {/* <Disc3 strokeWidth={1.25} className="w-6 h-6 animate-spin" /> */}
        <WhisperSpinner size={15} color="#14b8a6" backColor="#f59e0b" />
        {/* <CubeSpinner size={15} /> */}
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
          <PackageX strokeWidth={1.25} className="w-6 h-6 text-rose-500" />
          Project compilation failed
        </div>,
      })
      return {modules: [], dependencies: [], digest: []};
    } else {
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageCheck strokeWidth={1.25} className="w-6 h-6 text-teal-500" />
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
        {/* <CubeSpinner size={15} /> */}
        {/* <Orbit strokeWidth={1.25} className="w-6 h-6 animate-spin" /> */}
        <WhisperSpinner size={15} color="#14b8a6" backColor="#f59e0b" />
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
          <ListX strokeWidth={1.25} className="w-6 h-6 text-rose-500"/>
          Project tests failed
        </div>,
      })
    } else {
      props.setError(data.testResults);
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <ListChecks strokeWidth={1.25} className="w-6 h-6 text-teal-500"/>
          Project tests successful
        </div>,
      })
    }
  }

  const deployProject = async () => {

    const compiledModulesAndDependencies = await compileProject();

    toast({
      description: <div className="flex flex-row gap-2 items-center justify-start">
        <WhisperSpinner size={15} color="#14b8a6" backColor="#f59e0b" />
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
          <PackageCheck strokeWidth={1.25} className="w-6 h-6 text-teal-500" />
          Package deployed successfully
          <a href={`https://suiexplorer.com/txblock/${publishTxn.digest}`} target="_blank"><ExternalLink className="w-4 h-4"/></a>
        </div>,
      })

      console.log(publishTxn.objectChanges)

      const objects = [];

      for (let objectChange of publishTxn.objectChanges || []) {
        if (objectChange.type === 'published') {
          props.addTab(
            'package', 
            objectChange.packageId,
            props.selectedProjectName
          );
        } else {
          console.log('object change', objectChange)
          objects.push({
            type: objectChange.objectType,
            modified: objectChange.type,
            objectId: objectChange.objectId,
            // owner: objectChange.owner
          })
        }
      }

      props.addTransactionDigest(publishTxn.digest, objects);
      
    } catch (error) {
      console.log(error);
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageX strokeWidth={1.25} className="w-6 h-6 text-rose-500" />
          Project deployment failed
        </div>,
      })
    }
  }

  const addPackage = async () => {
    const newName = prompt('Enter package name');

    if (newName) {
      props.addTab('package', addedPackage, newName);
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

  const loadSuiFramework = async () => {
    console.log('load sui framework')
    props.addTab('package', '0x02', 'Sui Framework');
  }

  return (
    <ScrollArea 
      className="pl-2 pr-2 w-full flex flex-col items-center justify-start gap-1 border rounded-xl shadow-lg shadow-teal-400/75"
      style={{
        height: 'calc(100vh - 82px)'
      }}
    >
      <CommandDialog modal={false} open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="antialiased" heading="Files">
            <CommandItem>
              <FilePlus strokeWidth={1.25} className="mr-2 h-4 w-4" />
              <span>Create file</span>
            </CommandItem>
            <CommandItem>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>Create folder</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Tools">
            <CommandItem>
              <ChevronRightSquare className="mr-2 h-4 w-4" />
              <span>Compile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <FlaskConical className="mr-2 h-4 w-4" />
              <span>Test</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Rocket className="mr-2 h-4 w-4" />
              <span>Deploy</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onClick={() => {
              setCommandOpen(false);
              loadSuiFramework();
            }}>
              <BookMarked className="mr-2 h-4 w-4" />
              <span>Load Sui Framework</span>
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Rename project</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Duplicate project</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Delete project</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
      {/* <Input className="bg-slate-900 h-8" type="text" placeholder="Search..." /> */}
      <Accordion type="multiple" className="w-full grow antialiased">
        {
          currentProject &&
          <div>
            <AccordionItem value="item-1" className="w-full">
              <AccordionTrigger className="w-full">
                <div className="w-full flex flex-row items-center justify-between text-base">
                  Files
                  <div className="flex flex-row gap-1 items-end justify-center">
                    <FilePlus className="w-4 h-4" onClick={addFile}/>
                    <FolderPlus className="w-4 h-4" onClick={addFolder} />
                    {/* <MoreVertical className="w-4 h-4 hover:bg-accent rounded" /> */}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="w-full h-fit max-h-96 overflow-y-auto">
                <Files projectName={props.selectedProjectName} addTab={props.addTab} />
              </AccordionContent>
            </AccordionItem>
            <Separator className="bg-slate-700" />
          </div>
        }
        <AccordionItem value="item-2">
          <AccordionTrigger className="antialiased text-base">Tools</AccordionTrigger>
          <AccordionContent >
            <div className="flex flex-col items-start gap-1">
              {
                currentProject &&
                <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-200 text-sm font-mono hover:text-teal-500" onClick={compileProject}>
                  <ChevronRightSquare strokeWidth={1.25} className="mr-2 w-4 h-4 text-teal-500" /> Compile
                </Button>
              }
              {
                currentProject &&
                <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-200 text-sm font-mono hover:text-teal-500" onClick={testProject}>
                  <FlaskConical strokeWidth={1.25} className="mr-2 w-4 h-4 text-teal-500"/> Test
                </Button>
              }
              {
                currentProject &&
                <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-200 text-sm font-mono hover:text-teal-500 " onClick={deployProject}>
                  <Rocket strokeWidth={1.25} className="mr-2 w-4 h-4 text-teal-500"/> Deploy
                </Button>
              }
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="ps-4 py-2">
                    <div className="flex flex-col items-start gap-1.5">
                      <Label className="antialiased text-slate-200 font-mono">Load Package</Label>
                      <div className="flex flex-row items-center justify-center gap-1">
                        <Input className="w-full max-w-[175px] min-w-[50px] bg-slate-900 h-8 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500" type="text" placeholder="0x000..000" value={addedPackage} onChange={(e) => {setAddedPackage(e.target.value)}} />
                        <Button variant="secondary" size='sm' className="w-full flex flex-row justify-center text-slate-300 text-sm font-mono max-w-[50px]" onClick={addPackage}>
                          <DownloadCloud strokeWidth={1.25} className="w-4 h-4 text-teal-300"/>
                        </Button>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {/* <TooltipContent side="right" className="bg-teal-600 text-teal-950">
                    <p>Add an existing package</p>
                  </TooltipContent> */}
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="ps-4 py-2">
                    <div className="flex flex-col items-start gap-1.5">
                      <Label className="antialiased text-slate-200 font-mono">Load Object</Label>
                      <div className="flex flex-row items-center justify-center gap-1">
                        <Input className="w-full max-w-[175px] min-w-[50px] bg-slate-900 h-8 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-teal-500 font-mono caret-teal-500" type="text" placeholder="0x000..000" />
                        <Button variant="secondary" size='sm' className="w-full flex flex-row justify-center text-slate-300 text-sm font-mono max-w-[50px]" onClick={addPackage}>
                          <PackagePlus strokeWidth={1.25} className="w-4 h-4 text-teal-300"/>
                        </Button>
                      </div>
                    </div>
                  </TooltipTrigger>
                  {/* <TooltipContent side="right" className="bg-teal-600 text-teal-950">
                    <p>Add a object</p>
                  </TooltipContent> */}
                </Tooltip>
              </TooltipProvider>
            </div>
          </AccordionContent>
        </AccordionItem>
        <Separator className="bg-slate-700" />
        {
          props.transactionDigests.length > 0 &&
          <AccordionItem value="item-4">
            <AccordionTrigger className="antialiased text-base">Transaction history</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-min max-h-[200px] w-full max-w-[300px] flex flex-col items-center justify-start gap-2">
                {
                  props.transactionDigests.map((digest) => {
                    return (
                      <Popover>
                        <PopoverTrigger asChild className="w-full max-w-[300px]">
                          <Button variant="ghost" className="h-10 w-fit max-w-[300px] flex flex-row items-center justify-start ps-4 text-sm text-ellipsis font-mono antialiased text-teal-800 hover:text-teal-500">
                            {
                              `${digest.digestId.slice(0, 10)}...${digest.digestId.slice(digest.digestId.length - 10, digest.digestId.length)}`
                            }
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent side="right">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Transaction details</h4>
                            <p className="text-sm text-muted-foreground">
                              List of objects that were created, updated, or deleted in this transaction.
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {
                              digest.objects.map((object) => {

                                const packageId = object.type.split('::')[0];
                                const moduleName = object.type.split('::')[1];
                                const objectName = object.type.replace(`${packageId}::${moduleName}::`, '');

                                return (
                                  <div className="border rounded-xl p-2">
                                    <Collapsible open={true}>
                                      <div className="flex flex-row items-center justify-between">
                                        <CollapsibleTrigger className="flex flex-row items-center justify-between">
                                          <div className="text-base"><span className="font-mono text-teal-500">{objectName}</span></div>
                                          {/* <ChevronDown className="w-4 h-4"/> */}
                                        </CollapsibleTrigger>
                                        <Button variant='ghost' size="icon" className="w-6 h-6 " onClick={() => {
                                          props.addToDigests([{digestId: object.objectId, type: 'object', name: objectName}])
                                        }}>
                                          <ChevronRightSquare strokeWidth={1.25} className="w-5 h-5"/>
                                        </Button>
                                      </div>
                                      <CollapsibleContent className="w-full max-w-[300px]">
                                        <div className="w-full flex flex-col items-center justify-start pt-2 px-3">
                                          <div className="w-full flex flex-row items-center justify-between">
                                            <span>Package: </span>
                                            <span className="font-mono">{
                                              packageId.length < 20 ? packageId : 
                                              `${packageId.slice(0, 6)}...${packageId.slice(packageId.length - 4, packageId.length)}`
                                            }</span>
                                          </div>
                                          <div className="w-full flex flex-row items-center justify-between">
                                            <span>Module: </span>
                                            <span className="font-mono">{moduleName}</span>
                                          </div>
                                          <div className="w-full flex flex-row items-center justify-between">
                                            <span>Type: </span>
                                            <span className="font-mono">{objectName}</span>
                                          </div>
                                        </div>
                                        <div className="flex flex-row w-full items-center justify-end pt-2">
                                          <Badge className="border border-teal-500 text-teal-500 bg-slate-950 font-mono text-xs rounded-xl hover:bg-slate-950">
                                            {object.modified}
                                          </Badge>
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </div>
                                )
                              })
                            }
                          </div>
                        </div>
                        </PopoverContent>
                      </Popover>
                    )
                  })
                }
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        }
        {
          props.transactionDigests.length > 0 &&
          <Separator className="bg-slate-700" />
        }
        <AccordionItem value="item-3">
          <AccordionTrigger className="antialiased text-base">Settings</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-200 text-sm font-mono hover:text-teal-500" onClick={renameProject}>
                <FolderEdit strokeWidth={1.25} className="mr-2 w-4 h-4 text-teal-500" /> Rename project
              </Button>
              <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-200 text-sm font-mono hover:text-teal-500" onClick={duplicateProject}>
                <CopyPlus strokeWidth={1.25} className="mr-2 w-4 h-4 text-teal-500"/> Duplicate project
              </Button>
              <Button variant="ghost" className="flex flex-row w-full justify-start text-slate-200 text-sm font-mono hover:text-teal-500" onClick={deleteProject}>
                <Trash2 strokeWidth={1.25} className="mr-2 w-4 h-4 text-teal-500"/> Delete project
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollArea>
  )
}