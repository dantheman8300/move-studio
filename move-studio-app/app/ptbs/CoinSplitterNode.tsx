import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";


export default function CoinSplitterNode({ id } : { id: string}) {

  const updateNodeInternals = useUpdateNodeInternals();
  const [amounts, setAmounts] = useState<string[]>([]);


  return (
    <Card
      style={{ height: Math.max(amounts.length * 50 + 50, 175) }}
    >
      <CardHeader>
        <CardTitle>
          Coin Splitter
        </CardTitle>
        <CardDescription>
          Split a coin into multiple coins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input 
          placeholder="1.2, 20.3, ..."
          value={amounts.join(",")}
          onChange={(e) => {
            console.log("e.target.value.split(",")", e.target.value.split(","))
            setAmounts(e.target.value.split(","))
            updateNodeInternals(id)
          }}
        />
        <Handle type="target" position={Position.Top} id="coinSplitter" />
        {
          amounts.map((amount: string, index) => {

            return (
              <div>
                <Handle 
                  id={`R${index}`}
                  type="source"
                  position={Position.Right}
                  style={{ top: `${(index + 1) * 50}px` }}
                  isConnectableStart={true}
                  isConnectableEnd={false}

                >
                  <span className="absolute right-2 -top-3">
                    {amount}
                  </span>
                </Handle>
              </div>
            )
          })
        }
      </CardContent>
    </Card>
  )
}