export type PTBOperationType =
  | 'splitCoins'
  | 'mergeCoins'
  | 'transferObjects'
  | 'moveCall'
  | 'makeMoveVec'
  | 'publish';

export type PTBInput =
  | ObjectInput
  | PureValue
  | PTBOutput;

export type PTBOutput =
  | ObjectOutput
  | PureValue;

export interface ObjectInput {
  kind: 'objectInput';
  id: string; // Object ID
}

export interface ObjectOutput {
  kind: 'objectOutput';
  node: string; // Node ID
  index: number; // Output index
}

export type PureValueType = 'string' | 'number' | 'boolean' | 'address' | 'vector' | 'object';

export interface PureValue {
  kind: 'pureValue';
  type: PureValueType;
  value: string; // String representation of the value
}

export interface PTBOperationBase {
  id: string;
  type: PTBOperationType;
}

export interface SplitCoinsOperation extends PTBOperationBase {
  type: 'splitCoins';
  coin: ObjectInput | ObjectOutput; // The coin to split
  amounts: (string | number)[]; // Amounts to split into
}

export interface MergeCoinsOperation extends PTBOperationBase {
  type: 'mergeCoins';
  destinationCoin: ObjectInput | ObjectOutput;
  sourceCoins: ObjectInput | ObjectOutput[];
}

export interface TransferObjectsOperation extends PTBOperationBase {
  type: 'transferObjects';
  objects: ObjectInput | ObjectOutput[];
  address: string; // Recipient's address
}

export interface MoveCallOperation extends PTBOperationBase {
  type: 'moveCall';
  target: string; // The Move function to call
  arguments?: PTBInput[];
  typeArguments?: string[]; // Optional type arguments
}

export interface MakeMoveVecOperation extends PTBOperationBase {
  type: 'makeMoveVec';
  elements: PTBInput[];
  elementType: string; // The type of elements in the vector
}

export interface PublishOperation extends PTBOperationBase {
  type: 'publish';
  modules: string[]; // Move modules to publish
  dependencies?: string[]; // Optional dependencies
}

// Union type for all PTB operations
export type PTBOperation =
  | SplitCoinsOperation
  | MergeCoinsOperation
  | TransferObjectsOperation
  | MoveCallOperation
  | MakeMoveVecOperation
  | PublishOperation;


// Modify PTBNode to include outputs
export class PTBNode {
  id: string;
  operation: PTBOperation;
  outputs?: any[]; // Store outputs after execution

  constructor(operation: PTBOperation) {
    this.id = operation.id;
    this.operation = operation;
  }
}

export interface PTBEdge {
  from: string;         // ID of the source node
  outputIndex: number;  // Index of the output from the source node
  to: string;           // ID of the target node
  inputName: string;    // Name of the input parameter in the target node
}

export class PTBGraph {
  nodes: Map<string, PTBNode>;
  edges: PTBEdge[];

  constructor() {
    this.nodes = new Map<string, PTBNode>();
    this.edges = [];
  }

  addNode(node: PTBNode): void {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: PTBEdge): void {
    this.edges.push(edge);
  }

  // Apply edges to set up inputs for each node
  applyEdges(): void {
    for (const edge of this.edges) {
      this.applyEdge(edge);
    }
  }

  // Apply a single edge to connect outputs to inputs
  private applyEdge(edge: PTBEdge): void {
    const sourceNode = this.nodes.get(edge.from);
    if (!sourceNode) {
      throw new Error(`Source node with id '${edge.from}' not found.`);
    }

    const targetNode = this.nodes.get(edge.to);
    if (!targetNode) {
      throw new Error(`Target node with id '${edge.to}' not found.`);
    }

    // Retrieve the output from the source node
    // Here, we assume that the outputs will be available in an outputs map after execution
    // For now, we'll store outputs in the node itself for simplicity
    const sourceOutputs = sourceNode.outputs;
    if (!sourceOutputs || sourceOutputs.length <= edge.outputIndex) {
      throw new Error(`Output at index ${edge.outputIndex} not found in node '${edge.from}'.`);
    }
    const sourceValue = sourceOutputs[edge.outputIndex];

    // Apply the source value to the target node's input using inputName
    this.setInputValue(targetNode.operation, edge.inputName, sourceValue);
  }

