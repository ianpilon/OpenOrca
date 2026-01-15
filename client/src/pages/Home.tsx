import { useState, useMemo } from 'react';
import { NetworkCanvas } from '@/components/NetworkCanvas';
import { ProfileCard } from '@/components/ProfileCard';
import { generateGraphData, NodeData } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence } from 'framer-motion';
import { Crosshair, ShieldAlert, Target, Activity, Share2, Terminal } from 'lucide-react';

// Generate data once
const graphData = generateGraphData(1000);

export default function Home() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [filter, setFilter] = useState<'all' | 'exceptional'>('all');

  // Stats
  const totalNodes = graphData.nodes.length;
  const exceptionalCount = graphData.nodes.filter(n => n.exceptional).length;

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden font-sans">
      <div className="scan-line" />
      
      {/* Background Graph */}
      <NetworkCanvas 
        data={graphData} 
        onNodeClick={setSelectedNode} 
        filter={filter}
      />

      {/* Header / Nav Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none flex justify-between items-start z-10 h-32">
        <div className="pointer-events-auto flex items-start gap-6">
          <div className="hud-panel p-4 w-64 hud-corner-tl">
             <div className="flex items-center gap-3 mb-2">
                <ShieldAlert className="text-primary w-5 h-5 animate-pulse" />
                <span className="hud-text text-primary">SentriX // Recon</span>
             </div>
             <div className="h-px bg-white/10 w-full mb-2" />
             <h1 className="text-xl font-bold uppercase tracking-wider text-white">Talent Grid</h1>
             <p className="hud-text text-muted-foreground mt-1">Status: <span className="text-green-500">Active Monitoring</span></p>
          </div>
          
          <div className="hud-panel p-2 flex gap-4 items-center">
             <div className="text-center px-4 border-r border-white/10">
                <span className="block text-2xl font-mono font-bold text-white">{totalNodes}</span>
                <span className="hud-text text-muted-foreground">Total Units</span>
             </div>
             <div className="text-center px-4">
                <span className="block text-2xl font-mono font-bold text-primary">{exceptionalCount}</span>
                <span className="hud-text text-primary">High Value Targets</span>
             </div>
          </div>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <Button variant="outline" className="hud-panel border-white/20 text-xs font-mono uppercase hover:bg-white/5 hover:text-primary rounded-none h-10">
            <Terminal className="w-3 h-3 mr-2" /> System Logs
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-black font-bold font-mono uppercase rounded-none h-10">
             <Activity className="w-3 h-3 mr-2" /> Initialize Link
          </Button>
        </div>
      </div>

      {/* Crosshairs & Grid Overlays */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/10 rounded-full" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-white/10 rounded-full" />
         <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-primary" />
         <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-primary" />
         <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-primary" />
         <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-primary" />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-8 z-10 pointer-events-auto w-80">
        <div className="hud-panel p-1 hud-corner-bl flex flex-col gap-1">
          <div className="flex items-center justify-between p-2 bg-white/5 mb-1">
             <span className="hud-text text-muted-foreground">Filter Protocols</span>
             <Target className="w-3 h-3 text-primary" />
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost"
              onClick={() => setFilter('all')}
              className={`flex-1 rounded-none font-mono text-xs uppercase border border-transparent ${filter === 'all' ? 'bg-primary/10 border-primary text-primary' : 'text-muted-foreground hover:bg-white/5'}`}
            >
              All Units
            </Button>
            <Button 
              variant="ghost"
              onClick={() => setFilter('exceptional')}
              className={`flex-1 rounded-none font-mono text-xs uppercase border border-transparent ${filter === 'exceptional' ? 'bg-primary text-black font-bold' : 'text-muted-foreground hover:bg-white/5'}`}
            >
              HVT Only
            </Button>
          </div>
        </div>
      </div>

      {/* Contextual Card Sidebar */}
      <AnimatePresence>
        {selectedNode && (
          <ProfileCard 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
