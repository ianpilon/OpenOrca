import { motion, AnimatePresence } from 'framer-motion';
import { ClawAgent, AgentTask, domainColors, integrationIcons } from '@/lib/clawData';
import { Button } from '@/components/ui/button';
import { Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';
import clawAgentImg from '@/assets/images/claw-agent.png';

interface AgentStreamProps {
  agents: ClawAgent[];
  tasks: AgentTask[];
  onAgentSelect: (agent: ClawAgent) => void;
  onWakeAgent: (agentId: string) => void;
  onPauseAgent: (agentId: string) => void;
  selectedAgentId?: string;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function AgentStream({ 
  agents, 
  tasks, 
  onAgentSelect, 
  onWakeAgent,
  onPauseAgent,
  selectedAgentId,
  isMinimized,
  onToggleMinimize
}: AgentStreamProps) {
  const activeAgents = agents
    .filter(a => a.status === 'active' || a.status === 'idle' || a.status === 'waiting')
    .slice(0, 8);

  const activeCount = agents.filter(a => a.status === 'active').length;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        height: isMinimized ? 48 : 'auto'
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute bottom-6 left-80 right-80 z-20 pointer-events-auto"
    >
      <div className="hud-panel overflow-hidden">
        <div 
          className={`flex items-center justify-between cursor-pointer ${isMinimized ? 'p-3' : 'p-3 border-b border-white/5'}`}
          onClick={onToggleMinimize}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
            Agent Stream
            {isMinimized && (
              <span className="text-[9px] text-muted-foreground font-mono ml-2">
                {activeCount} active
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {!isMinimized && (
              <span className="text-[9px] text-muted-foreground font-mono">
                {activeCount} ACTIVE / {agents.length} TOTAL
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMinimize();
              }}
              data-testid="toggle-agent-stream"
            >
              {isMinimized ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex gap-3 overflow-x-auto p-3 pt-0 scrollbar-thin">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
