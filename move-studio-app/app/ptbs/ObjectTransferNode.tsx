import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { set } from "date-fns";
import { useContext, useState } from "react";
import { Handle, Position } from "reactflow";
import { GraphContext } from "./GraphProvider";
import { id } from "date-fns/locale";
import { PTBNode, MergeCoinsOperation, TransferObjectsOperation } from "./ptb-types";
import { useWallet } from "@suiet/wallet-kit";


export default function ObjectTransferNode({ id } : { id: string}) {

  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [useGasCoin, setUseWalletAddress] = useState<boolean>(false);


  const wallet = useWallet();
  const { graph } = useContext(GraphContext);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Object Transfer
        </CardTitle>
        <CardDescription>
          Transfer objects to the specified address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Handle type="target" position={Position.Top} id="coinSplitter" />
        <div className="flex flex-col items-start gap-2">
          <Input
            placeholder="0xabc123"
            value={recipientAddress}
            onChange={(e) => {
              setRecipientAddress(e.target.value)



            }}
            disabled={useGasCoin}
          />
          <div className="flex items-center space-x-2 ps-1">
            <Checkbox 
              id="gascoin"
              checked={useGasCoin}
              onClick={() => {

                const node = graph?.getNode(id) as PTBNode;
                const operation = node?.operation as TransferObjectsOperation;

                if (!useGasCoin) {
                  operation.address = wallet.address || ''
                } else {
                  operation.address = ''
                }
            
                console.log("operation.destinationCoin", operation.address)

                setUseWalletAddress(!useGasCoin)



              }}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use wallet address
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}