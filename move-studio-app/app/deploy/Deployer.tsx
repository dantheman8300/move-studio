import TypographyH2 from "@/components/TypographyH2";
import { db } from "../db/db";
import { useLiveQuery } from "dexie-react-hooks";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { TransactionBlock } from '@mysten/sui.js/transactions';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui.js/faucet';
import { useAccountBalance, useWallet } from "@suiet/wallet-kit";

import { toast, useToast } from "@/components/ui/use-toast";
import { ExternalLink, GaugeCircle, PackageCheck, PackageX } from "lucide-react";

export default function Deployer(
  props: {
    addToDigests: (newDigests: {digestId: string, type: 'package' | 'object', name: string}[]) => void
  }
) {

  const wallet = useWallet();
  const { error, loading, balance } = useAccountBalance();

  const { toast } = useToast();

  const projectList = useLiveQuery(() => db.projects.toArray()) || [];

  const [selectedProjectName, setSelectedProjectName] = useState<string>('');
  const [createdObjects, setCreatedObjects] = useState<string[]>([]);
  const [publishedModules, setPublishedModules] = useState<string[]>([]);

  const compileProject = async (): Promise<{modules: string[], dependencies: string[], digest: number[]}> => {

    const currentProject = await db.projects.get(selectedProjectName);

    toast({
      description: <div className="flex flex-row gap-2 items-center justify-start">
        <GaugeCircle className="w-6 h-6 animate-spin" />
        Compiling...
      </div>,
    })

    const response = await fetch(
      'http://localhost:80/compile',
      {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentProject)
      }
    );

    const data = await response.json();
    
    if (data.error) {
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageX className="w-6 h-6" />
          Project compilation failed
        </div>,
      })
      return {modules: [], dependencies: [], digest: []};
    } else {
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageCheck className="w-6 h-6" />
          Project compiled successfully
        </div>,
      })
      return data.compileResults;
    }
  }

  const deployProject = async () => {

    const compiledModulesAndDependencies = await compileProject();

    toast({
      description: <div className="flex flex-row gap-2 items-center justify-start">
        <GaugeCircle className="w-6 h-6 animate-spin" />
        Deploying...
      </div>,
    })

    console.log(compiledModulesAndDependencies)

    if (compiledModulesAndDependencies.modules.length === 0) {
      return;
    }

    const txb = new TransactionBlock();
    
    const [upgradeCap] = txb.publish({
      modules: compiledModulesAndDependencies.modules,
      dependencies: compiledModulesAndDependencies.dependencies,
    });

    txb.transferObjects([upgradeCap], txb.pure(wallet.address));

    try {
      const publishTxn = await wallet.signAndExecuteTransactionBlock({ transactionBlock: txb as any });

      console.log(publishTxn);

      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageCheck className="w-6 h-6" />
          Project deployed successfully
          <a><ExternalLink className="w-4 h-4" href={`https://suiexplorer.com/txblock/${publishTxn.digest}`} /></a>
        </div>,
      })

      console.log(publishTxn.objectChanges)

      const newDigests = [] as {digestId: string, type: 'package' | 'object', name: string}[];
      for (let objectChange of publishTxn.objectChanges || []) {
        if (objectChange.type === 'published') {
          newDigests.push({
            name: selectedProjectName,
            digestId: objectChange.packageId,
            type: 'package'
          });
        } else if (objectChange.type === 'created') {
          newDigests.push({
            name: selectedProjectName,
            digestId: objectChange.objectId,
            type: 'object'
          });
        }
      }

      console.log(newDigests)

      if (newDigests) {
        props.addToDigests(newDigests);
      }

    } catch (error) {
      console.log(error);
      toast({
        description: <div className="flex flex-row gap-2 items-center justify-start">
          <PackageX className="w-6 h-6" />
          Project deployment failed
        </div>,
      })
    }
  }

  // const checkBalanceAndRequestSui = async () => {
  //   console.log('checking balance')
  //   console.log(wallet.chain?.name)
  //   if(wallet.chain?.name === 'Sui Testnet') {
  //     console.log('testnet')
  //     if (Number(balance) < 1000000000000000) {
  //       console.log('requesting sui')
  //       toast({
  //         description: <div className="flex flex-row gap-2 items-center justify-start">
  //           <GaugeCircle className="w-6 h-6 animate-spin" />
  //           Requesting SUI...
  //         </div>,
  //       })
  //       await requestSuiFromFaucetV0({
  //         host: getFaucetHost('testnet'),
  //         recipient: wallet.address || '',
  //       });
  //       toast({
  //         description: <div className="flex flex-row gap-2 items-center justify-start">
  //           <PackageCheck className="w-6 h-6" />
  //           SUI requested successfully
  //         </div>,
  //       })
  //     }
  //   }
  // }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="pb-2 flex flex-col items-center justify-center">
        <span className="text-lg">Deployer</span>
        <span className="text-sm">Deploy a new package onto the Sui blockchain</span>
      </div>
      <div className="flex flex-row gap-1">
        <Select value={selectedProjectName} onValueChange={(value) => {setSelectedProjectName(value)}}>
          <SelectTrigger className="w-[180px]">
            <SelectValue 
              placeholder="Select package..." 
            />
          </SelectTrigger>
          <SelectContent>
            {
              projectList.map((project) => {
                return (
                  <SelectItem key={project.name} value={project.name}>
                    {project.name}
                  </SelectItem>
                )
              })
            }
          </SelectContent>
        </Select>
        <Button
          disabled={selectedProjectName === ''}
          onClick={deployProject}
        >
          Deploy
        </Button>
      </div>
    </div>
  )
}