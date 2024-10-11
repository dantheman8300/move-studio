'use client';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { useState, useCallback, useRef, useContext,  } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './sidebar';
import FunctionNode from './FunctionNode';
import ObjectNode from './ObjectNode';
import { SuiClient } from '@mysten/sui.js/client';
import { useWallet } from '@suiet/wallet-kit';
import CoinSplitterNode from './CoinSplitterNode';
import GasCoinNode from './GasCoinNode';
import CoinMergerNode from './CoinMergerNode';
import ObjectTransferNode from './ObjectTransferNode';
import { Button } from '@/components/ui/button';
import { MergeCoinsOperation, PTBGraph, PTBNode, SplitCoinsOperation, TransferObjectsOperation } from './ptb-types';
import { GraphContext } from './GraphProvider';
import { Transaction } from "@mysten/sui/transactions";
import { BuildContext } from "@/Contexts/BuildProvider";
import CodeEditor from "../build/codeEditor";
import useCodeLiveQuery from "@/hooks/useCodeLiveQuery";


const flowKey = 'example-flow';


const nodeTypes = {
  functionNode: FunctionNode,
  objectNode: ObjectNode,
  coinSplitterNode: CoinSplitterNode,
  gasCoinNode: GasCoinNode,
  coinMergerNode: CoinMergerNode,
  objectTransferNode: ObjectTransferNode,
}

let id = 0;
const getId = () => `dndnode_${id++}`;

