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
  onZoomChange?: (zoom: number) => void;
}

export function NetworkCanvas({ data, onNodeClick, filter, onZoomChange }: NetworkCanvasProps) {
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
    0: { x: -300, y: 0, label: 'xAI' },
    1: { x: 300, y: -200, label: 'OpenAI' },
    2: { x: 450, y: 100, label: 'Anthropic' },
    3: { x: -200, y: -300, label: 'Meta' },
    4: { x: 200, y: 250, label: 'Google (DeepMind)' },
    5: { x: -150, y: 350, label: 'Google Gemini' },
    6: { x: 400, y: -350, label: 'Nvidia' },
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
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    Object.values(clusterCenters).forEach(center => {
      // Draw Grid Marker - Subtle Circle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.arc(center.x, center.y, 80, 0, 2 * Math.PI);
      ctx.stroke();

      // Crosshair center
      ctx.beginPath();
      ctx.moveTo(center.x - 10, center.y);
      ctx.lineTo(center.x + 10, center.y);
      ctx.moveTo(center.x, center.y - 10);
      ctx.lineTo(center.x, center.y + 10);
      ctx.stroke();

      // Label background for visibility
      ctx.font = 'bold 12px "Share Tech Mono"';
      const textWidth = ctx.measureText(center.label).width;
      ctx.fillStyle = 'rgba(22, 24, 29, 0.85)';
      ctx.fillRect(center.x - textWidth/2 - 6, center.y + 85, textWidth + 12, 18);
      
      // Label border
      ctx.strokeStyle = 'rgba(130, 207, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(center.x - textWidth/2 - 6, center.y + 85, textWidth + 12, 18);

      // Label text
      ctx.fillStyle = '#82cfff';
      ctx.fillText(center.label, center.x, center.y + 94);
    });
    
    ctx.restore();
  }, []);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isExceptional = node.exceptional;
    const isFilteredOut = filter === 'exceptional' && !isExceptional;
    
    const opacity = isFilteredOut ? 0.02 : 1; // Even more faded when filtered
    
    // Draw connections/crosshairs for exceptional
    if (isExceptional && !isFilteredOut) {
      const size = 6;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 5, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(252, 165, 165, 0.1)'; // Soft Red glow (pastel)
      ctx.fill();
      
      // Target ring
      ctx.strokeStyle = '#fca5a5'; // Pastel Red
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI, false);
      ctx.stroke();
    }

    // Node Body
    const size = isExceptional ? 4 : 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    
    // COLORS: Pastel Blue (Primary) vs Pastel Red (Exceptional) vs Dark Slate (Regular)
    if (isExceptional) {
       ctx.fillStyle = '#fca5a5'; // Pastel Red
    } else {
       // Vary the grey slightly for texture
       ctx.fillStyle = '#475569'; // Slate-600
    }
    
    ctx.globalAlpha = opacity;
    ctx.fill();

    // Reset alpha
    ctx.globalAlpha = 1;

    // Draw label on hover or high scale
    if (globalScale > 2.5 && !isFilteredOut) {
       ctx.font = '400 4px "Share Tech Mono"';
       ctx.textAlign = 'left';
       ctx.textBaseline = 'middle';
       ctx.fillStyle = isExceptional ? '#fca5a5' : 'rgba(255,255,255,0.4)';
       ctx.fillText(`${node.name}`, node.x + 8, node.y);
    }
  }, [filter]);

  return (
    <div className="absolute inset-0 bg-background overflow-hidden cursor-grab active:cursor-grabbing">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={data}
        nodeLabel="name"
        backgroundColor="#00000000" // Transparent
        nodeRelSize={4}
        linkColor={() => '#1e293b'} // slate-800 (Very subtle links)
        linkWidth={1}
        minZoom={0.5}
        maxZoom={2.4}
        onNodeClick={(node: any) => {
            // NUCLEAR OPTION: Lock all nodes in place to absolutely prevent jiggle
            data.nodes.forEach((n: any) => {
               n.fx = n.x;
               n.fy = n.y;
            });
            
            // Zoom to node (capped at max zoom)
            graphRef.current?.centerAt(node.x, node.y, 1000);
            graphRef.current?.zoom(2.4, 2000);
            
            onNodeClick(node);
        }}
        nodeCanvasObject={paintNode}
        onRenderFramePost={drawClusterLabels}
        cooldownTicks={100} 
        d3AlphaDecay={0.02} // Slightly faster decay to freeze sooner
        d3VelocityDecay={0.6} // High friction to stop movement
        warmupTicks={100}
        onEngineStop={() => {
           // Engine stopped
        }}
        onZoom={(transform: { k: number }) => {
          onZoomChange?.(transform.k);
        }}
      />
    </div>
  );
}
