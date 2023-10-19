import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cross2Icon } from "@radix-ui/react-icons";
import CodeEditor from "./codeEditor";
import PackageWindow from "./PackageWindow";
import { useEffect } from "react";


const mockTabs = [
  {
    type: 'code', 
    path: 'demoPackage/sources/party.move', 
    name: 'party.move'
  },
  {
    type: 'code', 
    path: 'demoPackage/move.toml', 
    name: 'move.toml'
  }, 
  {
    type: 'package', 
    digestId: '0x02',
    name: 'demoPackage'
  }
] as ({type: 'code', path: string, name: string} | {type: 'package', digestId: string, name: string})[]


export default function MainWindow(
  {tabs, removeTab}: 
  {
    tabs: ({type: 'code', path: string, name: string} | {type: 'package', digestId: string, name: string})[];
    removeTab: (type: string, identifier: string) => void;
  }
) {

  useEffect(() => {
    console.log(tabs)
  })


  return (
    <Tabs className="border rounded-xl w-full h-full overflow-hidden shadow-lg shadow-teal-400/75">
      <TabsList className="w-full h-10 rounded-none border-b items-center justify-start px-6">
        {
          tabs.map((tab, i) => {
            if (tab.type === 'code') {
              return (
                <TabsTrigger key={i} value={tab.path} className="font-mono flex flex-row items-center justify-center gap-1">
                  {tab.name}
                  <Cross2Icon 
                    className='w-4 h-4' 
                    onClick={(e) => {
                      e.preventDefault();
                      removeTab(tab.type, tab.path);
                    }} 
                  />
                </TabsTrigger>
              )
            } else if (tab.type === 'package') {
              return (
                <TabsTrigger key={i} value={tab.digestId} className="font-mono flex flex-row items-center justify-center gap-1">
                  {tab.name}
                  <Cross2Icon 
                    className='w-4 h-4' 
                    onClick={(e) => {
                      e.preventDefault();
                      removeTab(tab.type, tab.digestId);
                    }} 
                  />
                </TabsTrigger>
              )
            }
          })
        }
      </TabsList>
      <div className="h-full flex flex-col items-center justify-start">
      {
        tabs.map((tab, i) => {
          if (tab.type === 'code') {
            return (
              <TabsContent value={tab.path} className="mt-0 w-full h-full">
                <CodeEditor path={tab.path} />
              </TabsContent>
            )
          } else if (tab.type === 'package') {
            return (
              <TabsContent value={tab.digestId} className="mt-0 w-full h-full">
                <PackageWindow package={{name: tab.name, digestId: tab.digestId}} />
              </TabsContent>
            )
          }
        })
      }
      </div>
    </Tabs>
  )

}