function Flow({
  path
}: {
  path: string;
}) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const { writeFile } = useContext(BuildContext);
  const { graph } = useContext(GraphContext);
  // const code = useCodeLiveQuery({ path });

  const wallet = useWallet();

  const onSave = () => {
    
    const ptbScript = graph?.toPTBScript();

    if (!ptbScript) {
      alert('No PTB script to save')
      return;
    }

    writeFile(path, ptbScript)
  }

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey) || '{}');

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) => addEdge(params, eds));

      if (!graph) {
        return;
      }

      console.log('edge', params)

      const fromNode = graph.getNode(params.source!) as PTBNode;
      const toNode = graph.getNode(params.target!) as PTBNode;

      console.log('fromNode', fromNode)
      console.log('toNode', toNode)
      console.log('toNode.operation.type', toNode.operation.type)

      if (toNode.operation.type == 'mergeCoins') {
        const operation = toNode.operation as MergeCoinsOperation;

        operation.sourceCoins.push({ kind: 'objectOutput', node: fromNode.id, index: parseInt(params.sourceHandle!.slice(-1)) });
      } else if (toNode.operation.type == 'transferObjects') {

        if (!fromNode) {
          console.log('params.source', params.source)

          const operation = toNode.operation as TransferObjectsOperation;

          operation.objects.push(
            {
              kind: 'objectInput',
              id: params.sourceHandle!
            }
          );

        } else {
          console.log('transferObjects')

          const operation = toNode.operation as TransferObjectsOperation;

          operation.objects.push(
            {
              kind: 'objectOutput',
              node: fromNode.id,
              index: parseInt(params.sourceHandle!.slice(-1)),
            }
          );

          console.log('operation', operation)
        }
      } else if (toNode.operation.type == 'splitCoins') {
        const operation = toNode.operation as SplitCoinsOperation;

        if (!fromNode) {
          console.log('params.source', params.source)

          if (params.sourceHandle == 'gascoin') {
            operation.coin = { kind: 'gasCoin' };
          } else {
            operation.coin = {
              kind: 'objectInput',
              id: params.sourceHandle!
            };
          }
        }
      } else {
        console.log('unknown operation')
      }

    },
    [],
  );

  const onDragOver = useCallback((event: { preventDefault: () => void; dataTransfer: { dropEffect: string; }; }) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event: { preventDefault: () => void; dataTransfer: { getData: (arg0: string) => any; }; clientX: any; clientY: any; }) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const data = JSON.parse(event.dataTransfer.getData('data'));
      console.log('data', data)
      console.log('type', type)

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type || !reactFlowInstance || !reactFlowWrapper.current ) {
        return;
      }

      console.log('reactFlowInstance', reactFlowInstance)

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10

      const reactFlowBounds = (reactFlowWrapper.current as any).getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      let newNode = null;
      if (type === 'functionNode') {



        const client = new SuiClient({ url: wallet.chain?.rpcUrl || "" });

        console.log("client", client);

        try {
          // // get the package details
          // const res = await client.getNormalizedMoveModulesByPackage({
          //   package: '0x2',
          // });
          // console.log("package res", res);

          newNode = {
            id: getId(),
            type: 'functionNode',
            position,
            data: {
              label: 'Function node',
              packageAddress: data.packageAddress,
              moduleName: data.moduleName,
              functionName: data.functionName,
              isEntry: data.isEntry,
              visibility: data.visibility,
              typeParameters: data.typeParameters,
              parameters: data.parameters,
              return: data.return,
            },
          };
        } catch (e) {
          console.error("error fetching package", e);
        }

        
      } else if (type == 'objectNode') {
        
        newNode = {
          id: getId(),
          type: 'objectNode',
          position,
          data: {
            label: 'Object node',
            objectId: data.objectId,
            owner: data.owner,
            hasPublicTransfer: data.hasPublicTransfer,
            type: data.type,
            fields: data.fields,
          },
        };
        
      } else if (type == "coinSplitterNode") {
        console.log('coinSplitterNode')

        if (!graph) {
          return;
        }

        const id = getId();

        const splitNode: PTBNode = new PTBNode({
          id,
          type: 'splitCoins',
          coin: null,
          amounts: [],
        });

        graph.addNode(splitNode);

        console.log('graph', graph.printGraph())

        newNode = {
          id,
          type,
          position,
          data: { label: `${type} node` },
        };
      } else if (type == "coinMergerNode") {
        console.log('coinMergerNode')

        if (!graph) {
          return;
        }

        const id = getId();

        const mergeNode: PTBNode = new PTBNode({
          id,
          type: 'mergeCoins',
          destinationCoin: null,
          sourceCoins: []
        });

        graph.addNode(mergeNode);

        console.log('graph', graph.printGraph())

        newNode = {
          id,
          type,
          position,
          data: { label: `${type} node` },
        };
      } else if (type == "objectTransferNode") {
        console.log('objectTransferNode')

        if (!graph) {
          return;
        }

        const id = getId();

        const mergeNode: PTBNode = new PTBNode({
          id,
          type: 'transferObjects',
          objects: [], 
          address: '',
        });

        graph.addNode(mergeNode);

        console.log('graph', graph.printGraph())

        newNode = {
          id,
          type,
          position,
          data: { label: `${type} node` },
        };
      } else {
        newNode = {
          id: getId(),
          type,
          position,
          data: { label: `${type} node` },
        };
      }

      if (!newNode) {
        return;
      }

      setNodes((nds) => nds.concat(newNode as any));
    },
    [reactFlowInstance],
  );

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>
        <div style={{ height: '100%', width: '100%' }} className='flex flex-col items-center'  ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            {/* <Panel position="bottom-left">
              <div className="w-[400px] h-[175px] border bg-slate-950 rounded-sm overflow-scroll">
                {
                  code &&
                  <span className="font-mono whitespace-pre">
                    {code}
                  </span>
                }
              </div>
            </Panel> */}
            <Panel position="bottom-right" className='flex flex-row gap-1 items-center'>
              <Button variant={'secondary'} size={'sm'} onClick={onSave}>save</Button>
              <Button variant={'secondary'} size={'sm'} onClick={onRestore}>restore</Button>
              <Button variant={'secondary'} size={'sm'} onClick={() => {
                console.log('nodes', nodes)
                console.log('edges', edges)
                console.log('graph', graph?.printGraph())
              }}>print</Button>
              <Button variant={'secondary'} size={'sm'} onClick={() => {
                console.log('ptb', graph?.toPTBScript())
              }}>ptb</Button>
              <Button variant={'secondary'} size={'sm'} onClick={async () => {
                console.log('run')

                const ptbScript = graph?.toPTBScript();

                if (!ptbScript) {
                  return;
                }

                const tx = new Transaction();

                eval(ptbScript);

                const res = await wallet.signAndExecuteTransaction({
                  transaction: tx,
                })

                console.log('res', res)

              }}>run</Button>
            </Panel>
            <Background />
          </ReactFlow>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <Sidebar />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default Flow;
function setViewport(arg0: { x: any; y: any; zoom: any; }) {
  throw new Error('Function not implemented.');
}

