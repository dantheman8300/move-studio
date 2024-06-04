import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Handle, Position } from "reactflow";


export default function ObjectTransferNode() {

  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [useGasCoin, setUseWalletAddress] = useState<boolean>(false);


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