import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@suiet/wallet-kit";
import { set } from "date-fns";
import { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import FunctionCard from "../deploy/FunctionCard";
import { Cross2Icon } from "@radix-ui/react-icons";
import StructCard from "../deploy/StructCard";
import { ScrollArea } from "@/components/ui/scroll-area";



export default function PackageWindow(
  props: {
    package: {name: string, digestId: string}
  }
) {
  const wallet = useWallet();

  const [searchedModule, setSearchedModule] = useState<string>('');
  const [searchedStruct, setSearchedStruct] = useState<string>('');
  const [searchedFunction, setSearchedFunction] = useState<string>('');
  
  const [packageDetails, setPackageDetails] = useState<any>(undefined);
  const [selectedModule, setSelectedModule] = useState<string>('');

  useEffect(() => {
    getAllPackageDetails();
  }, [props.package])

  const getAllPackageDetails = async () => {
    const packageDetails = await getPackageDetails(props.package)
    setPackageDetails(packageDetails);
  }

  const getPackageDetails = async (packageToFetch: {name: string, digestId: string}) => {
    const response = await fetch(
      'http://localhost:80/package-details',
      {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({packageId: packageToFetch.digestId, rpc: wallet.chain?.rpcUrl || ''})
      }
    );

    const data = await response.json();

    return {name: packageToFetch.name, data: data}
  }

  if (packageDetails !== undefined) {
    return (
      <div className="w-full h-full flex flex-row items-start justify-around p-2 gap-2">
        <div className="flex flex-col items-center justify-start gap-2">
          <Input 
            className="bg-slate-900 h-8" 
            type="text" 
            placeholder="Search modules..." 
            onChange={(e) => {setSearchedModule(e.target.value)}}
            value={searchedModule}
          />
          <ScrollArea className="max-h-96 w-56 rounded-md border">
            {
              Object.values(packageDetails.data).filter((module: any) => {
                return (module.name as string).toLowerCase().includes(searchedModule.toLowerCase())
              }).length == 0 &&
              <div className="w-full h-full flex flex-row items-center justify-center">
                <span className="font-mono py-2">
                  No modules found
                </span>
              </div>
            }
            {
              Object.values(packageDetails.data).filter((module: any) => {
                return (module.name as string).toLowerCase().includes(searchedModule.toLowerCase())
              }).map((module: any) => {
                return (
                  <div className="flex flex-row items-center justify-start gap-2">
                    <Button 
                      className="font-mono w-full h-8 flex flex-row justify-start" 
                      variant="ghost"
                      onClick={() => {setSelectedModule(module.name)}}
                    >
                      {module.name}
                    </Button>
                  </div>
                )
              })
            }
          </ScrollArea>
        </div>
        <div className="flex flex-col items-center justify-start h-full w-full max-w-[350px]">
          <Input 
            className="w-full max-w-80 bg-slate-900 h-8" 
            type="text" 
            placeholder="Search structs..." 
            onChange={(e) => {setSearchedStruct(e.target.value)}}
            value={searchedStruct}
          />
          {
            selectedModule != '' &&
            <Accordion type="multiple" className="w-full max-w-80 overflow-y-auto">
              {
                packageDetails.data[selectedModule] != undefined &&
                Object.keys(packageDetails.data[selectedModule].structs).filter((structName: string) => {
                  return structName.toLowerCase().includes(searchedStruct.toLowerCase())
                }).length == 0 &&
                <div className="flex flex-row items-center justify-center w-full h-full">
                  <span className="font-mono text-white text-xl">
                    No structs found
                  </span>
                </div>
              }
              {
                packageDetails.data[selectedModule] != undefined &&
                Object.keys(packageDetails.data[selectedModule].structs).filter((structName: string) => {
                  return structName.toLowerCase().includes(searchedStruct.toLowerCase())
                }).map((structName: any, index: number) => {
                  const structData = packageDetails.data[selectedModule].structs[structName];
                  return (
                    <AccordionItem value={index.toString()} className="my-2 px-2 w-full border rounded-lg overflow-hidden">
                      <AccordionTrigger className="w-full font-mono">{structName}</AccordionTrigger>
                      <AccordionContent className="w-full">
                        <StructCard data={structData} />
                      </AccordionContent>
                    </AccordionItem>
                  )
                })
              }
            </Accordion>
          }
        </div>
        <div className="flex flex-col items-center justify-start h-full overflow-y-auto w-full max-w-[350px]">
          <Input 
            className="bg-slate-900 h-8 w-full max-w-80" 
            type="text" 
            placeholder="Search modules..."
            onChange={(e) => {setSearchedFunction(e.target.value)}}
            value={searchedFunction}
          />
          {
            selectedModule != '' &&
            <Accordion type="multiple" className="w-full max-w-80 overflow-y-auto">
              {
                packageDetails.data[selectedModule] != undefined &&
                (
                  Object.values(packageDetails.data[selectedModule].exposedFunctions).filter((functionData: any) => functionData.isEntry).length == 0 ||
                  Object.keys(packageDetails.data[selectedModule].exposedFunctions).filter((functionName: string) => {
                    return functionName.toLowerCase().includes(searchedFunction.toLowerCase())
                  }).length == 0
                ) && 
                <div className="flex flex-row items-center justify-center w-full h-full">
                  <span className="font-mono text-white text-xl">
                    No entry functions found
                  </span>
                </div>
              }
              {
                packageDetails.data[selectedModule] != undefined &&
                Object.values(packageDetails.data[selectedModule].exposedFunctions).filter((functionData: any) => functionData.isEntry).length > 0 &&
                Object.keys(packageDetails.data[selectedModule].exposedFunctions).filter((functionName: string) => {
                  return functionName.toLowerCase().includes(searchedFunction.toLowerCase())
                }).map((functionName: any, index: number) => {
                  const functionData = packageDetails.data[selectedModule].exposedFunctions[functionName];
                  console.log('functionData', functionData)
                  if (functionData.isEntry) {
                    return (
                      <AccordionItem value={index.toString()} className="my-2 px-2 w-full border rounded-lg overflow-hidden font-mono">
                        <AccordionTrigger className="w-full">{functionName}</AccordionTrigger>
                        <AccordionContent className="w-full">
                          <FunctionCard data={functionData} address={packageDetails.data[selectedModule].address} moduleName={selectedModule} functionName={functionName} />
                        </AccordionContent>
                      </AccordionItem>
                    )
                  }
                })
              }
            </Accordion>
          }
        </div>
      </div> 
    )
  } else {
    <div className="w-full h-full flex flex-row items-start justify-around p-2 gap-2">
      Loading...
    </div>
  }
  
}