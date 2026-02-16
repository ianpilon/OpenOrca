import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClawAgent, AgentTask, ActionEntry, domainColors, integrationIcons } from '@/lib/clawData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { EmbeddedTerminal } from '@/components/EmbeddedTerminal';
import { LoopContext } from '@/hooks/useTerminalSession';
import { 
  X, Play, Pause, Cpu, HardDrive, Clock, CheckCircle, 
  MessageCircle, Globe, FileText, Terminal, ChevronDown
} from 'lucide-react';
import clawAgentImg from '@/assets/images/claw-agent.png';

interface AgentInspectorProps {
  agent: ClawAgent;
  task: AgentTask | null;
  actions: ActionEntry[];
  onClose: () => void;
  onWakeAgent: (agentId: string) => void;
  onPauseAgent: (agentId: string) => void;
}

export function AgentInspector({ 
  agent, 
  task, 
  actions, 
  onClose, 
  onWakeAgent,
  onPauseAgent 
}: AgentInspectorProps) {
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Build agent context for the terminal
  const agentContext: LoopContext = {
    loopId: agent.id,
    loopName: agent.name,
    status: agent.status,
    domain: agent.domain,
    integrations: agent.integrations,
    machineName: agent.machineName,
    activityLevel: agent.activityLevel,
    currentTask: task?.title,
    taskProgress: task?.progress,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute right-6 top-40 bottom-40 w-80 z-30 pointer-events-auto"
    >
      <div className="hud-panel h-full flex flex-col hud-corner-br">
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={clawAgentImg} 
              alt={agent.name}
              className="w-9 h-9 object-contain"
            />
            <div>
              <h3 className="text-sm font-bold text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.machineName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: domainColors[agent.domain],
                color: domainColors[agent.domain]
              }}
            >
              {agent.domain}
            </Badge>
            <Badge 
              className={`text-xs font-medium ${
                agent.status === 'active' ? 'bg-emerald-600 text-white' :
                agent.status === 'idle' ? 'bg-gray-600 text-white' :
                agent.status === 'intervention_required' ? 'bg-amber-600 text-white' :
                'bg-gray-700 text-white'
              }`}
            >
              {agent.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Uptime</span>
              </div>
              <span className="text-sm font-mono text-foreground">{agent.uptime}</span>
            </div>
            <div className="p-2.5 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <span className="text-sm font-mono text-foreground">{agent.tasksCompleted}</span>
            </div>
            <div className="p-2.5 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-foreground">{agent.activityLevel}%</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${agent.activityLevel}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-2.5 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-foreground">{agent.memoryUsage}%</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${agent.memoryUsage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Integrations
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.integrations.map((int) => (
                <div 
                  key={int}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-white/5 border border-white/10"
                >
                  <span className="text-sm">{integrationIcons[int]}</span>
                  <span className="text-xs text-foreground capitalize">{int}</span>
                </div>
              ))}
            </div>
          </div>

          {task && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Current Task
              </h4>
              <div className="p-2.5 rounded bg-white/5 border border-white/10">
                <div className="text-sm text-foreground mb-1">{task.title}</div>
                <div className="text-xs text-muted-foreground mb-2">{task.description}</div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-mono text-foreground">{task.progress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: domainColors[agent.domain] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Recent Actions
            </h4>
            <div className="space-y-1.5">
              {actions.slice(0, 5).map((action) => (
                <div 
                  key={action.id}
                  className={`p-2 rounded border text-xs ${
                    action.outcome === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' :
                    action.outcome === 'failure' ? 'border-red-500/20 bg-red-500/5 text-red-400' :
                    'border-blue-500/20 bg-blue-500/5 text-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{integrationIcons[action.integration]}</span>
                    <span className="flex-1 truncate text-foreground">{action.description}</span>
                    <span className="text-muted-foreground text-[11px]">{action.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Terminal - Collapsible */}
          <Collapsible open={terminalOpen} onOpenChange={setTerminalOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2.5 hover:bg-white/5 rounded border border-white/10 transition-colors">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Agent Terminal
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${terminalOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="rounded-lg overflow-hidden border border-white/10">
                <EmbeddedTerminal
                  loopId={agent.id}
                  loopName={agent.name}
                  loopContext={agentContext}
                  mode="compact"
                  maxHeight="200px"
                  showHeader={false}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="p-3 border-t border-white/5 flex gap-2">
          {agent.status === 'active' ? (
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => onPauseAgent(agent.id)}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Agent
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={() => onWakeAgent(agent.id)}
            >
              <Play className="w-4 h-4 mr-2" />
              Wake Agent
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
