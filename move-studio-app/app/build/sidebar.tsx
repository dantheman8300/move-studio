
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
import { useState } from "react";
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

export default function Sidebar() {

  const [projectList, setProjectList] = useState([]);
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

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
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center">
                  <FileBox className="mr-2 w-4 h-4"/>
                  suip_stakes.move
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
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center">
                  <FolderClosed className="mr-2 w-4 h-4"/>
                  tests
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
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center">
                  <FolderOpen className="mr-2 w-4 h-4"/>
                  sources
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
            <div className="pl-2 w-full font-mono flex flex-row justify-start gap-2 items-center">
              <Separator className="h-24 border" orientation="vertical" />
              <div>
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center">
                      <FileBox className="mr-2 w-4 h-4"/>
                      suip_stakes.move
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
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center">
                      <FileBox className="mr-2 w-4 h-4"/>
                      suip_stakes.move
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
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center">
                      <FileBox className="mr-2 w-4 h-4"/>
                      suip_stakes.move
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
              </div>
            </div>
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="px-1 w-full h-8 font-mono flex flex-row justify-start hover:bg-accent hover:text-accent-foreground rounded items-center">
                  <FileCog className="mr-2 w-4 h-4"/>
                  move.toml
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