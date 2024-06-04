import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Handle, Position } from "reactflow";


export default function CoinMergerNode() {

  const [mergedCoin, setMergedCoin] = useState<string>('');
  const [useGasCoin, setUseGasCoin] = useState<boolean>(false);


  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Coin Merger
        </CardTitle>
        <CardDescription>
          Merge coins into a single coin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Handle type="target" position={Position.Top} id="coinSplitter" />
        <div className="flex flex-col items-start gap-2">
          <Input
            placeholder="0xabc123"
            value={mergedCoin}
            onChange={(e) => {
              setMergedCoin(e.target.value)
            }}
            disabled={useGasCoin}
          />
          <div className="flex items-center space-x-2 ps-1">
            <Checkbox 
              id="gascoin"
              checked={useGasCoin}
              onClick={() => {
                setUseGasCoin(!useGasCoin)
              }}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Merge into txn's gas coin
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}