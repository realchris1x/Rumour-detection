import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { PropagationTree, PropagationNode } from '../types';

interface PropagationGraphProps {
  tree: PropagationTree;
  onNodeSelect?: (node: PropagationNode) => void;
  selectedNodeId?: string | null;
  height?: number;
}

export const PropagationGraph: React.FC<PropagationGraphProps> = ({
  tree,
  onNodeSelect,
  selectedNodeId,
  height = 500
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<PropagationNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !tree) return;

    const containerWidth = containerRef.current.clientWidth;
    const svg = d3.select(svgRef.current);
    
    // Clear previous graph contents
    svg.selectAll('*').remove();

    // Create the master group for zoom and pan
    const mainGroup = svg.append('g').attr('class', 'graph-content');

    // Add zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        mainGroup.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    // Prepare D3 node and link data (make shallow copies to avoid modifying original state)
    const d3Nodes = tree.nodes.map(n => ({ ...n })) as (PropagationNode & d3.SimulationNodeDatum)[];
    
    const d3Links = tree.edges.map(e => ({
      source: e.source,
      target: e.target,
      type: e.type
    })) as unknown as (d3.SimulationLinkDatum<PropagationNode & d3.SimulationNodeDatum> & { type: string })[];

    // Set up D3 Force Simulation
    const simulation = d3.forceSimulation<PropagationNode & d3.SimulationNodeDatum>(d3Nodes)
      .force('link', d3.forceLink<PropagationNode & d3.SimulationNodeDatum, d3.SimulationLinkDatum<PropagationNode & d3.SimulationNodeDatum>>(d3Links)
        .id(d => d.id)
        .distance(d => (d as any).type === 'reply' ? 30 : 45)
      )
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(containerWidth / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as any).influence + 4));

    // Render Links (edges)
    const linkGroup = mainGroup.append('g')
      .attr('class', 'links')
      .attr('stroke', '#22252B')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5);

    const link = linkGroup.selectAll('line')
      .data(d3Links)
      .enter()
      .append('line')
      .attr('stroke', d => d.type === 'reply' ? '#8F48E5' : '#5A5E67')
      .attr('stroke-dasharray', d => d.type === 'reply' ? '3,3' : 'none');

    // Render Nodes
    const nodeGroup = mainGroup.append('g')
      .attr('class', 'nodes');

    const node = nodeGroup.selectAll<SVGGElement, PropagationNode & d3.SimulationNodeDatum>('g')
      .data(d3Nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeSelect) {
          // Find original node object
          const original = tree.nodes.find(n => n.id === d.id);
          if (original) onNodeSelect(original);
        }
      })
      .on('mouseover', (event, d) => {
        const original = tree.nodes.find(n => n.id === d.id);
        if (original) {
          setHoveredNode(original);
        }
      })
      .on('mousemove', (event) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left + 15,
            y: event.clientY - rect.top + 15
          });
        }
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
      })
      .call(d3.drag<SVGGElement, PropagationNode & d3.SimulationNodeDatum>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Node shapes & colors
    node.each(function(d) {
      const el = d3.select(this);
      const isRoot = d.type === 'root';
      const radius = d.influence;

      if (isRoot) {
        // Root has a pulsing glow and outer rings
        el.append('circle')
          .attr('r', radius + 6)
          .attr('fill', 'none')
          .attr('stroke', '#E8B23D')
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1.5)
          .attr('class', 'animate-pulse');
        
        el.append('circle')
          .attr('r', radius)
          .attr('fill', '#E8B23D')
          .attr('stroke', '#0A0B0D')
          .attr('stroke-width', 2);
      } else {
        // Standard nodes
        const nodeColor = d.type === 'reply' ? '#B882FF' : '#8E939E';
        
        el.append('circle')
          .attr('r', radius)
          .attr('fill', nodeColor)
          .attr('stroke', d.is_verified ? '#3DD68C' : '#0A0B0D')
          .attr('stroke-width', d.is_verified ? 2.5 : 1);
        
        // Add subtle indicator dot for verified users
        if (d.is_verified) {
          el.append('circle')
            .attr('r', 2)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', '#0A0B0D');
        }
      }
    });

    // Update positions on every tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag handlers
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Auto-fit nodes on initial load
    setTimeout(() => {
      const bounds = mainGroup.node()?.getBBox();
      if (bounds && bounds.width > 0 && bounds.height > 0) {
        const dx = bounds.width;
        const dy = bounds.height;
        const x = bounds.x + dx / 2;
        const y = bounds.y + dy / 2;
        const scale = Math.min(0.9, 0.85 / Math.max(dx / containerWidth, dy / height));
        const transform = d3.zoomIdentity
          .translate(containerWidth / 2 - scale * x, height / 2 - scale * y)
          .scale(scale);
        
        svg.transition()
          .duration(750)
          .call(zoomBehavior.transform, transform);
      }
    }, 100);

    return () => {
      simulation.stop();
    };
  }, [tree, height]);

  // Render selected node highlights on D3 simulation using overlay outline
  useEffect(() => {
    if (!svgRef.current || !tree) return;
    const svg = d3.select(svgRef.current);
    
    svg.selectAll('.node-group')
      .select('circle.selection-ring')
      .remove();

    if (selectedNodeId) {
      svg.selectAll('.node-group')
        .filter((d: any) => d.id === selectedNodeId)
        .append('circle')
        .attr('class', 'selection-ring')
        .attr('r', (d: any) => d.influence + 4)
        .attr('fill', 'none')
        .attr('stroke', '#E8B23D')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '2,2');
    }
  }, [selectedNodeId, tree]);

  return (
    <div ref={containerRef} className="relative w-full h-full propagation-graph-container select-none">
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="block bg-background-surface/30 rounded-xl border border-border-muted"
      />
      
      {/* HUD Info Box (Legend) */}
      <div className="absolute bottom-4 left-4 p-3 bg-background-surface/85 backdrop-blur-md rounded-lg border border-border-muted text-[11px] font-mono text-text-secondary flex flex-col gap-1.5 pointer-events-none select-none">
        <div className="text-[10px] uppercase text-text-muted border-b border-border-muted pb-1 mb-1 font-bold">Cascade Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-gold border border-background-base" />
          <span>Root Tweet (Source Claim)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-text-secondary border border-background-base" />
          <span>Retweet (Forward Cascade)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#B882FF] border border-background-base" />
          <span>Reply Node (Text/Discussion)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-text-secondary border-2 border-signal-nonRumor" />
          <span>Verified Account (Green Border)</span>
        </div>
        <div className="text-[9px] text-text-muted mt-1">Scroll to Zoom • Drag to Pan/Inspect</div>
      </div>

      {/* Floating Node Tooltip */}
      {hoveredNode && (
        <div
          className="absolute z-50 p-2.5 bg-background-surface border border-border-muted rounded shadow-xl text-xs font-mono max-w-[220px] pointer-events-none"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-text-primary text-[13px] mb-1">
            @{hoveredNode.user_screen_name}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-text-secondary mt-1">
            <span>Type:</span>
            <span className="capitalize text-text-primary">{hoveredNode.type}</span>
            
            <span>Followers:</span>
            <span className="text-text-primary font-medium">{hoveredNode.followers_count.toLocaleString()}</span>
            
            <span>Offset:</span>
            <span className="text-text-primary font-medium">+{hoveredNode.created_at_offset}m</span>
            
            <span>Verified:</span>
            <span className={hoveredNode.is_verified ? "text-signal-nonRumor" : "text-text-muted"}>
              {hoveredNode.is_verified ? "Yes" : "No"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
