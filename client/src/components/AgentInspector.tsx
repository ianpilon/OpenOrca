import { motion } from 'framer-motion';
import { ClawAgent, AgentTask, ActionEntry, domainColors, integrationIcons } from '@/lib/clawData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, Play, Pause, Cpu, HardDrive, Clock, CheckCircle, 
  MessageCircle, Globe, FileText, Terminal
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
              className="w-8 h-8 object-contain"
            />
            <div>
              <h3 className="text-xs font-bold text-foreground">{agent.name}</h3>
              <p className="text-[9px] text-muted-foreground">{agent.machineName}</p>
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
              className="text-[9px]"
              style={{ 
                borderColor: domainColors[agent.domain],
                color: domainColors[agent.domain]
              }}
            >
              {agent.domain}
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-[9px] ${
                agent.status === 'active' ? 'border-emerald-500 text-emerald-500' :
                agent.status === 'idle' ? 'border-gray-500 text-gray-500' :
                agent.status === 'intervention_required' ? 'border-amber-500 text-amber-500' :
                'border-gray-600 text-gray-600'
              }`}
            >
              {agent.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Uptime</span>
              </div>
              <span className="text-sm font-mono text-foreground">{agent.uptime}</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="w-3 h-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Completed</span>
              </div>
              <span className="text-sm font-mono text-foreground">{agent.tasksCompleted}</span>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <Cpu className="w-3 h-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-foreground">{agent.activityLevel}%</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${agent.activityLevel}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="p-2 rounded bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <HardDrive className="w-3 h-3 text-muted-foreground" />
                <span className="text-[9px] text-muted-foreground">Memory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-foreground">{agent.memoryUsage}%</span>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${agent.memoryUsage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Integrations
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.integrations.map((int) => (
                <div 
                  key={int}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10"
                >
                  <span className="text-sm">{integrationIcons[int]}</span>
                  <span className="text-[9px] text-foreground capitalize">{int}</span>
                </div>
              ))}
            </div>
          </div>

          {task && (
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Current Task
              </h4>
              <div className="p-2 rounded bg-white/5 border border-white/10">
                <div className="text-xs text-foreground mb-1">{task.title}</div>
                <div className="text-[9px] text-muted-foreground mb-2">{task.description}</div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-muted-foreground">Progress</span>
                  <span className="text-[9px] font-mono text-foreground">{task.progress}%</span>
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
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Recent Actions
            </h4>
            <div className="space-y-1.5">
              {actions.slice(0, 5).map((action) => (
                <div 
                  key={action.id}
                  className={`p-2 rounded border text-[10px] ${
                    action.outcome === 'success' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' :
                    action.outcome === 'failure' ? 'border-red-500/20 bg-red-500/5 text-red-400' :
                    'border-blue-500/20 bg-blue-500/5 text-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{integrationIcons[action.integration]}</span>
                    <span className="flex-1 truncate text-foreground">{action.description}</span>
                    <span className="text-muted-foreground">{action.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
