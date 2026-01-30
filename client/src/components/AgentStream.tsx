import { motion } from 'framer-motion';
import { ClawAgent, AgentTask, domainColors, integrationIcons } from '@/lib/clawData';
import { Button } from '@/components/ui/button';
import { Play, Pause, Zap, Clock, CheckCircle } from 'lucide-react';
import clawAgentImg from '@/assets/images/claw-agent.png';

interface AgentStreamProps {
  agents: ClawAgent[];
  tasks: AgentTask[];
  onAgentSelect: (agent: ClawAgent) => void;
  onWakeAgent: (agentId: string) => void;
  onPauseAgent: (agentId: string) => void;
  selectedAgentId?: string;
}

export function AgentStream({ 
  agents, 
  tasks, 
  onAgentSelect, 
  onWakeAgent,
  onPauseAgent,
  selectedAgentId 
}: AgentStreamProps) {
  const activeAgents = agents
    .filter(a => a.status === 'active' || a.status === 'idle' || a.status === 'waiting')
    .slice(0, 8);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-6 left-80 right-80 z-20 pointer-events-auto"
    >
      <div className="hud-panel p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Agent Stream
          </h3>
          <span className="text-[9px] text-muted-foreground font-mono">
            {agents.filter(a => a.status === 'active').length} ACTIVE / {agents.length} TOTAL
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {activeAgents.map((agent) => {
            const task = tasks.find(t => t.id === agent.currentTaskId);
            const isSelected = selectedAgentId === agent.id;
            
            return (
              <motion.div
                key={agent.id}
                whileHover={{ scale: 1.02 }}
                className={`flex-shrink-0 w-48 p-2.5 rounded border transition-all cursor-pointer
                  ${isSelected 
                    ? 'border-primary bg-primary/10' 
                    : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                onClick={() => onAgentSelect(agent)}
              >
                <div className="flex items-start gap-2">
                  <div className="relative flex-shrink-0">
                    <img 
                      src={clawAgentImg} 
                      alt={agent.name}
                      className="w-8 h-8 object-contain"
                      style={{
                        filter: agent.status === 'idle' ? 'grayscale(0.5)' : 'none',
                      }}
                    />
                    {agent.status === 'active' && (
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium text-foreground truncate">
                        {agent.name}
                      </span>
                      <span 
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: domainColors[agent.domain] }}
                      />
                    </div>
                    <div className="text-[8px] text-muted-foreground truncate">
                      {agent.machineName}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {agent.status === 'active' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPauseAgent(agent.id);
                        }}
                      >
                        <Pause className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onWakeAgent(agent.id);
                        }}
                      >
                        <Play className="w-3 h-3 text-emerald-500" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-2 text-[9px] text-muted-foreground truncate">
                  {agent.currentAction}
                </div>

                {task && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[8px] text-muted-foreground">Progress</span>
                      <span className="text-[8px] font-mono text-foreground">{task.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: domainColors[agent.domain] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center gap-1">
                  {agent.integrations.slice(0, 4).map((int, i) => (
                    <span key={i} className="text-[9px]" title={int}>
                      {integrationIcons[int]}
                    </span>
                  ))}
                  {agent.integrations.length > 4 && (
                    <span className="text-[8px] text-muted-foreground">
                      +{agent.integrations.length - 4}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}

          {activeAgents.length === 0 && (
            <div className="w-full text-center py-4 text-muted-foreground text-xs">
              No active agents
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
