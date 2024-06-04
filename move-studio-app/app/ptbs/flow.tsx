'use client';

import { useState, useCallback, useRef,  } from 'react';
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

const flowKey = 'example-flow';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'input node' },
    position: { x: 250, y: 5 },
  },
];

const nodeTypes = {
  functionNode: FunctionNode,
  objectNode: ObjectNode,
  coinSplitterNode: CoinSplitterNode,
  gasCoinNode: GasCoinNode,
  coinMergerNode: CoinMergerNode
}

let id = 0;
const getId = () => `dndnode_${id++}`;

function Flow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const wallet = useWallet();

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

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
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
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
        <Panel position="top-right">
          <button onClick={onSave}>save</button>
          <button onClick={onRestore}>restore</button>
          <button onClick={() => {
            console.log('nodes', nodes)
            console.log('edges', edges)
          }}>print</button>
        </Panel>
        <Background />
        <Controls />
      </ReactFlow>
      <Sidebar />
    </div>
  );
}

export default Flow;
function setViewport(arg0: { x: any; y: any; zoom: any; }) {
  throw new Error('Function not implemented.');
}

