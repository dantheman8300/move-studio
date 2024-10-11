import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExternalLink, RefreshCw, X } from "lucide-react";
import { GuardSpinner } from "react-spinners-kit";
import { useSuiClient, useSuiClientContext } from "@mysten/dapp-kit";

const urlNetwork: { [key: string]: string } = {
  "Sui Testnet": "testnet",
  "Sui Mainnet": "mainnet",
  "Sui Devnet": "devnet",
};

export default function ObjectCard(props: {
  objectId: string;
  name: string;
  removeObject: (objectId: string) => void;
}) {
  const suiClient = useSuiClient();
  const ctx = useSuiClientContext();
  console.log('ctx.network', ctx.network)


  const [loading, setLoading] = useState<boolean>(true);

  const [objectDetails, setObjectDetails] = useState<{
    data: {
      content: {
        type: string;
        fields: {
          [key: string]: any;
        };
      };
    };
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchObjectDetails().then((data) => {
      console.log("data", data);
      setObjectDetails(data as any);
      setLoading(false);
    });
  }, [props.objectId]);

  const fetchObjectDetails = async () => {

    // get the object details
    const res = await suiClient.getObject({
      id: props.objectId,
      options: {
        showOwner: true,
        showType: true,
        showContent: true,
      },
    });

    console.log("object res", res);

    if (res.error || res.data!.type == "package") {
      console.error("error", res.error);
      props.removeObject(props.objectId);
      alert("Error fetching object details");
      return null;
    }

    return res;
  };

  if (loading || objectDetails == null) {
    return (
      <div className="border rounded-xl min-h-[350px] min-w-[300px] max-h-[350px] max-w-[300px] flex flex-col items-center justify-start py-2 px-4 w-full h-full flex flex-row items-center justify-center gap-1">
        <GuardSpinner backColor="#f59e0b" />
      </div>
    );
  }

  return (
    <div className="border rounded-xl min-h-[350px] min-w-[300px] max-h-[350px] max-w-[300px] flex flex-col items-center justify-start py-2 px-4">
      <div className="w-full flex flex-row justify-end items-baseline gap-2">
        <RefreshCw
          className="w-4 h-4 hover:text-teal-500 hover:cursor-pointer active:scale-75 transition-transform"
          onClick={() => {
            setLoading(true);
            fetchObjectDetails().then((data) => {
              console.log("data", data);
              setObjectDetails(data as any);
              setLoading(false);
            });
          }}
        />
        <a
          href={`https://suiexplorer.com/object/${props.objectId}?network=${
            ctx.network
          }`}
          target="_blank"
        >
          <ExternalLink className="w-4 h-4 hover:text-amber-500 active:scale-75 transition-transform" />
        </a>
        <X
          className="w-4 h-4 hover:text-rose-500 hover:cursor-pointer active:scale-75 transition-transform"
          onClick={() => {
            props.removeObject(props.objectId);
          }}
        />
      </div>
      <span className="font-mono text-xl text-ellipsis overflow-hidden max-w-[200px]">
        {objectDetails.data.content.type.split(
          `${objectDetails.data.content.type.split("::")[0]}::${
            objectDetails.data.content.type.split("::")[1]
          }::`
        )}
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="font-mono text-sm text-teal-800 hover:text-teal-500">{`${props.objectId.slice(
              0,
              6
            )}...${props.objectId.slice(-4)}`}</span>
          </TooltipTrigger>
          <TooltipContent className="font-mono bg-amber-500 text-amber-950">
            <p>{props.objectId}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="py-2 w-full">
        <div className="w-full flex flex-row items-center justify-between">
          <span className="text-slate-300">Type:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="block font-mono text-teal-800 hover:text-teal-500 text-ellipsis overflow-hidden max-w-[200px]">
                  {objectDetails.data.content.type.split(
                    `${objectDetails.data.content.type.split("::")[0]}::${
                      objectDetails.data.content.type.split("::")[1]
                    }::`
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent className="font-mono bg-amber-500 text-amber-950">
                <p>
                  {objectDetails.data.content.type.split(
                    `${objectDetails.data.content.type.split("::")[0]}::${
                      objectDetails.data.content.type.split("::")[1]
                    }::`
                  )}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full flex flex-row items-center justify-between">
          <span className="text-slate-300">Module:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="font-mono text-teal-800 hover:text-teal-500 truncate max-w-[100px] block text-ellipsis overflow-hidden max-w-[200px]">
                  {objectDetails.data.content.type.split("::")[1]}
                </span>
              </TooltipTrigger>
              <TooltipContent className="font-mono bg-amber-500 text-amber-950">
                <p>{objectDetails.data.content.type.split("::")[1]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="w-full flex flex-row items-center justify-between">
          <span className="text-slate-300">Package:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="font-mono text-teal-800 hover:text-teal-500 block text-ellipsis overflow-hidden max-w-[200px]">
                  {`${objectDetails.data.content.type.split("::")[0]}`.length <
                  10
                    ? `${objectDetails.data.content.type.split("::")[0]}`
                    : `${objectDetails.data.content.type
                        .split("::")[0]
                        .slice(0, 10)}...${objectDetails.data.content.type
                        .split("::")[0]
                        .slice(-4)}`}
                </span>
              </TooltipTrigger>
              <TooltipContent className="font-mono bg-amber-500 text-amber-950">
                <p>{objectDetails.data.content.type.split("::")[0]}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-[75px]">Attribute</TableHead>
            <TableHead className="text-center w-[175px] ps-4">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="h-fit max-h-[200px] overflow-y-auto">
          {Object.keys(objectDetails.data.content.fields)
            .filter((attributeName) => attributeName != "id")
            .map((key, index) => {
              console.log("key", key);
              console.log(
                "objectDetails.data.content.fields[key]",
                objectDetails.data.content.fields[key]
              );
              return (
                <TableRow key={index}>
                  <TableCell className="text-center ">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="max-w-[75px] truncate text-slate-300 hover:text-slate-200">
                          {key}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{key}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  <TableCell className="font-mono text-center max-w-[150px] truncate ps-4 text-teal-800 hover:text-teal-500">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-center max-w-[150px] truncate">
                          {objectDetails.data.content.fields[key]?.toString() || "-"}
                        </TooltipTrigger>
                        <TooltipContent className="font-mono bg-amber-500 text-amber-950">
                          <p className="whitespace-pre-wrap text-start">
                            {JSON.stringify(
                              objectDetails.data.content.fields[key],
                              null,
                              "\t"
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {/* {JSON.stringify(objectDetails)} */}
    </div>
  );
}
