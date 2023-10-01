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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
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
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { set } from "date-fns";

const demoCode = `module demoPackage::party {

  // Libraries being used
  use sui::object::{Self, UID};
  use sui::transfer;
  use sui::tx_context::TxContext;

  // Object that can be deployed
  struct Balloon has key {
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
      content: `test toml`
    }
  ]
}

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

export default function BuildPage () {

  const [projectList, setProjectList] = useState<string[]>([]);
  const [open, setOpen] = useState(false)
  const [selectedProjectName, setSelectedProjectName] = useState("")

  const [showSidebar, setShowSidebar] = useState(true);

  const [tabs, setTabs] = useState<{path: string; name: string;}[]>([])
  const [activeTab, setActiveTab] = useState<string>('')
  const [code, setCode] = useState<string>('')

  let indexedDb: IndexedDb;
  useEffect(() => {
    const startIndexDb = async () => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'name'});
      
      const existingUser = localStorage.getItem('user');
      console.log('existingUser', existingUser);
      if (true) {
        console.log('setting user');
        localStorage.setItem('user', 'true');
        await indexedDb.putValue('projects', demoPackage); 
        // startTutorial();
      }
         
    }
    getProjects();
  }, []);

  useEffect(() => {
    console.log('activeTab', activeTab);
    if (activeTab !== '') {
      const tab = tabs.find(tab => tab.path === activeTab);
      if (tab) {
        console.log('activeTab', tab)
        const forks = tab.path.split('/').slice(1);
        console.log('forks', forks)
        let dir = demoPackage.files;
        while (forks.length > 1) {
          let fork = forks.shift();
          console.log('fork', fork)
          const searchedDir = dir.find(file => file.name === fork);
          if (searchedDir == undefined) {
            console.log('searchedDir', searchedDir)
            break;
          }
          dir = searchedDir.children || [];
        }
        const file = dir.find(file => file.name === tab.name);

        if (file) {
          console.log('file', file);
          setCode(file.content || '');
        }
      }
    }
  }, [activeTab])

  const getProjects = async () => {
    indexedDb = new IndexedDb('test');
    await indexedDb.createObjectStore(['projects'], {keyPath: 'name'});
    const allProjects = await indexedDb.getAllKeys('projects');
    console.log('projectList', allProjects);
    setProjectList(allProjects);
  }

  const addTab = (path: string, name: string) => {
    const isAlreadyTab = tabs.find(tab => tab.path === path);
    if (!isAlreadyTab) {
      setTabs([...tabs, {path, name}])
      setActiveTab(path);
    }
  }

  const removeTab = (path: string) => {
    const newTabs = tabs.filter(tab => tab.path !== path);
    setTabs(newTabs);
    if (activeTab === path) {
      setActiveTab('');
      setCode('');
    }
  }

  const updateCode = async (code: string) => {
    setCode(code);
    const tab = tabs.find(tab => tab.path === activeTab);
    if (tab) {
      const forks = tab.path.split('/').slice(1);
      let dir = demoPackage.files;
      while (forks.length > 1) {
        let fork = forks.shift();
        const searchedDir = dir.find(file => file.name === fork);
        if (searchedDir == undefined) {
          break;
        }
        dir = searchedDir.children || [];
      }
      const file = dir.find(file => file.name === tab.name);
      if (file) {
        file.content = code;
        console.log('file', file);
        indexedDb = new IndexedDb('test');
        await indexedDb.createObjectStore(['projects'], {keyPath: 'name'});
        await indexedDb.putValue('projects', demoPackage);
      }
    }
  }
  
  return (
    <div className="h-screen w-full max-w-screen flex flex-col items-center dark:bg-slate-950">
      <div className="flex w-full lg:flex-row flex-col justify-between items-center my-2 px-3">
        <div>
          {
            showSidebar && 
            <PanelLeftClose 
              onClick={() => {
                setShowSidebar(false);
              }}
            />
          }
          {
            !showSidebar && 
            <PanelLeftOpen 
              onClick={() => {
                setShowSidebar(true);
              }}
            />
          }
        </div>
        <TypographyH2>Move Studio</TypographyH2>
        <div className="flex flex-row justify-around gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {selectedProjectName
                  ? selectedProjectName
                  : "Select project..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search project..." className="h-9" />
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {projectList.map((projectName) => {
                    console.log('projectName', projectName)
                    return (
                      <CommandItem
                        key={projectName}
                        onSelect={() => {
                          console.log('newName', projectName)
                          setSelectedProjectName(projectName === selectedProjectName ? "" : projectName)
                          setOpen(false)
                        }}
                      >
                        {projectName}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedProjectName === projectName ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Sheet>
            <SheetTrigger>
              <Avatar>
                <AvatarImage src="https://avatars.githubusercontent.com/u/71237296?v=4" />
                <AvatarFallback>Dan</AvatarFallback>
              </Avatar>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <div className="flex flex-row items-center justify-start">
                  <Avatar>
                    <AvatarImage src="https://avatars.githubusercontent.com/u/71237296?v=4" />
                    <AvatarFallback>Dan</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col ml-2">
                    <div>DanTheMan8300</div>
                    <div>Dan</div>
                  </div>
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          {/* <WalletSelector isTxnInProgress={false} /> */}
        </div>
      </div>
      {
        selectedProjectName != '' &&
        showSidebar &&
        <div className="grow w-full flex flex-row items-center justify-center">
          <div className="w-60 h-full">
            <Sidebar 
              addTab={addTab}
              selectProjectName={selectedProjectName} 
            />
          </div>
          {/* <Separator 
            orientation="vertical" 
            className="h-8 w-1 rounded hover:cursor-col-resize"
            onDrag={() => {
              // Resize the sidebar based on the dragging of the separator
              console.log('dragging');
              
            }} 
          /> */}
          <div className="grow h-full p-2">
            <CodeEditor 
              code={code}
              setCode={updateCode}
              tabs={tabs}
              activeTab={activeTab}
              removeTab={removeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      }
      {
        selectedProjectName != '' &&
        !showSidebar && 
        <div className="grow w-full flex flex-row items-center justify-center p-2">
          <CodeEditor 
            code={code}
            setCode={updateCode}
            tabs={tabs}
            activeTab={activeTab}
            removeTab={removeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      }
    </div>
  )
}