import { motion, AnimatePresence } from 'framer-motion';
import { ClawAgent, Intervention, domainColors } from '@/lib/clawData';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Check, X, Clock, ChevronRight } from 'lucide-react';
import clawAgentImg from '@/assets/images/claw-agent.png';

interface AgentInterventionPanelProps {
  agents: ClawAgent[];
  interventions: Intervention[];
  onResolve: (agentId: string, action: 'approve' | 'deny' | 'later') => void;
  onAgentSelect: (agent: ClawAgent) => void;
  isHidden: boolean;
  onToggleHidden: () => void;
}

export function AgentInterventionPanel({ 
  agents, 
  interventions, 
  onResolve, 
  onAgentSelect,
  isHidden,
  onToggleHidden
}: AgentInterventionPanelProps) {
  const pendingInterventions = interventions.slice(0, 5);

  if (pendingInterventions.length === 0 && !isHidden) {
    return null;
  }

  if (isHidden && pendingInterventions.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute right-6 top-40 z-20 pointer-events-auto"
      >
        <Button
          onClick={onToggleHidden}
          className="relative h-12 w-12 rounded-full bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30"
          data-testid="show-interventions"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
          >
            {pendingInterventions.length}
          </motion.span>
        </Button>
      </motion.div>
    );
  }

  if (pendingInterventions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute right-6 top-40 w-72 z-20 pointer-events-auto"
    >
      <div className="hud-panel hud-corner-br">
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
              Interventions
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
              {pendingInterventions.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={onToggleHidden}
              data-testid="hide-interventions"
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="p-2 space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
          <AnimatePresence>
            {pendingInterventions.map((intervention, index) => {
              const agent = agents.find(a => a.id === intervention.agentId);
              
              return (
                <motion.div
                  key={intervention.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 rounded border border-amber-500/30 bg-amber-500/5"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <img 
                      src={clawAgentImg} 
                      alt={intervention.agentName}
                      className="w-7 h-7 object-contain cursor-pointer"
                      onClick={() => agent && onAgentSelect(agent)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-foreground">
                          {intervention.agentName}
                        </span>
                        {agent && (
                          <span 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: domainColors[agent.domain] }}
                          />
                        )}
                      </div>
                      <div className="text-[8px] text-muted-foreground">
                        {intervention.timestamp}
                      </div>
                    </div>
                    <div className={`text-[7px] uppercase px-1.5 py-0.5 rounded ${
                      intervention.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      intervention.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {intervention.priority}
                    </div>
                  </div>

                  <div className="text-[11px] text-foreground mb-2">
                    {intervention.question}
                  </div>

                  <div className="text-[9px] text-muted-foreground mb-3 truncate">
                    {intervention.context}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500"
                      onClick={() => onResolve(intervention.agentId, 'approve')}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-[10px] border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => onResolve(intervention.agentId, 'deny')}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Deny
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-[10px]"
                      onClick={() => onResolve(intervention.agentId, 'later')}
                    >
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
