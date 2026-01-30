import { motion, AnimatePresence } from 'framer-motion';
import { ActionEntry, ClawAgent, integrationIcons } from '@/lib/clawData';
import { Check, X, Clock, Mail, MessageCircle, FileText, Globe, Calendar, Terminal, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionTimelineProps {
  actions: ActionEntry[];
  selectedAgentId: string | null;
  agents: ClawAgent[];
  onAgentSelect: (agent: ClawAgent) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const actionTypeIcons: Record<ActionEntry['type'], React.ReactNode> = {
  email_sent: <Mail className="w-3 h-3" />,
  message_sent: <MessageCircle className="w-3 h-3" />,
  file_modified: <FileText className="w-3 h-3" />,
  browser_action: <Globe className="w-3 h-3" />,
  calendar_update: <Calendar className="w-3 h-3" />,
  command_run: <Terminal className="w-3 h-3" />,
  api_call: <GitBranch className="w-3 h-3" />,
  decision: <Check className="w-3 h-3" />,
};

export function ActionTimeline({ 
  actions, 
  selectedAgentId, 
  agents, 
  onAgentSelect,
  isCollapsed,
  onToggleCollapse
}: ActionTimelineProps) {
  const displayedActions = actions.slice(0, 15);

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? 48 : 256
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute left-6 top-40 bottom-40 z-20 pointer-events-auto"
    >
      <div className="hud-panel h-full flex flex-col hud-corner-tl relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-3 w-6 h-6 p-0 rounded-full bg-background border border-white/10 hover:border-white/20 z-10"
          data-testid="toggle-timeline"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>

        <AnimatePresence mode="wait">
          {isCollapsed ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-4 gap-3"
            >
              <div className="writing-mode-vertical text-[10px] font-bold uppercase tracking-wider text-foreground rotate-180"
                   style={{ writingMode: 'vertical-rl' }}>
                Action Log
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">
                {displayedActions.length}
              </div>
              <div className="flex flex-col gap-1 mt-2">
                {displayedActions.slice(0, 5).map((action) => (
                  <div 
                    key={action.id}
                    className={`w-2 h-2 rounded-full ${
                      action.outcome === 'success' ? 'bg-emerald-500' : 
                      action.outcome === 'failure' ? 'bg-red-500' : 
                      'bg-blue-500'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="p-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
                    Action Log
                  </h3>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {selectedAgentId ? 'FILTERED' : 'ALL AGENTS'}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                {displayedActions.map((action, index) => {
                  const agent = agents.find(a => a.id === action.agentId);
                  
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-2 rounded border transition-colors cursor-pointer
                        ${action.outcome === 'success' ? 'border-emerald-500/20 bg-emerald-500/5' : 
                          action.outcome === 'failure' ? 'border-red-500/20 bg-red-500/5' : 
                          'border-blue-500/20 bg-blue-500/5'}
                        hover:bg-white/5`}
                      onClick={() => agent && onAgentSelect(agent)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 ${
                          action.outcome === 'success' ? 'text-emerald-500' : 
                          action.outcome === 'failure' ? 'text-red-500' : 
                          'text-blue-500'
                        }`}>
                          {actionTypeIcons[action.type]}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-foreground truncate">
                            {action.description}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] text-muted-foreground">
                              {agent?.name || 'Unknown'}
                            </span>
                            <span className="text-[9px]" title={action.integration}>
                              {integrationIcons[action.integration]}
                            </span>
                            <span className="text-[8px] text-muted-foreground ml-auto">
                              {action.timestamp}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {action.outcome === 'success' && <Check className="w-3 h-3 text-emerald-500" />}
                          {action.outcome === 'failure' && <X className="w-3 h-3 text-red-500" />}
                          {action.outcome === 'pending' && <Clock className="w-3 h-3 text-blue-500" />}
                        </div>
                      </div>

                      {action.requiresApproval && (
                        <div className="mt-1.5 px-1.5 py-0.5 bg-amber-500/20 rounded text-[8px] text-amber-400 inline-block">
                          Needs Approval
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {displayedActions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    No actions recorded
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