  // Helper method to set a value in an object based on a path (inputName)
  private setInputValue(operation: PTBOperation, inputName: string, value: any): void {
    const inputPath = inputName.split(/[\[\]\.]+/).filter(Boolean);
    let current: any = operation;

    for (let i = 0; i < inputPath.length - 1; i++) {
      const key = inputPath[i];
      if (!(key in current)) {
        // Initialize arrays or objects as needed
        const nextKey = inputPath[i + 1];
        current[key] = /^\d+$/.test(nextKey) ? [] : {};
      }
      current = current[key];
    }

    const lastKey = inputPath[inputPath.length - 1];
    if (Array.isArray(current)) {
      const index = parseInt(lastKey, 10);
      current[index] = value;
    } else {
      current[lastKey] = value;
    }
  }

  // Execute the graph: apply edges, perform topological sort, and execute nodes
  async execute(): Promise<void> {
    // Apply edges to set up inputs
    this.applyEdges();

    // Perform topological sort to determine execution order
    const sortedNodes = this.topologicalSort();

    // Map to store outputs from nodes
    const outputs: Map<string, any[]> = new Map();

    // Execute nodes in order
    for (const node of sortedNodes) {
      const nodeOutputs = await this.executeNode(node, outputs);
      // Store outputs for use by dependent nodes
      outputs.set(node.id, nodeOutputs);
      // Optionally, store outputs in the node itself
      node.outputs = nodeOutputs;
    }
  }

  // Execute a single node
  private async executeNode(node: PTBNode, outputs: Map<string, any[]>): Promise<any[]> {
    // Resolve inputs for the node's operation
    const operation = node.operation;
    const resolvedOperation = await this.resolveOperationInputs(operation, outputs);

    // Execute the operation using the PTB SDK
    // Here, we'll need to map the operation to actual SDK calls
    // For demonstration purposes, we'll use placeholders

    switch (operation.type) {
      case 'splitCoins':
        // Implement SDK call for splitCoins
        // Example:
        // const result = tx.splitCoins(resolvedOperation.coin, resolvedOperation.amounts);
        // For now, we'll return a placeholder result
        return ['coin_part1', 'coin_part2'];
      case 'transferObjects':
        // Implement SDK call for transferObjects
        return [];
      case 'moveCall':
        // Implement SDK call for moveCall
        return ['moveCallResult'];
      // Handle other operation types...
      default:
        throw new Error(`Unsupported operation type: ${operation.type}`);
    }
  }

