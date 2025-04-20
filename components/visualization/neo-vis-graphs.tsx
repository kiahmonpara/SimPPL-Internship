import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network, Data, Node, Edge, Options } from 'vis-network';
import { DataSet } from 'vis-data';

interface RedditCrosspostNetworkProps {
  graphmlData: string;
}

interface GraphNode extends Node {
  id: string;
  label: string;
  title?: string;
  value?: number;
  group?: string;
  shape?: string;
  color?: {
    background: string;
    border: string;
    highlight?: {
      background: string;
      border: string;
    }
  };
  font?: {
    color: string;
    size?: number;
    face?: string;
  };
}

interface GraphEdge extends Edge {
  id: string;
  from: string;
  to: string;
  title?: string;
  arrows?: string;
  color?: {
    color: string;
    highlight?: string;
  };
  width?: number;
}

interface NodeInfo {
  id: string;
  type: string;
  label: string;
  subscribers?: number;
  title?: string;
  author?: string;
  relationships?: {
    connected: Array<{
      id: string;
      label: string;
      type: string;
      relationshipType: string;
    }>;
  };
}

const RedditCrosspostNetwork: React.FC<RedditCrosspostNetworkProps> = ({ graphmlData }) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [network, setNetwork] = useState<Network | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Check for dark mode on mount and when theme changes
  useEffect(() => {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    // Set initial state
    setIsDarkMode(mediaQuery.matches);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    // Check for dark mode class on html/body if your app supports manual toggling
    const isDarkClass = document.documentElement.classList.contains('dark');
    if (isDarkClass) setIsDarkMode(true);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Get theme-aware colors
  const getThemeColors = useCallback(() => {
    return {
      // Node colors
      subredditBackground: isDarkMode ? '#6366f1' : '#818cf8', // Indigo
      subredditBorder: isDarkMode ? '#4f46e5' : '#4338ca',
      crosspostBackground: isDarkMode ? '#f87171' : '#ef4444', // Red
      crosspostBorder: isDarkMode ? '#dc2626' : '#b91c1c',
      
      // Edge colors
      fromEdge: isDarkMode ? '#10b981' : '#059669', // Green
      toEdge: isDarkMode ? '#f59e0b' : '#d97706', // Amber
      
      // UI colors
      backgroundColor: isDarkMode ? '#1f2937' : '#f1f5f9', // Gray 800 : Slate 100
      borderColor: isDarkMode ? '#374151' : '#e2e8f0', // Gray 700 : Slate 200
      textColor: isDarkMode ? '#f9fafb' : '#1f2937', // Gray 50 : Gray 800
      mutedTextColor: isDarkMode ? '#9ca3af' : '#64748b', // Gray 400 : Slate 500
      buttonBg: isDarkMode ? '#4f46e5' : '#6366f1', // Indigo 600 : Indigo 500
      buttonText: '#ffffff',
      legendBg: isDarkMode ? '#111827' : '#ffffff', // Gray 900 : White
      tooltipBg: isDarkMode ? '#374151' : '#ffffff', // Gray 700 : White
      tooltipBorder: isDarkMode ? '#4b5563' : '#e2e8f0', // Gray 600 : Slate 200
      
      // Focus and highlight colors
      highlightBackground: isDarkMode ? '#8b5cf6' : '#a78bfa', // Purple
      highlightBorder: isDarkMode ? '#7c3aed' : '#7c3aed',
      dimmedNodeBg: isDarkMode ? '#4b5563' : '#e2e8f0', // Gray 600 : Slate 200
      dimmedEdge: isDarkMode ? '#6b7280' : '#cbd5e1', // Gray 500 : Slate 300
      cardBg: isDarkMode ? '#374151' : '#ffffff' // Gray 700 : White
    };
  }, [isDarkMode]);

  // Parse the GraphML XML data into vis.js format
  const parseGraphML = useCallback((xmlString: string): { nodes: GraphNode[], edges: GraphEdge[] } => {
    const colors = getThemeColors();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    const nodeElements = xmlDoc.querySelectorAll('node');
    const edgeElements = xmlDoc.querySelectorAll('edge');
    
    // Create arrays for nodes and edges
    const nodes: GraphNode[] = Array.from(nodeElements).map(node => {
      const id = node.getAttribute('id') || '';
      const type = node.querySelector('data[key="d0"]')?.textContent || '';
      const label = node.querySelector('data[key="d1"]')?.textContent || id;
      const subscribers = parseInt(node.querySelector('data[key="d4"]')?.textContent || '0');
      const size = parseInt(node.querySelector('data[key="d5"]')?.textContent || '10');
      const title = node.querySelector('data[key="d6"]')?.textContent || '';
      const author = node.querySelector('data[key="d7"]')?.textContent || '';
      
      const isSubreddit = type.toLowerCase() === 'subreddit';
      
      return {
        id,
        label,
        title: `${type}: ${label}\n${subscribers ? `Subscribers: ${subscribers.toLocaleString()}` : ''}${title ? `\nTitle: ${title}` : ''}${author ? `\nAuthor: ${author}` : ''}`,
        value: size,
        group: type,
        shape: 'circle',
        color: {
          background: isSubreddit ? colors.subredditBackground : colors.crosspostBackground,
          border: isSubreddit ? colors.subredditBorder : colors.crosspostBorder,
          highlight: {
            background: colors.highlightBackground,
            border: colors.highlightBorder
          }
        },
        font: {
          color: colors.textColor,
          size: 0, // Hide label by default
          face: 'Inter, system-ui, sans-serif'
        }
      };
    });
    
    const edges: GraphEdge[] = Array.from(edgeElements).map((edge, index) => {
      const source = edge.getAttribute('source') || '';
      const target = edge.getAttribute('target') || '';
      const type = edge.querySelector('data[key="d8"]')?.textContent || '';
      
      const isFromSubreddit = type === 'from_subreddit';
      
      return {
        id: `e${index}`,
        from: source,
        to: target,
        title: type || 'connection',
        arrows: 'to',
        width: 2,
        color: { 
          color: isFromSubreddit ? colors.fromEdge : colors.toEdge,
          highlight: isFromSubreddit ? colors.fromEdge : colors.toEdge
        }
      };
    });
    
    return { nodes, edges };
  }, [getThemeColors]);

  useEffect(() => {
    if (!graphmlData || !networkRef.current) return;
    
    try {
      // Parse the data
      const parsedData = parseGraphML(graphmlData);
      const colors = getThemeColors();
      
      // Create datasets for better performance with large graphs
      const nodes = new DataSet<GraphNode>(parsedData.nodes);
      const edges = new DataSet<GraphEdge>(parsedData.edges);

      const options: Options = {
        nodes: {
          font: {
            face: 'Inter, system-ui, sans-serif',
            size: 0, // Set to zero to hide labels by default
            color: colors.textColor
          },
          scaling: {
            min: 3,
            max: 10,
            label: {
              enabled: false, // Disable auto-scaling of labels
              min: 14,
              max: 22
            }
          },
          borderWidth: 1,
          size: 5, // Small fixed size for all nodes
          shadow: {
            enabled: true,
            size: 2,
            x: 0,
            y: 0,
            color: 'rgba(0,0,0,0.2)'
          },
          labelHighlightBold: true,
          // Add hover behavior
          chosen: {
            node: function(values, id, selected, hovering) {
              if (hovering) {
                values.size = 8; // Slightly larger on hover
                values.borderWidth = 2; // Make border thicker instead of bold
                // Font size is handled in the label function below
              }
            },
            label: function(values, id, selected, hovering) {
              if (hovering) {
                values.size = 14;
              }
            }
          }
        },
        edges: {
          width: 1, // Slightly thinner edges
          selectionWidth: 2,
          smooth: { 
            enabled: true,
            type: 'continuous',
            roundness: 0.5
          },
          color: {
            inherit: false,
            opacity: 0.8
          }
        },
        interaction: {
          hover: true,
          tooltipDelay: 100, // Faster tooltip display
          hideEdgesOnDrag: true,
          multiselect: true,
          navigationButtons: true,
          keyboard: {
            enabled: true,
            bindToWindow: false
          },
          hoverConnectedEdges: true,
          selectable: true
        },
        physics: {
          stabilization: {
            iterations: 200,
            fit: true
          },
          barnesHut: {
            gravitationalConstant: -5000,
            centralGravity: 0.3,
            springLength: 95, // Shorter spring length
            springConstant: 0.05,
            damping: 0.09
          }
        }
      };
      
      // Create the network
      const networkInstance = new Network(
        networkRef.current,
        { nodes, edges } as Data,
        options
      );
      
      setNetwork(networkInstance);
      
      // Variables to handle click/double-click conflicts
      let clickTimer: ReturnType<typeof setTimeout> | null = null;
      let preventDoubleClick = false;

      // Single click handler with delay to prevent double-click conflicts
      networkInstance.on("click", (params) => {
        if (preventDoubleClick) {
          preventDoubleClick = false;
          return;
        }

        // Use a timer to detect if this is part of a double-click
        if (clickTimer) {
          clearTimeout(clickTimer);
        }
        
        clickTimer = setTimeout(() => {
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const nodeData = nodes.get(nodeId);
            
            if (nodeData) {
              // Handle both array and single object cases
              const node = Array.isArray(nodeData) ? nodeData[0] : nodeData;
              
              if (node) {
                // Find all connected edges
                const connectedEdges = edges.get().filter(edge => 
                  edge.from === node.id || edge.to === node.id
                );
                
                // Get connected nodes
                const connectedNodeIds = connectedEdges.map(edge => 
                  edge.from === node.id ? edge.to : edge.from
                );
                
                const connectedNodes = nodes.get(connectedNodeIds).map(connNode => {
                  // Find the edge that connects these nodes
                  const edge = connectedEdges.find(e => 
                    (e.from === node.id && e.to === connNode.id) ||
                    (e.from === connNode.id && e.to === node.id)
                  );
                  
                  // Determine relationship direction
                  let relationshipType = edge?.title || 'connected';
                  if (edge?.from === node.id) {
                    relationshipType = `to: ${relationshipType}`;
                  } else {
                    relationshipType = `from: ${relationshipType}`;
                  }
                  
                  return {
                    id: connNode.id,
                    label: connNode.label,
                    type: connNode.group || 'Unknown',
                    relationshipType
                  };
                });
                
                // Extract data for the info panel
                const nodeInfo: NodeInfo = {
                  id: node.id,
                  type: node.group || 'Unknown',
                  label: node.label,
                  // Extract other data from the title field if available
                  subscribers: parseInt(node.title?.match(/Subscribers: ([\d,]+)/)?.[1]?.replace(/,/g, '') || '0'),
                  title: node.title?.match(/Title: (.+)/)?.[1],
                  author: node.title?.match(/Author: (.+)/)?.[1],
                  // Add relationships
                  relationships: {
                    connected: connectedNodes
                  }
                };
                
                setSelectedNode(nodeInfo);
              }
            }
          } else {
            setSelectedNode(null);
          }
          
          clickTimer = null;
        }, 300); // 300ms delay to wait for potential double-click
      });
      
      // Double-click handler
      networkInstance.on("doubleClick", (params) => {
        preventDoubleClick = true;
        
        if (clickTimer) {
          clearTimeout(clickTimer);
          clickTimer = null;
        }
        
        if (params.nodes.length > 0) {
          networkInstance.focus(params.nodes[0], {
            scale: 1.2,
            animation: true
          });
        }
      });
      
    } catch (error) {
      console.error("Error rendering network:", error);
    }
  }, [graphmlData, parseGraphML, getThemeColors]);

  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!network) return;
    
    if (term === '') {
      // Reset highlight
      const { nodes, edges } = parseGraphML(graphmlData);
      network.setData({ nodes, edges } as Data);
      return;
    }
    
    const { nodes, edges } = parseGraphML(graphmlData);
    const colors = getThemeColors();
    
    // Find matching nodes
    const matchingNodes = nodes.filter(node => 
      node.label.toLowerCase().includes(term) || 
      (node.title && node.title.toLowerCase().includes(term))
    );
    
    const matchingIds = new Set(matchingNodes.map(node => node.id));
    
    // Highlight matching nodes and dim others
    nodes.forEach(node => {
      const isSubreddit = node.group?.toLowerCase() === 'subreddit';
      
      if (matchingIds.has(node.id)) {
        node.color = { 
          background: isSubreddit ? colors.subredditBackground : colors.crosspostBackground,
          border: isSubreddit ? colors.subredditBorder : colors.crosspostBorder
        };
        node.font = { color: colors.textColor, size: 16, face: 'Inter, system-ui, sans-serif' };
      } else {
        node.color = { 
          background: colors.dimmedNodeBg,
          border: colors.borderColor 
        };
        node.font = { color: colors.mutedTextColor, size: 12, face: 'Inter, system-ui, sans-serif' };
      }
    });
    
    // Highlight relevant edges
    edges.forEach(edge => {
      if (matchingIds.has(edge.from) || matchingIds.has(edge.to)) {
        const isFromSubreddit = edge.title === 'from_subreddit';
        edge.color = { color: isFromSubreddit ? colors.fromEdge : colors.toEdge };
        edge.width = 2;
      } else {
        edge.color = { color: colors.dimmedEdge };
        edge.width = 0.5;
      }
    });
    
    network.setData({ nodes, edges } as Data);
  };

  const colors = getThemeColors();

  return (
    <div className="reddit-crosspost-network" style={{ color: colors.textColor }}>
      <div className="network-controls" style={{ 
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search subreddits or crossposts..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: '12px 16px',
            width: '300px',
            borderRadius: '6px',
            border: `1px solid ${colors.borderColor}`,
            backgroundColor: colors.backgroundColor,
            color: colors.textColor,
            fontSize: '14px',
            flex: '1 0 200px'
          }}
        />
        <button 
          onClick={() => {
            setSearchTerm('');
            if (network) {
              const { nodes, edges } = parseGraphML(graphmlData);
              network.setData({ nodes, edges } as Data);
              network.fit();
            }
          }}
          style={{
            padding: '12px 16px',
            backgroundColor: colors.buttonBg,
            color: colors.buttonText,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: isDarkMode ? 'none' : '0 2px 5px rgba(0,0,0,0.1)'
          }}
        >
          Reset View
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', height: '700px' }}>
        <div 
          ref={networkRef} 
          style={{ 
            flex: '1 1 auto',
            height: '100%',
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '8px',
            backgroundColor: colors.backgroundColor,
            boxShadow: isDarkMode ? 'none' : '0 4px 6px rgba(0,0,0,0.05)'
          }}
        ></div>
        
        {selectedNode && (
          <div style={{
            width: '300px',
            padding: '20px',
            backgroundColor: colors.cardBg,
            border: `1px solid ${colors.borderColor}`,
            borderRadius: '8px',
            color: colors.textColor,
            boxShadow: isDarkMode ? 'none' : '0 4px 6px rgba(0,0,0,0.05)',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginTop: 0,
              marginBottom: '12px',
              color: selectedNode.type.toLowerCase() === 'subreddit' 
                ? colors.subredditBackground 
                : colors.crosspostBackground
            }}>
              {selectedNode.label}
            </h3>
            
            <div style={{ 
              fontSize: '14px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}>
              <div>
                <strong>Type:</strong> {selectedNode.type}
              </div>
              
              {selectedNode.subscribers && selectedNode.subscribers > 0 && (
                <div>
                  <strong>Subscribers:</strong> {selectedNode.subscribers.toLocaleString()}
                </div>
              )}
              
              {selectedNode.title && (
                <div>
                  <strong>Title:</strong> {selectedNode.title}
                </div>
              )}
              
              {selectedNode.author && (
                <div>
                  <strong>Author:</strong> {selectedNode.author}
                </div>
              )}
              
              <div style={{ marginTop: '12px' }}>
                <strong>ID:</strong> <code style={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#f1f5f9',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>{selectedNode.id}</code>
              </div>
              
              {selectedNode.relationships && selectedNode.relationships.connected.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Relationships:</strong>
                  <ul style={{ 
                    paddingLeft: '20px',
                    margin: '8px 0 0 0',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {selectedNode.relationships.connected.map((rel, i) => (
                      <li key={i} style={{ marginBottom: '6px' }}>
                        <div style={{ 
                          fontWeight: 'medium', 
                          color: rel.type.toLowerCase() === 'subreddit'
                            ? colors.subredditBackground
                            : colors.crosspostBackground
                        }}>
                          {rel.label}
                        </div>
                        <div style={{ fontSize: '12px', color: colors.mutedTextColor }}>
                          {rel.type} • {rel.relationshipType}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                marginTop: '20px',
                padding: '8px 12px',
                backgroundColor: 'white',
                color: colors.buttonBg,
                border: `1px solid ${colors.buttonBg}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>
      
      <div className="network-legend" style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '16px',
        margin: '20px 0',
        padding: '16px',
        backgroundColor: colors.legendBg,
        borderRadius: '8px',
        boxShadow: isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
        border: `1px solid ${colors.borderColor}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            display: 'inline-block',
            width: '12px',
            height: '12px',
            backgroundColor: colors.subredditBackground,
            borderRadius: '50%',
            marginRight: '8px',
            border: `1px solid ${colors.subredditBorder}`
          }}></span>
          <span>Subreddit</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            display: 'inline-block',
            width: '12px',
            height: '12px',
            backgroundColor: colors.crosspostBackground,
            borderRadius: '50%',
            marginRight: '8px',
            border: `1px solid ${colors.crosspostBorder}`
          }}></span>
          <span>Crosspost</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            display: 'inline-block',
            width: '12px',
            height: '12px',
            backgroundColor: colors.highlightBackground,
            borderRadius: '50%',
            marginRight: '8px',
            border: `1px solid ${colors.highlightBorder}`
          }}></span>
          <span>Selected Node</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '3px',
            backgroundColor: colors.fromEdge,
            marginRight: '8px'
          }}></span>
          <span>From Subreddit</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            display: 'inline-block',
            width: '24px',
            height: '3px',
            backgroundColor: colors.toEdge,
            marginRight: '8px'
          }}></span>
          <span>To Subreddit</span>
        </div>
      </div>
      
      <div className="network-help" style={{ 
        fontSize: '14px', 
        color: colors.mutedTextColor,
        backgroundColor: colors.legendBg,
        padding: '12px 16px',
        borderRadius: '6px',
        border: `1px solid ${colors.borderColor}`,
        marginTop: '10px'
      }}>
        <p style={{ margin: 0 }}><strong>Tips:</strong> Click on a node to see details. Double-click to zoom in. Scroll to zoom in/out. Drag to pan around.</p>
      </div>
    </div>
  );
};

export default RedditCrosspostNetwork;