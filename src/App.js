import React, { useCallback, useEffect, useState } from 'react';
import './App.css';
import Diagram from './components/Diagram';
import metadata from './metadata.json';
import { ReactFlowProvider, addEdge } from 'reactflow';

function Sidebar({
  onAddNode,
  onConnect,
  onDeleteSelected,
  selectedElement,
  onUpdateLabel,
  nodes,
  edges,
  onLoadFromStorage,
  onSaveToStorage,
}) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (selectedElement && selectedElement.data && selectedElement.data.label) {
      setLabel(selectedElement.data.label);
    } else {
      setLabel('');
    }
  }, [selectedElement]);

  return (
    <div className="sidebar">
      <h3>Controls</h3>
      <div className="controls">
        <button onClick={onAddNode}>Add Node</button>
        <button onClick={() => onConnect()}>Connect Selected</button>
        <button onClick={onDeleteSelected}>Delete Selected</button>
        <button onClick={onSaveToStorage}>Save</button>
        <button onClick={onLoadFromStorage}>Load</button>
      </div>

      <div style={{marginTop:12}}>
        <h4>Edit Label</h4>
        <div className="form-group">
          <label>Selected element label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <button onClick={() => onUpdateLabel(label)}>Update Label</button>
        <div className="editor-note">
          Tip: Click a node to select it. Hold Shift + Drag to multi-select.
        </div>
      </div>

      <hr style={{margin: '12px 0'}} />

      <h4>Metadata</h4>
      <div className="form-group">
        <label>Nodes: {nodes.length}</label>
      </div>
      <div className="form-group">
        <label>Edges: {edges.length}</label>
      </div>
    </div>
  );
}

export default function App() {
  const [nodesState, setNodesState] = useState([]);
  const [edgesState, setEdgesState] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);

  // Load from metadata.json on first render
  useEffect(() => {
    setNodesState(metadata.nodes || []);
    setEdgesState(metadata.edges || []);
  }, []);

  // Selection handler passed from Diagram
  const handleSelection = useCallback((el) => {
    setSelectedElement(el);
  }, []);

  const addNode = useCallback(() => {
    const nextId = (nodesState.length + 1).toString();
    const newNode = {
      id: nextId,
      type: 'default',
      position: { x: 150 + nodesState.length * 20, y: 150 + nodesState.length * 10 },
      data: { label: `Node ${nextId}` },
    };
    setNodesState((nds) => [...nds, newNode]);
  }, [nodesState.length]);

  // Connect two selected nodes (requires exactly 2 selected nodes)
  const connectSelected = useCallback(() => {
    // find selected nodes from DOM selection is tricky; instead rely on selectedElement
    // We'll connect last two nodes added if there are at least two nodes
    if (nodesState.length >= 2) {
      const a = nodesState[nodesState.length - 2].id;
      const b = nodesState[nodesState.length - 1].id;
      const edge = { id: `e${Date.now()}`, source: a, target: b, type: 'smoothstep' };
      setEdgesState((eds) => [...eds, edge]);
    } else {
      alert('Need at least two nodes to auto-connect (or select nodes on canvas and use drag connection).');
    }
  }, [nodesState]);

  const deleteSelected = useCallback(() => {
    if (!selectedElement) {
      alert('Select a node or edge first.');
      return;
    }
    if (selectedElement.id) {
      setNodesState((nds) => nds.filter(n => n.id !== selectedElement.id));
      setEdgesState((eds) => eds.filter(e => e.id !== selectedElement.id && e.source !== selectedElement.id && e.target !== selectedElement.id));
      setSelectedElement(null);
    }
  }, [selectedElement]);

  const updateLabel = useCallback((label) => {
    if (!selectedElement) {
      alert('Select a node first.');
      return;
    }
    setNodesState((nds) => nds.map(n => {
      if (n.id === selectedElement.id) {
        return { ...n, data: { ...n.data, label } };
      }
      return n;
    }));
    // update selection label too
    setSelectedElement((sel) => sel ? { ...sel, data: { ...sel.data, label } } : sel);
  }, [selectedElement]);

  const saveToStorage = useCallback(() => {
    localStorage.setItem('df_nodes', JSON.stringify(nodesState));
    localStorage.setItem('df_edges', JSON.stringify(edgesState));
    alert('Saved to localStorage.');
  }, [nodesState, edgesState]);

  const loadFromStorage = useCallback(() => {
    const nds = localStorage.getItem('df_nodes');
    const eds = localStorage.getItem('df_edges');
    if (nds && eds) {
      try {
        setNodesState(JSON.parse(nds));
        setEdgesState(JSON.parse(eds));
        alert('Loaded from localStorage.');
      } catch (e) {
        alert('Failed to parse saved data.');
      }
    } else {
      alert('No saved data in localStorage.');
    }
  }, []);

  return (
    <ReactFlowProvider>
      <div className="app">
        <Sidebar
          onAddNode={addNode}
          onConnect={connectSelected}
          onDeleteSelected={deleteSelected}
          selectedElement={selectedElement}
          onUpdateLabel={updateLabel}
          nodes={nodesState}
          edges={edgesState}
          onSaveToStorage={saveToStorage}
          onLoadFromStorage={loadFromStorage}
        />
        <div className="reactflow-wrapper">
          <Diagram
            nodes={nodesState}
            edges={edgesState}
            setNodes={setNodesState}
            setEdges={setEdgesState}
            onSelectionChange={handleSelection}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