  // Resolve inputs for an operation
  private async resolveOperationInputs(operation: PTBOperation, outputs: Map<string, any[]>): Promise<any> {
    // Deep clone the operation to avoid mutating the original
    const resolvedOperation = JSON.parse(JSON.stringify(operation));

    // Recursively resolve all PTBInput fields
    const resolveInput = async (input: PTBInput): Promise<any> => {
      if (input.kind === 'pureValue') {
        return this.parsePureValue(input);
      } else if (input.kind === 'objectInput') {
        // Retrieve the object by ID (e.g., from the blockchain)
        // Placeholder implementation:
        return { id: input.id };
      } else if (input.kind === 'objectOutput') {
        const sourceOutputs = outputs.get(input.node);
        if (!sourceOutputs || sourceOutputs.length <= input.index) {
          throw new Error(`Output at index ${input.index} not found in node '${input.node}'.`);
        }
        return sourceOutputs[input.index];
      } else {
        throw new Error('Invalid PTBInput kind.');
      }
    };

    // Recursively traverse the operation and resolve inputs
    const traverseAndResolve = async (obj: any): Promise<void> => {
      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        const value = obj[key];
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            if (this.isPTBInput(value[i])) {
              value[i] = await resolveInput(value[i]);
            } else if (typeof value[i] === 'object') {
              await traverseAndResolve(value[i]);
            }
          }
        } else if (this.isPTBInput(value)) {
          obj[key] = await resolveInput(value);
        } else if (typeof value === 'object') {
          await traverseAndResolve(value);
        }
      }
    };

    await traverseAndResolve(resolvedOperation);
    return resolvedOperation;
  }

  // Helper to check if an object is a PTBInput
  private isPTBInput(obj: any): obj is PTBInput {
    return obj && typeof obj === 'object' && 'kind' in obj;
  }

  // Parse a PureValue to its actual value
  private parsePureValue(pureValue: PureValue): any {
    switch (pureValue.type) {
      case 'number':
        return Number(pureValue.value);
      case 'string':
      case 'address':
        return pureValue.value;
      case 'boolean':
        return pureValue.value === 'true';
      // Add other types as needed
      default:
        throw new Error(`Unsupported pure value type: ${pureValue.type}`);
    }
  }

  // Perform topological sort to determine execution order
  private topologicalSort(): PTBNode[] {
    const visited: Set<string> = new Set();
    const tempMarked: Set<string> = new Set();
    const sortedNodes: PTBNode[] = [];

    const visit = (nodeId: string) => {
      if (tempMarked.has(nodeId)) {
        throw new Error('Graph has at least one cycle, which is not allowed.');
      }
      if (!visited.has(nodeId)) {
        tempMarked.add(nodeId);
        const node = this.nodes.get(nodeId);
        if (!node) {
          throw new Error(`Node with id '${nodeId}' not found.`);
        }
        // Get dependencies (nodes that this node depends on)
        const dependentNodeIds = this.edges
          .filter(edge => edge.to === nodeId)
          .map(edge => edge.from);

        for (const depNodeId of dependentNodeIds) {
          visit(depNodeId);
        }
        tempMarked.delete(nodeId);
        visited.add(nodeId);
        sortedNodes.push(node);
      }
    };

    // Visit all nodes
    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }

    return sortedNodes;
  }

  printGraph(): void {
    console.log('=== PTB Graph ===');

    // Print Nodes
    console.log('\nNodes:');
    for (const node of this.nodes.values()) {
      console.log(`- Node ID: ${node.id}`);
      console.log(`  Operation Type: ${node.operation.type}`);
      console.log(`  Operation Details:`);
      console.log(this.formatOperation(node.operation, '    '));
    }

    // Print Edges
    console.log('\nEdges:');
    for (const edge of this.edges) {
      console.log(`- From Node: ${edge.from}, Output Index: ${edge.outputIndex}`);
      console.log(`  To Node: ${edge.to}, Input Name: ${edge.inputName}`);
    }

    console.log('=================');
  }

  // Helper method to format operation details for printing
  private formatOperation(operation: PTBOperation, indent: string = ''): string {
    const lines: string[] = [];
    const operationCopy = JSON.parse(JSON.stringify(operation)); // Deep copy to avoid mutation

    // Remove 'id' and 'type' since they're already printed
    delete operationCopy.id;
    delete operationCopy.type;

    // Format the remaining operation properties
    for (const [key, value] of Object.entries(operationCopy)) {
      const formattedValue = this.formatValue(value, indent + '  ');
      lines.push(`${indent}${key}: ${formattedValue}`);
    }

    return lines.join('\n');
  }

  // Helper method to format values recursively
  private formatValue(value: any, indent: string): string {
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const items = value.map(item => this.formatValue(item, indent + '  '));
      return `[\n${indent}  ${items.join(`,\n${indent}  `)}\n${indent}]`;
    } else if (typeof value === 'object' && value !== null) {
      if ('kind' in value) {
        // It's a PTBInput or PTBOutput
        return JSON.stringify(value);
      } else {
        const entries = Object.entries(value).map(
          ([k, v]) => `${indent}${k}: ${this.formatValue(v, indent + '  ')}`
        );
        return `{\n${entries.join(`,\n`)}\n${indent}}`;
      }
    } else {
      return JSON.stringify(value);
    }
  }
}

// Example of how to use these types
// Create a new graph
const graph = new PTBGraph();

// Create nodes
const splitNode: PTBNode = new PTBNode({
  id: 'split1',
  type: 'splitCoins',
  coin: { kind: 'objectInput', id: 'coinObjectIdPlaceholder'},
  amounts: [100, 200],
});

const transferNode: PTBNode = new PTBNode({
  id: 'transfer1',
  type: 'transferObjects',
  objects: [{ kind: 'objectOutput', node: 'split1', index: 0}],
  address: `0xRecipientAddressPlaceholder`
});

const moveCallNode: PTBNode = new PTBNode({
  id: 'moveCall1',
  type: 'moveCall',
  target: 'moveFunctionNamePlaceholder',
  arguments: [{ kind: 'objectOutput', node: 'split1', index: 1}],
});

// Add nodes to the graph
graph.addNode(splitNode);
graph.addNode(transferNode);
graph.addNode(moveCallNode);

// Add edges representing the dependencies
graph.addEdge({
  from: 'split1',
  outputIndex: 0,
  to: 'transfer1',
  inputName: 'objects[0]',
});

graph.addEdge({
  from: 'split1',
  outputIndex: 1,
  to: 'moveCall1',
  inputName: 'arguments[0]',
});

graph.applyEdges();

graph.printGraph();