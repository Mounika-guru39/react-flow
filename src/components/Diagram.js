import React, { useCallback } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';

function Diagram({ nodes: initialNodes, edges: initialEdges, setNodes, setEdges, onSelectionChange }) {
  // useNodesState/useEdgesState give convenient handlers for common changes
  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep parent state in sync when internal nodes/edges change
  React.useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  React.useEffect(() => {
    setEdges(edges);
  }, [edges, setEdges]);

  const onConnect = useCallback((params) => {
    _setEdges((eds) => addEdge({ ...params, id: `e${Date.now()}` }, eds));
  }, [_setEdges]);

  const onSelection = useCallback((elements) => {
    // elements can be undefined (deselection) or object with nodes/edges arrays
    if (!elements) {
      onSelectionChange(null);
      return;
    }
    // prefer node selection if present
    if (elements.nodes && elements.nodes.length > 0) {
      onSelectionChange(elements.nodes[0]);
    } else if (elements.edges && elements.edges.length > 0) {
      onSelectionChange(elements.edges[0]);
    } else {
      onSelectionChange(null);
    }
  }, [onSelectionChange]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelection}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default Diagram;
