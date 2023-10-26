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
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { set } from "date-fns";

import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import Deployer from "./Deployer";
import ObjectCard from "../build/ObjectCard";
import PackageCard from "./PackageCard";
import PackageWindow from "../build/PackageWindow";

const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export default function DeployPage () {

  const [packageDigests, setPackageDigests] = useState<{digestId: string, name: string}[]>([]);
  const [objectDigests, setObjectDigests] = useState<{digestId: string, name: string}[]>([]);

  useEffect(() => {
    setPackageDigests(
      [
        {
          name: 'Sui core', 
          digestId: '0x02'
        }
      ]
    )
  }, [])

  const addToDigests = (newDigests: {digestId: string, type: 'package' | 'object', name: string}[]) => {

    const newPackageDigests = newDigests.filter((newDigest) => newDigest.type === 'package');
    const newObjectDigests = newDigests.filter((newDigest) => newDigest.type === 'object');

    setPackageDigests([...packageDigests, ...newPackageDigests]);
    setObjectDigests([...objectDigests, ...newObjectDigests]);
  }
  
  return (
    <div className="h-screen w-full max-w-screen flex flex-col items-center dark:bg-slate-950">
      <div className="flex w-full lg:flex-row flex-col justify-between items-center my-2 px-3">
        <TypographyH2>Move Studio</TypographyH2>
        <div className="flex flex-row justify-around gap-2">
          <WalletSelector isTxnInProgress={false} />
        </div>
      </div>
      <div className="flex w-full lg:flex-row flex-col justify-start items-center my-2 px-3">
        <div className="ps-16 flex flex-row gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button className="h-8">
                Deploy
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flew flex-row items-center justify-center border">
              <Deployer addToDigests={addToDigests} />
            </PopoverContent>
          </Popover>
          {/* <Sheet>
            <SheetTrigger asChild>
              <Button variant='secondary'>
                Add package
              </Button>
            </SheetTrigger>
            <SheetContent side='left'>
              <SheetHeader>
                <SheetTitle>Are you sure absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='secondary'>
                Add txn
              </Button>
            </SheetTrigger>
            <SheetContent side='left'>
              <SheetHeader>
                <SheetTitle>Are you sure absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet> */}
        </div>
      </div>
      <div className="grow w-full flex flex-col justify-start items-start gap-2 p-2">
        <div className="border w-full h-fit rounded-lg overflow-hidden">
          {
            packageDigests.length > 0 &&
            <PackageWindow packages={packageDigests} />
          }
        </div>
        <div className="border w-full grow rounded-lg overflow-hidden">

        </div>
        {/* {
          digests.map((digest, index) => {
            if (digest.type === 'package') {
              return (
                <PackageCard key={index} digest={digest.digestId} />
              )
            } else {
              return (
                <ObjectCard key={index} digest={digest.digestId} />
              )
            }
          })
        } */}
      </div>
    </div>
  )
}