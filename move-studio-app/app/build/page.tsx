'use client';

import ThemeToggle from "@/components/ThemeToggle";
import TypographyH2 from "@/components/TypographyH2";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import WalletSelector from "@/components/walletSelector";
import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useState } from "react";
import { IProject, IndexedDb } from "../db/ProjectsDB";
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CodeEditor from "./codeEditor";
import Sidebar from "./sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { set } from "date-fns";
import MainWindow from "./mainWindow";
import Ansi from "ansi-to-react";
import { PanelRightClose, Upload, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ObjectCard from "./ObjectCard";

import { track } from '@vercel/analytics';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AddProjectCard from "./addProjectCard";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import UploadProjectCard from "./uploadProjectCard";

const demoCode = `module demoPackage::party {

  // Libraries being used
  use sui::transfer;

  // Object that can be deployed
  public struct Balloon has key {
    id: UID,
    popped: bool
  }

  // Deploy a new balloon
  fun init(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  public entry fun pop_balloon(balloon: &mut Balloon) {
    balloon.popped = true;
  }

  public entry fun fill_up_balloon(ctx: &mut TxContext) {
    new_balloon(ctx);
  }

  // Create a new balloon object and make it available to anyone
  fun new_balloon(ctx: &mut TxContext) {
    let balloon = Balloon{
      id: object::new(ctx), 
      popped: false
    };
    transfer::share_object(balloon);
  }
            
}`

const demoToml = `
[package]
name = "demoPackage"
version = "0.0.1"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet" }

[addresses]
Sui = "0x02"
demoPackage = "0x0"
`

const demoPackage: IProject = {
  name: 'demoPackage',
  files: [
    {
      type: 'folder',
      name: 'sources',
      children: [
        {
          type: 'file',
          name: 'party.move', 
          content: demoCode
        }
      ]
    }, 
    {
      type: 'file',
      name: 'move.toml', 
      content: demoToml
    }
  ]
}

export default function BuildPage () {

  const projectList = useLiveQuery(() => db.projects.toArray()) || [];
  const [packageDigests, setPackageDigests] = useState<{digestId: string, name: string}[]>([]);
  const [objectDigests, setObjectDigests] = useState<{digestId: string, name: string}[]>([]);

  const [open, setOpen] = useState(false)
  const [selectedProjectName, setSelectedProjectName] = useState("")

  const [showSidebar, setShowSidebar] = useState(true);

  const [tabs, setTabs] = useState<({type: 'code', path: string, name: string} | {type: 'package', digestId: string, name: string})[]>([])
  const [activeTab, setActiveTab] = useState<string>('')

  const [transactionDigests, setTransactionDigests] = useState<{digestId: string, objects: {type: string, modified: string, objectId: string}[]}[]>([]);

  const [error, setError] = useState<string>('');
  useEffect(() => {
    console.log('error', error)
  }, [error])

  const [sidebarWidth, setSidebarWidth] = useState<number>(200);
  useEffect(() => {
    // retrieve sidebar width from local storage
    const sidebarWidth = localStorage.getItem('sidebarWidth');
    if (sidebarWidth) {
      setSidebarWidth(parseInt(sidebarWidth));
    }

    const newUser = localStorage.getItem('newUserV2');
    if (!newUser) {
      addDemoProject();
    }
  }, []);

  const addDemoProject = async () => {
    await db.projects.add({name: 'demoPackage', files: [
      {
        type: 'folder', 
        name: 'sources',
        children: [
          {
            type: 'file',
            name: 'party.move', 
            content: demoCode
          }
        ]
      }, 
      {
        type: 'file', 
        name: 'Move.toml',
        content: `[package]
name = "${'demoPackage'}"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet" }

[addresses]
${'demoPackage'} = "0x0"
`
      }
    ]});
    localStorage.setItem('newUserV2', 'true');
    track('demo-project-created');
  }

  useEffect(() => {
    const newTabs = tabs.filter((tab) => {
      return tab.type === 'package'
    });
    setTabs(newTabs);

    if (activeTab in newTabs.map((tab) => tab.type === 'code' ? tab.path : '')) {
      setActiveTab('');
    }
  }, [selectedProjectName])

  const addTab = (type: string, identifier: string, name: string) => {
    if (type == 'code') {
      const isAlreadyTab = tabs.find(tab => (
        tab.type === 'code' && tab.path === identifier
      ));
      if (!isAlreadyTab) {
        setTabs([...tabs, {type, path: identifier, name}])
        setActiveTab(identifier);
      } else {
        setActiveTab(identifier);
      }
    } else if (type == 'package') {
      const isAlreadyTab = tabs.find(tab => (
        tab.type === 'package' && tab.digestId === identifier
      ));
      if (!isAlreadyTab) {
        setTabs([...tabs, {type, digestId: identifier, name}])
        setActiveTab(identifier);
      } else {
        setActiveTab(identifier);
      }
    }
  }

  const removeTab = (type: string, identifier: string) => {
    if (type == 'code') {
      const newTabs = tabs.filter(tab => (
        tab.type === 'package' || 
        (tab.type === 'code' && tab.path !== identifier)
      ));
      setTabs(newTabs);
      if (activeTab === identifier) {
        setActiveTab('');
      }
    } else if (type == 'package') {
      const newTabs = tabs.filter(tab => (
        tab.type === 'code' || 
        (tab.type === 'package' && tab.digestId !== identifier)
      ));
      setTabs(newTabs);
      if (activeTab === identifier) {
        setActiveTab('');
      }
    }
  }

  const clearError = () => {
    setError('');
  }

  const addToDigests = (newDigests: {digestId: string, type: 'package' | 'object', name: string}[]) => {

    const newPackageDigests = newDigests.filter((newDigest) => newDigest.type === 'package');
    const newObjectDigests = newDigests.filter((newDigest) => newDigest.type === 'object');

    setPackageDigests([...packageDigests, ...newPackageDigests]);
    setObjectDigests([...objectDigests, ...newObjectDigests]);
  }

  const addTransactionDigest = (digestId: string, objects: {type: string, modified: string, objectId: string}[]) => {
    setTransactionDigests([{digestId, objects}, ...transactionDigests]);
  }
  
  if (typeof window !== "undefined") {
    return (
      <div className="h-screen w-full max-w-screen flex flex-col items-center dark:bg-slate-950 overflow-hidden">
        <div className="flex w-full flex-row justify-between items-center my-2 px-3">
          <a href="/">
            <TypographyH2 classname="hover:bg-gradient-to-r hover:from-yellow-300 hover:to-amber-500 hover:text-transparent hover:bg-clip-text transition-shadow hover:animate-pulse">Move Studio</TypographyH2>
          </a>
          <div className="flex flex-row justify-around gap-2">
            {
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                    disabled={projectList.length === 0}
                  >
                    {selectedProjectName
                      ? selectedProjectName
                      : "Select project..."}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search project..." className="h-9 caret-teal-500" />
                    <CommandGroup>
                        {
                          projectList.map((projectName) => {
                          console.log('projectName', projectName)
                          return (
                            <CommandItem
                              key={projectName.name}
                              onSelect={() => {
                                console.log('newName', projectName)
                                setSelectedProjectName(projectName.name === selectedProjectName ? "" : projectName.name)
                                setOpen(false)
                              }}
                            >
                              {projectName.name}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedProjectName === projectName.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            }
            <Dialog>
              <DialogTrigger>
                <Button className="p-3 hover:text-teal-500 active:scale-90 transition-transform" variant="secondary">New project</Button>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-none max-w-[400px]">
                <Tabs defaultValue="create">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">New</TabsTrigger>
                    <TabsTrigger value="upload">System</TabsTrigger>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <TabsTrigger value="github" disabled>GitHub</TabsTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Coming soon!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TabsList>
                  <TabsContent value="create">
                    <AddProjectCard />
                  </TabsContent>
                  <TabsContent value="upload">
                    <UploadProjectCard />
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
            
            <WalletSelector isTxnInProgress={false} />
          </div>
        </div>
        {
          showSidebar &&
          <div className="grow w-full flex flex-row items-center justify-start">
            <div 
              className={`h-full flex flex-row items-center justify-end min-w-[15px] py-4 pl-4 gap-2`}
              style={{"width": `${sidebarWidth}px`}}
            >
              {
                sidebarWidth > 0 &&
                <Sidebar 
                  addTab={addTab}
                  selectedProjectName={selectedProjectName} 
                  setError={setError}
                  transactionDigests={transactionDigests}
                  addTransactionDigest={addTransactionDigest}
                  addToDigests={addToDigests}
                />
              }
              <div
                className="h-full flex flex-row items-center justify-center"
              >
                <Separator 
                  draggable
                  onDragStart={(e) => {
                    const blankCanvas: any = document.createElement('canvas');
                    e.dataTransfer?.setDragImage( blankCanvas, 0, 0);
                    blankCanvas.width = 1;
                    blankCanvas.height = 1;
                    blankCanvas.zIndex = 0;
                    document.body?.appendChild( blankCanvas);
                  }}
                  onDrag={(e) => {
                    if (e.clientX < 500) {
                      if (e.clientX > 150) {
                        setSidebarWidth(e.clientX);
                      } else if (e.clientX > 0){
                        setSidebarWidth(0);
                      }
                    }
                  }} 
                  onDragEnd={(e) => {
                    if (e.clientX < 500) {
                      if (e.clientX > 150) {
                        setSidebarWidth(e.clientX);
                        localStorage.setItem('sidebarWidth', e.clientX.toString());
                      } else {
                        setSidebarWidth(0);
                        localStorage.setItem('sidebarWidth', '0');
                      }
                    }

                    const blankCanvas: any = document.querySelector('canvas');
                    blankCanvas?.parentNode?.removeChild(blankCanvas);
                  }}
                  orientation="vertical" 
                  className="h-8 w-1 rounded hover:bg-cyan-500 hover:cursor-col-resize active:bg-teal-500 active:animate-pulse"
                />
              </div>
            </div>
            <div 
              className="pl-2 pr-4 py-4 flex flex-col items-center justify-start gap-4"
              style={{width: `calc(100% - ${sidebarWidth}px)`, height: window.innerHeight - 50}}
            >
              <MainWindow tabs={tabs} removeTab={removeTab} addTransactionDigest={addTransactionDigest} />
              {
                error !== '' &&
                <div className="flex flex-row items-center justify-start gap-1 w-full">
                  <div>
                    <PanelRightClose strokeWidth={1.25} className="w-4 h-4 hover:cursor-pointer" onClick={clearError} />
                  </div>
                  <ScrollArea className="w-full h-fit max-h-[300px] border rounded-xl shadow shadow-teal-400/75 ps-4 py-2" style={{"lineHeight": .5}}>
                    <Ansi className='whitespace-pre text-xs font-mono'>
                      {'\x1b[38;5;245m'.concat(error.replaceAll('[1m', '[38;5;245m').replaceAll('[38;5;9m', '[38;5;124m').replaceAll('[31m', '[38;5;124m').replaceAll('[34m', '[38;5;73m'))}
                    </Ansi>
                  </ScrollArea>
                </div>
              }
              {
                objectDigests.length > 0 &&
                <div className="w-full h-[800px] flex flex-row items-center justify-start gap-1">
                  <div>
                    <PanelRightClose strokeWidth={1.25} className="w-4 h-4 hover:cursor-pointer" onClick={() => {
                      setObjectDigests([]);
                    }} />
                  </div>
                  <div className="w-full h-full border rounded-xl shadow shadow-teal-400/75 flex flex-row items-center justify-start px-4 gap-4 overflow-x-auto">
                    {
                      objectDigests.map((objectDigest, index) => {
                        return (
                          <ObjectCard key={index} objectId={objectDigest.digestId} name={objectDigest.name} removeObject={(objectId: string) => {
                            const newObjectDigests = objectDigests.filter((objectDigest) => objectDigest.digestId !== objectId);
                            setObjectDigests(newObjectDigests);
                          }} />
                        )
                      })
                    }
                  </div >
                </div>
              }
            </div>
          </div>
        }
      </div>
    )
  }
}