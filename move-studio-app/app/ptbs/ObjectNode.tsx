import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Handle, Position } from "reactflow";


export type ObjectNodeData = {
  objectId: string;
  owner: string;
  hasPublicTransfer: boolean;
  type: string;
  fields: {
    [key: string]: any;
  }
}

export default function ObjectNode( 
  { data, isConnectable }: { data: ObjectNodeData; isConnectable: boolean }
) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {data.type.split("::").pop()}
        </CardTitle>
        <CardDescription>
          {`${data.objectId.slice(
              0,
              6
            )}...${data.objectId.slice(-4)}`} 
        </CardDescription>
      </CardHeader>
      <CardContent>

      </CardContent>
      <CardFooter>
        <Handle
          type="source"
          position={Position.Bottom}
          id={`${data.objectId}`}
          isConnectableStart={true}
          isConnectableEnd={false}
        />
      </CardFooter>
    </Card>
  ) 
}