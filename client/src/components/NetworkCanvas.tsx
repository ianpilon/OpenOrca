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

  // Configure Forces for "Cluster" layout
  useEffect(() => {
    if (graphRef.current) {
      // 1. Charge: Repulsion. Negative value pushes nodes apart.
      // Stronger repulsion (-80) prevents the tight ball.
      graphRef.current.d3Force('charge').strength(-120).distanceMax(500);

      // 2. Link: Connection stiffness/length.
      // Longer distance allows clusters to separate.
      graphRef.current.d3Force('link').distance(45);

      // 3. Collide: Prevent overlap
      graphRef.current.d3Force('collide', d3.forceCollide(10));

      // 4. Center: Keep it visible in viewport, but don't crush it
      graphRef.current.d3Force('center').strength(0.05);
      
      // Re-heat simulation
      graphRef.current.d3ReheatSimulation();
    }
  }, [graphRef.current]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isExceptional = node.exceptional;
    const isFilteredOut = filter === 'exceptional' && !isExceptional;
    
    // Dim nodes if filtered out
    const opacity = isFilteredOut ? 0.05 : 1;
    
    // Base size
    const size = isExceptional ? 6 : 4;
    
    // Glow for exceptional nodes
    if (isExceptional && !isFilteredOut) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(124, 58, 237, 0.2)'; // Primary purple glow (outer)
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'rgba(124, 58, 237, 0.4)'; // Primary purple glow (inner)
      ctx.fill();
    }

    // Draw circle background
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    // Use color to distinguish clusters slightly? No, stick to design system for now.
    // Maybe use location mapping if requested later.
    ctx.fillStyle = isExceptional ? '#7c3aed' : '#2dd4bf'; // Purple or Teal
    ctx.globalAlpha = opacity;
    ctx.fill();

    // Draw Image (if scale is large enough to matter)
    if (globalScale > 1.2 && !isFilteredOut) {
      const img = images.current[node.img];
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
        ctx.clip();
        ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
        ctx.restore();
      }
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;

    // Draw label on hover or high scale
    if (globalScale > 2.5 && !isFilteredOut) {
       ctx.font = `${isExceptional ? '600' : '400'} 4px Sans-Serif`;
       ctx.textAlign = 'center';
       ctx.textBaseline = 'top';
       ctx.fillStyle = isExceptional ? '#fff' : 'rgba(255,255,255,0.7)';
       ctx.fillText(node.name, node.x, node.y + size + 2);
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
        backgroundColor="#050505" // dark bg
        nodeRelSize={6}
        linkColor={() => '#3f3f46'} // zinc-700
        linkWidth={1}
        onNodeClick={(node: any) => {
            // Zoom to node
            graphRef.current?.centerAt(node.x, node.y, 1000);
            graphRef.current?.zoom(5, 2000);
            onNodeClick(node);
        }}
        nodeCanvasObject={paintNode}
        cooldownTicks={200} // Longer cooldown to let it settle
        d3AlphaDecay={0.01} // Slower decay for better settling
        d3VelocityDecay={0.4} // More friction to stop jitter
        warmupTicks={100} // Compute layout before showing
      />
    </div>
  );
}
