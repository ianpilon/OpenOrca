import { motion } from 'framer-motion';
import { Swarm, ClawAgent } from '@/lib/clawData';
import { Users, Target, CheckCircle, Loader2 } from 'lucide-react';
import clawAgentImg from '@/assets/images/claw-agent.png';

interface SwarmDashboardProps {
  swarms: Swarm[];
  agents: ClawAgent[];
}

export function SwarmDashboard({ swarms, agents }: SwarmDashboardProps) {
  const activeSwarms = swarms.filter(s => s.status === 'active' || s.status === 'forming');

  if (activeSwarms.length === 0) {
    return (
      <div className="hud-panel p-3 w-56">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-purple-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Swarms
          </h3>
        </div>
        <p className="text-[9px] text-muted-foreground">
          No active swarms. Agents are working independently.
        </p>
      </div>
    );
  }

  return (
    <div className="hud-panel p-3 w-64 hud-corner-tl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Active Swarms
          </h3>
        </div>
        <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-mono">
          {activeSwarms.length}
        </span>
      </div>

      <div className="space-y-3">
        {activeSwarms.map((swarm) => {
          const swarmAgents = agents.filter(a => swarm.agents.includes(a.id));
          const leadAgent = agents.find(a => a.id === swarm.leadAgentId);
          
          return (
            <motion.div
              key={swarm.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2 rounded border border-purple-500/30 bg-purple-500/5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-purple-400" />
                  <span className="text-[10px] font-medium text-foreground">{swarm.name}</span>
                </div>
                {swarm.status === 'forming' ? (
                  <Loader2 className="w-3 h-3 text-purple-400 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-purple-400" />
                )}
              </div>

              <div className="text-[9px] text-muted-foreground mb-2 line-clamp-2">
                {swarm.objective}
              </div>

              <div className="flex items-center gap-1 mb-2">
                {swarmAgents.slice(0, 4).map((agent, i) => (
                  <div 
                    key={agent.id}
                    className="relative"
                    style={{ marginLeft: i > 0 ? '-6px' : 0, zIndex: 4 - i }}
                  >
                    <img 
                      src={clawAgentImg} 
                      alt={agent.name}
                      className="w-6 h-6 object-contain rounded-full border border-purple-500/50"
                      title={agent.name}
                    />
                    {agent.id === swarm.leadAgentId && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                  </div>
                ))}
                {swarmAgents.length > 4 && (
                  <span className="text-[8px] text-muted-foreground ml-1">
                    +{swarmAgents.length - 4}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-muted-foreground">
                    {swarm.tasksCompleted}/{swarm.tasksTotal} tasks
                  </span>
                  <span className="text-[8px] font-mono text-purple-400">{swarm.progress}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${swarm.progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
