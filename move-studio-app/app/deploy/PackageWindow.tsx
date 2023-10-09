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
import FunctionCard from "./FunctionCard";
import { Cross2Icon } from "@radix-ui/react-icons";
import StructCard from "./StructCard";



export default function PackageWindow(
  props: {
    packages: {name: string, digestId: string}[]
  }
) {

  
  const wallet = useWallet();
  
  const [packageDetails, setPackageDetails] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<{[value:string]: any} | undefined>(undefined);

  const [selectedModule, setSelectedModule] = useState<string>('');

  useEffect(() => {
    getAllPackageDetails();
  }, [props.packages])

  useEffect(() => {
    console.log('packageDetails', packageDetails)
    console.log('activeTab', activeTab)
  }, [packageDetails, activeTab])

  const getAllPackageDetails = async () => {
    const packageDetails = await Promise.all(props.packages.map((packageToFetch) => getPackageDetails(packageToFetch)));
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

  const removeTab = (packageId: string) => {
    const newPackageDetails = packageDetails.filter((packageDetail) => packageDetail.packageId !== packageId);
    setSelectedModule('');
    setActiveTab(undefined);
    setPackageDetails(newPackageDetails);
  }

  if (packageDetails.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <span className="font-mono text-white text-xl">
          Loading...
        </span>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Tabs 
        className='w-full'
        activationMode='manual'
      >
        <TabsList className='w-full pl-6 justify-start rounded-none bg-slate-900'>
          {
            packageDetails.map((packageDetails: any) => {
              return (
                <TabsTrigger 
                  key={packageDetails.packageId}
                  data-state={activeTab?.name === packageDetails.name ? 'active' : 'inactive'}
                  value={packageDetails.packageId} 
                  className='font-mono flex flex-row items-center justify-center gap-1'
                  onClick={() => {
                    setActiveTab(packageDetails)
                  }}
                >
                  {packageDetails.name}
                  <Cross2Icon 
                    className='w-3 h-3 ml-2' 
                    onClick={(e) => {
                      e.preventDefault();
                      removeTab(packageDetails.packageId);
                    }} 
                  />
                </TabsTrigger>
              )
            })
          }
        </TabsList>
      </Tabs>
      <Separator />
      {
        activeTab != undefined && 
        <div className="w-full h-full flex flex-row items-start justify-around p-2 gap-2">
          <div className="h-full flex flex-col items-center justify-start w-56 gap-2">
            <Input className="bg-slate-900 h-8" type="text" placeholder="Search modules..." />
            <div className="w-full h-96 p-1 border rounded-lg overflow-y-auto">
              {
                activeTab.data != undefined &&
                Object.values(activeTab.data).map((module: any) => {
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
            </div>
          </div>
          {/* <Separator orientation="vertical" /> */}
          <div className="flex flex-col items-center justify-start w-96">
            <Input className="bg-slate-900 h-8" type="text" placeholder="Search modules..." />
            {
              selectedModule != '' &&
              <Accordion type="multiple" className="w-80 h-96 overflow-y-auto">
                {
                  activeTab.data[selectedModule] != undefined &&
                  Object.values(activeTab.data[selectedModule].structs).length == 0 &&
                  <div className="flex flex-row items-center justify-center w-full h-full">
                    <span className="font-mono text-white text-xl">
                      No structs found
                    </span>
                  </div>
                }
                {
                  activeTab.data[selectedModule] != undefined &&
                  Object.keys(activeTab.data[selectedModule].structs).map((structName: any, index: number) => {
                    const structData = activeTab.data[selectedModule].structs[structName];
                    return (
                      <AccordionItem value={index.toString()} className="my-2 px-2 w-full bg-[#011627] rounded-lg overflow-hidden">
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
          {/* <Separator orientation="vertical" /> */}
          <div className="flex flex-col items-center justify-start w-96 h-full overflow-y-auto">
            <Input className="bg-slate-900 h-8" type="text" placeholder="Search modules..." />
            {
              selectedModule != '' &&
              <Accordion type="multiple" className="w-80 h-96 overflow-y-auto">
                {
                  activeTab.data[selectedModule] != undefined &&
                  Object.values(activeTab.data[selectedModule].exposedFunctions).filter((functionData: any) => functionData.isEntry).length == 0 &&
                  <div className="flex flex-row items-center justify-center w-full h-full">
                    <span className="font-mono text-white text-xl">
                      No entry functions found
                    </span>
                  </div>
                }
                {
                  activeTab.data[selectedModule] != undefined &&
                  Object.values(activeTab.data[selectedModule].exposedFunctions).filter((functionData: any) => functionData.isEntry).length > 0 &&
                  Object.keys(activeTab.data[selectedModule].exposedFunctions).map((functionName: any, index: number) => {
                    const functionData = activeTab.data[selectedModule].exposedFunctions[functionName];
                    console.log('functionData', functionData)
                    if (functionData.isEntry) {
                      return (
                        <AccordionItem value={index.toString()} className="my-2 px-2 w-full bg-[#011627] rounded-lg overflow-hidden font-mono">
                          <AccordionTrigger className="w-full">{functionName}</AccordionTrigger>
                          <AccordionContent className="w-full">
                            <FunctionCard data={functionData} />
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
      }
    </div>
  )
}