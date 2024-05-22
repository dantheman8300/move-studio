import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@suiet/wallet-kit";
import { set } from "date-fns";
import { useEffect, useState } from "react";
import { CubeSpinner, GuardSpinner } from "react-spinners-kit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import FunctionCard from "./FunctionCard";
import { Cross2Icon } from "@radix-ui/react-icons";
import StructCard from "./StructCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
 
export default function PackageWindow(
  props: {
    removeMe: () => void,
    package: {name: string, digestId: string}, 
    addTransactionDigest: (digestId: string, objects: {type: string, modified: string, objectId: string}[]) => void,
  }
) {
  const wallet = useWallet();

  const [searchedModule, setSearchedModule] = useState<string>('');
  const [searchedStruct, setSearchedStruct] = useState<string>('');
  const [searchedFunction, setSearchedFunction] = useState<string>('');
  
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');

  useEffect(() => {
    getAllPackageDetails();
  }, [props.package])

  const getAllPackageDetails = async () => {
    const packageDetails = await getPackageDetails(props.package)
    setPackageDetails(packageDetails);
  }

  const getPackageDetails = async (packageToFetch: {name: string, digestId: string}) => {

    // create a client connected to devnet
    const client = new SuiClient({ url: wallet.chain?.rpcUrl || '' });

    console.log('client', client)

    try {
      // get the package details
      const res = await client.getNormalizedMoveModulesByPackage({
        package: packageToFetch.digestId,
      });
      console.log('package res', res)

      return {name: packageToFetch.name, data: res}
    } catch (e) {
      console.log('error', e)
      alert('Error fetching package details')
      props.removeMe()
      return null;
    }

    
  }

  if (packageDetails == null) {
    return (
      <div className="w-full h-full flex flex-row items-center justify-center gap-1">
        {/* <Loader2 className="w-8 h-8 animate-spin" /> */}
        <GuardSpinner backColor="#f59e0b" />
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-row items-start justify-around p-2 gap-2">
      <div className="flex flex-col items-center justify-start gap-2">
        <Input 
          className="bg-slate-900 h-8 caret-teal-500" 
          type="text" 
          placeholder="Search modules..." 
          onChange={(e) => {setSearchedModule(e.target.value)}}
          value={searchedModule}
        />
        <ScrollArea className="h-full max-h-[400px] w-fit max-w-[260px] rounded-md border p-1 overflow-y-auto">
          {
            Object.values(packageDetails.data).filter((module: any) => {
              return (module.name as string).toLowerCase().includes(searchedModule.toLowerCase())
            }).length == 0 &&
            <div className="w-full h-full flex flex-row items-center justify-center">
              <span className="font-mono py-2 antialiased">
                No modules found
              </span>
            </div>
          }
          {
            Object.values(packageDetails.data).filter((module: any) => {
              return (module.name as string).toLowerCase().includes(searchedModule.toLowerCase())
            }).map((module: any, index) => {
              return (
                <div key={index} className="flex w-fit max-w-[250px] flex-row items-start justify-start gap-2">
                  <Button 
                    className={
                      "font-mono w-fit h-8 flex flex-row justify-start antialiased hover:text-teal-500 bg-slate-950 hover:bg-slate-950 active:scale-y-75 transition-transform" +
                      (selectedModule == module.name ? ' text-teal-500' : ' text-white')
                    } 
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
          className="w-full max-w-80 bg-slate-900 h-8 caret-teal-500" 
          type="text" 
          placeholder="Search structs..." 
          onChange={(e) => {setSearchedStruct(e.target.value)}}
          value={searchedStruct}
        />
        {
          selectedModule != '' &&
          <Accordion type="multiple" className="w-full max-w-80 h-full max-h-[400px] overflow-y-auto">
            {
              packageDetails.data[selectedModule] != null &&
              Object.keys(packageDetails.data[selectedModule].structs).filter((structName: string) => {
                return structName.toLowerCase().includes(searchedStruct.toLowerCase())
              }).length == 0 &&
              <div className="flex flex-row items-center justify-center w-full h-full">
                <span className="font-mono text-white text-xl pt-4 antialiased">
                  No structs found
                </span>
              </div>
            }
            {
              packageDetails.data[selectedModule] != null &&
              Object.keys(packageDetails.data[selectedModule].structs).filter((structName: string) => {
                return structName.toLowerCase().includes(searchedStruct.toLowerCase())
              }).map((structName: any, index: number) => {
                const structData = packageDetails.data[selectedModule].structs[structName];
                return (
                  <AccordionItem key={index} value={index.toString()} className="my-2 px-2 w-full border rounded-lg overflow-hidden">
                    <AccordionTrigger className="w-full font-mono antialiased text-slate-200">{structName}</AccordionTrigger>
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
          className="bg-slate-900 h-8 w-full max-w-80 caret-teal-500" 
          type="text" 
          placeholder="Search modules..."
          onChange={(e) => {setSearchedFunction(e.target.value)}}
          value={searchedFunction}
        />
        {
          selectedModule != '' &&
          <Accordion type="multiple" className="w-full max-w-80 h-full max-h-[400px] h-fit overflow-y-auto">
            {
              packageDetails.data[selectedModule] != null &&
              (
                Object.values(packageDetails.data[selectedModule].exposedFunctions).filter((functionData: any) => functionData.isEntry).length == 0 ||
                Object.keys(packageDetails.data[selectedModule].exposedFunctions).filter((functionName: string) => {
                  return functionName.toLowerCase().includes(searchedFunction.toLowerCase())
                }).length == 0
              ) && 
              <div className="flex flex-row items-center justify-center w-full h-full">
                <span className="font-mono text-white text-xl pt-4 antialiased">
                  No entry functions found
                </span>
              </div>
            }
            {
              packageDetails.data[selectedModule] != null &&
              Object.values(packageDetails.data[selectedModule].exposedFunctions).filter((functionData: any) => functionData.isEntry).length > 0 &&
              Object.keys(packageDetails.data[selectedModule].exposedFunctions).filter((functionName: string) => {
                return functionName.toLowerCase().includes(searchedFunction.toLowerCase())
              }).map((functionName: any, index: number) => {
                const functionData = packageDetails.data[selectedModule].exposedFunctions[functionName];
                console.log('functionData', functionData)
                if (functionData.isEntry) {
                  return (
                    <AccordionItem key={index} value={index.toString()} className="my-2 px-2 w-full border rounded-lg overflow-hidden font-mono">
                      <AccordionTrigger className="w-full antialiased text-slate-200">{functionName}</AccordionTrigger>
                      <AccordionContent className="w-full">
                        <FunctionCard data={functionData} address={packageDetails.data[selectedModule].address} moduleName={selectedModule} functionName={functionName} addTransactionDigest={props.addTransactionDigest} />
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
  
}