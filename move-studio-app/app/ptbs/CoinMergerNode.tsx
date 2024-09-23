import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useContext, useState } from "react";
import { Handle, Position } from "reactflow";
import { GraphContext } from "./GraphProvider";
import { id } from "date-fns/locale";
import { PTBNode, MergeCoinsOperation } from "./ptb-types";


export default function CoinMergerNode({ id } : { id: string}) {

  const [mergedCoin, setMergedCoin] = useState<string>('');
  const [useGasCoin, setUseGasCoin] = useState<boolean>(false);

  const { graph } = useContext(GraphContext);

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

                const node = graph?.getNode(id) as PTBNode;
                const operation = node?.operation as MergeCoinsOperation;

                if (!useGasCoin) {
                  operation.destinationCoin = { kind: 'gasCoin' }
                } else {
                  operation.destinationCoin = null
                }
            
                console.log("operation.destinationCoin", operation.destinationCoin)

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