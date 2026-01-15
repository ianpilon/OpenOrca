import ForceGraph2D from 'react-force-graph-2d';
import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import avatarMale from '@assets/generated_images/cyberpunk_tech_professional_avatar_male.png';
import avatarFemale from '@assets/generated_images/cyberpunk_tech_professional_avatar_female.png';
import avatarAndro from '@assets/generated_images/cyberpunk_tech_professional_avatar_androgynous.png';

interface NetworkCanvasProps {
  data: any;
  onNodeClick: (node: any) => void;
  filter: 'all' | 'exceptional';
}

export function NetworkCanvas({ data, onNodeClick, filter }: NetworkCanvasProps) {
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Preload images
  const images = useRef<Record<string, HTMLImageElement>>({});
  useEffect(() => {
    [avatarMale, avatarFemale, avatarAndro].forEach(src => {
      const img = new Image();
      img.src = src;
      images.current[src] = img;
    });
  }, []);

  const clusterCenters: Record<number, {x: number, y: number, label: string}> = {
    0: { x: -300, y: 0, label: 'SECTOR: SF' },
    1: { x: 300, y: -200, label: 'SECTOR: NY' },
    2: { x: 500, y: -50, label: 'SECTOR: TO' },
    3: { x: -200, y: -300, label: 'SECTOR: WA' },
    4: { x: 200, y: 250, label: 'SECTOR: AU' },
    5: { x: -100, y: 400, label: 'SECTOR: RMT' },
  };

  // Configure Forces for "Cluster" layout
  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('charge').strength(-200).distanceMax(600);
      graphRef.current.d3Force('link').distance(70);
      graphRef.current.d3Force('collide', d3.forceCollide(12));
      graphRef.current.d3Force('center').strength(0.01);
      
      const clusterForce = (alpha: number) => {
        data.nodes.forEach((node: any) => {
          const clusterId = node.clusterGroup || 0;
          const target = clusterCenters[clusterId] || { x: 0, y: 0 };
          
          node.vx += (target.x - node.x) * 1 * alpha;
          node.vy += (target.y - node.y) * 1 * alpha;
        });
      };
      
      graphRef.current.d3Force('cluster', clusterForce);
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphRef.current, data]);

  const drawClusterLabels = useCallback((ctx: CanvasRenderingContext2D, globalScale: number) => {
    ctx.save();
    ctx.font = '400 12px "Share Tech Mono"'; // Technical mono font
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    Object.values(clusterCenters).forEach(center => {
      // Draw Grid Marker
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(center.x - 50, center.y);
      ctx.lineTo(center.x + 50, center.y);
      ctx.moveTo(center.x, center.y - 50);
      ctx.lineTo(center.x, center.y + 50);
      ctx.stroke();

      // Draw Label Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      const textWidth = ctx.measureText(center.label).width;
      ctx.fillRect(center.x - textWidth/2 - 4, center.y - 8, textWidth + 8, 16);
      
      // Draw Label Text
      ctx.fillStyle = '#ff6600'; // Primary tactical orange
      ctx.fillText(center.label, center.x, center.y + 1);
    });
    
    ctx.restore();
  }, []);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isExceptional = node.exceptional;
    const isFilteredOut = filter === 'exceptional' && !isExceptional;
    
    const opacity = isFilteredOut ? 0.05 : 1;
    
    // Draw connections/crosshairs for exceptional
    if (isExceptional && !isFilteredOut) {
      const size = 6;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI, false);
      ctx.strokeStyle = 'rgba(255, 102, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Target brackets
      ctx.strokeStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(node.x - 8, node.y - 8);
      ctx.lineTo(node.x - 4, node.y - 8);
      ctx.moveTo(node.x - 8, node.y - 8);
      ctx.lineTo(node.x - 8, node.y - 4);
      ctx.stroke();
    }

    // Node Body
    const size = isExceptional ? 4 : 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = isExceptional ? '#ff6600' : '#475569'; // Orange or Slate-600
    ctx.globalAlpha = opacity;
    ctx.fill();

    // Reset alpha
    ctx.globalAlpha = 1;

    // Draw label on hover or high scale
    if (globalScale > 2.5 && !isFilteredOut) {
       ctx.font = '400 4px "Share Tech Mono"';
       ctx.textAlign = 'left';
       ctx.textBaseline = 'middle';
       ctx.fillStyle = isExceptional ? '#ff6600' : 'rgba(255,255,255,0.5)';
       ctx.fillText(`// ${node.name}`, node.x + 8, node.y);
    }
  }, [filter]);

  return (
    <div className="absolute inset-0 bg-background overflow-hidden cursor-crosshair">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={data}
        nodeLabel="name"
        backgroundColor="#00000000" // Transparent to show CSS grid background
        nodeRelSize={4}
        linkColor={() => '#334155'} // slate-700
        linkWidth={1}
        onNodeClick={(node: any) => {
            // Zoom to node
            graphRef.current?.centerAt(node.x, node.y, 1000);
            graphRef.current?.zoom(5, 2000);
            onNodeClick(node);
        }}
        nodeCanvasObject={paintNode}
        onRenderFramePre={drawClusterLabels}
        cooldownTicks={200} 
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.4}
        warmupTicks={100}
      />
    </div>
  );
}
