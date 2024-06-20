"use client";

import TypographyH2 from "@/components/TypographyH2";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletSelector from "@/components/walletSelector";
import { cn } from "@/lib/utils";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import Ansi from "ansi-to-react";
import { PanelRightClose } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import ObjectCard from "./ObjectCard";
import MainWindow from "./mainWindow";
import Sidebar from "./sidebar";

import { BuildContext } from "@/Contexts/BuildProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AddProjectCard from "./addProjectCard";
import UploadProjectCard from "./uploadProjectCard";

export default function BuildPage() {
  const {
    projectList,
    objectDigests,
    selectedProjectName,
    setObjectDigests,
    setSelectedProjectName,
  } = useContext(BuildContext);

  const [open, setOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const [error, setError] = useState<string>("");
  useEffect(() => {
    console.log("error", error);
  }, [error]);

  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  useEffect(() => {
    // retrieve sidebar width from local storage
    const sidebarWidth = localStorage.getItem("sidebarWidth");
    if (sidebarWidth) {
      setSidebarWidth(parseInt(sidebarWidth));
    }
  }, []);

  const clearError = () => {
    setError("");
  };

  if (typeof window !== "undefined") {
    return (
      <div className="h-screen w-full max-w-screen flex flex-col items-center dark:bg-slate-950 overflow-hidden">
        <div className="flex w-full flex-row justify-between items-center my-2 px-3">
          <a href="/">
            <span className="text-4xl font-medium tracking-tighter hover:bg-gradient-to-r hover:from-yellow-300 hover:to-amber-500 hover:text-transparent hover:bg-clip-text transition-shadow hover:animate-pulse ">
              Move Studio
            </span>
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
                    <CommandInput
                      placeholder="Search project..."
                      className="h-9 caret-teal-500"
                    />
                    <CommandGroup>
                      {projectList.map((projectName) => {
                        console.log("projectName", projectName);
                        return (
                          <CommandItem
                            key={projectName.name}
                            onSelect={() => {
                              console.log("newName", projectName);
                              setSelectedProjectName(
                                projectName.name === selectedProjectName
                                  ? ""
                                  : projectName.name
                              );
                              setOpen(false);
                            }}
                          >
                            {projectName.name}
                            <CheckIcon
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedProjectName === projectName.name
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            }
            <Dialog>
              <DialogTrigger>
                <Button
                  className="p-3 hover:text-teal-500 active:scale-90 transition-transform"
                  variant="secondary"
                >
                  New project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-transparent border-none max-w-[400px]">
                <Tabs defaultValue="create">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="create">New</TabsTrigger>
                    <TabsTrigger value="upload">System</TabsTrigger>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <TabsTrigger value="github" disabled>
                            GitHub
                          </TabsTrigger>
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
        {showSidebar && (
          <div className="grow w-full flex flex-row items-center justify-start">
            <div
              className={`h-full flex flex-row items-center justify-end min-w-[15px] py-4 pl-4 gap-2`}
              style={{ width: `${sidebarWidth}px` }}
            >
              {sidebarWidth > 0 && <Sidebar setError={setError} />}
              <div className="h-full flex flex-row items-center justify-center">
                <Separator
                  draggable
                  onDragStart={(e) => {
                    const blankCanvas: any = document.createElement("canvas");
                    e.dataTransfer?.setDragImage(blankCanvas, 0, 0);
                    blankCanvas.width = 1;
                    blankCanvas.height = 1;
                    blankCanvas.zIndex = 0;
                    document.body?.appendChild(blankCanvas);
                  }}
                  onDrag={(e) => {
                    if (e.clientX < 500) {
                      if (e.clientX > 150) {
                        setSidebarWidth(e.clientX);
                      } else if (e.clientX > 0) {
                        setSidebarWidth(0);
                      }
                    }
                  }}
                  onDragEnd={(e) => {
                    if (e.clientX < 500) {
                      if (e.clientX > 150) {
                        setSidebarWidth(e.clientX);
                        localStorage.setItem(
                          "sidebarWidth",
                          e.clientX.toString()
                        );
                      } else {
                        setSidebarWidth(0);
                        localStorage.setItem("sidebarWidth", "0");
                      }
                    }

                    const blankCanvas: any = document.querySelector("canvas");
                    blankCanvas?.parentNode?.removeChild(blankCanvas);
                  }}
                  orientation="vertical"
                  className="h-8 w-1 rounded hover:bg-cyan-500 hover:cursor-col-resize active:bg-teal-500 active:animate-pulse"
                />
              </div>
            </div>
            <div
              className="pl-2 pr-4 py-4 flex flex-col items-center justify-start gap-4"
              style={{
                width: `calc(100% - ${sidebarWidth}px)`,
                height: window.innerHeight - 50,
              }}
            >
              <MainWindow />
              {error !== "" && (
                <div className="flex flex-row items-center justify-start gap-1 w-full">
                  <div>
                    <PanelRightClose
                      strokeWidth={1.25}
                      className="w-4 h-4 hover:cursor-pointer"
                      onClick={clearError}
                    />
                  </div>
                  <ScrollArea
                    className="w-full h-fit max-h-[300px] border rounded-xl ps-4 py-2 overflow-x-hidden overflow-y-auto"
                    style={{ lineHeight: 0.5 }}
                  >
                    <Ansi className="whitespace-pre text-xs font-mono">
                      {"\x1b[38;5;245m".concat(
                        error
                          .replaceAll("[1m", "[38;5;245m")
                          .replaceAll("[38;5;9m", "[38;5;124m")
                          .replaceAll("[31m", "[38;5;124m")
                          .replaceAll("[34m", "[38;5;73m")
                      )}
                    </Ansi>
                  </ScrollArea>
                </div>
              )}
              {objectDigests.length > 0 && (
                <div className="w-full h-[800px] flex flex-row items-center justify-start gap-1">
                  <div>
                    <PanelRightClose
                      strokeWidth={1.25}
                      className="w-4 h-4 hover:cursor-pointer"
                      onClick={() => {
                        setObjectDigests([]);
                      }}
                    />
                  </div>
                  <div className="w-full h-full border rounded-xl flex flex-row items-center justify-start px-4 gap-4 overflow-x-auto">
                    {objectDigests.map((objectDigest, index) => {
                      return (
                        <ObjectCard
                          key={index}
                          objectId={objectDigest.digestId}
                          name={objectDigest.name}
                          removeObject={(objectId: string) => {
                            const newObjectDigests = objectDigests.filter(
                              (objectDigest) =>
                                objectDigest.digestId !== objectId
                            );
                            setObjectDigests(newObjectDigests);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
