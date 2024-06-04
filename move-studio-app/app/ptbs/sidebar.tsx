'use client'; 

export default function Sidebar() {

  const onDragStart = (event: any, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }

  return (  
    <aside className="h-[500px]">
      <div className="description">You can drag these nodes to the pane on the right.</div>
      <div className="dndnode input" onDragStart={(event) => onDragStart(event, 'input')} draggable>
        Input Node
      </div>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'default')} draggable>
        Default Node
      </div>
      <div className="dndnode output" onDragStart={(event) => onDragStart(event, 'output')} draggable>
        Output Node
      </div>
      <div onDragStart={(event) => onDragStart(event, 'functionNode')} draggable>
        Function Node
      </div>
      <div onDragStart={(event) => onDragStart(event, 'objectNode')} draggable>
        Object Node
      </div>
    </aside>
  );
}