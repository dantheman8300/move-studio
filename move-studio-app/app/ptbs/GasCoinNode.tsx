import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Handle, Position } from "reactflow";


export default function GasCoinNode() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Gas Coin
        </CardTitle>
        <CardDescription>
          Txn gas coin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Handle type="source" position={Position.Bottom} id="gascoin" />
      </CardContent>
    </Card>
  )
}