'use client';

import ThemeToggle from "@/components/ThemeToggle";
import TypographyH2 from "@/components/TypographyH2";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import WalletSelector from "@/components/walletSelector";
import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useState } from "react";
import { IndexedDb } from "../db/ProjectsDB";
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

  const [projectList, setProjectList] = useState([]);
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const [showSidebar, setShowSidebar] = useState(true);

  let indexedDb: IndexedDb;
  useEffect(() => {
    const startIndexDb = async () => {
      indexedDb = new IndexedDb('test');
      await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
      
      const existingUser = localStorage.getItem('user');
      console.log('existingUser', existingUser);
      if (!existingUser) {
        console.log('setting user');
        localStorage.setItem('user', 'true');
        await indexedDb.putValue('projects', {
          package: 'demoPackage',
          dependencies: [
            {name: 'demoPackage', address: '0x0'},
            {name: 'Sui', address: '0x02'}
          ],
          modules: [
            {
              name: 'party', 
              code: `module demoPackage::party {

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
            }
          ]
        }); 
        // startTutorial();
      }
         
    }
    startIndexDb().then(() => {
      getProjects();
    });
  }, []);

  const getProjects = async () => {
    indexedDb = new IndexedDb('test');
    await indexedDb.createObjectStore(['projects'], {keyPath: 'package'});
    const allProjects = await indexedDb.getAllKeys('projects');
    console.log('projectList', allProjects);
    setProjectList(allProjects);
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
                {value
                  ? frameworks.find((framework) => framework.value === value)?.label
                  : "Select project..."}
                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search project..." className="h-9" />
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {frameworks.map((framework) => (
                    <CommandItem
                      key={framework.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      {framework.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === framework.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
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
        showSidebar &&
        <div className="grow w-full flex flex-row items-center justify-center">
          <div className="w-60 h-full">
            <Sidebar />
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
            <CodeEditor />
          </div>
        </div>
      }
      {
        !showSidebar && 
        <div className="grow w-full flex flex-row items-center justify-center p-2">
          <CodeEditor />
        </div>
      }
    </div>
  )
}