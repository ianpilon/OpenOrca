import { motion } from 'framer-motion';
import { FleetHealth, Machine } from '@/lib/clawData';
import { 
  Activity, Server, CheckCircle, AlertTriangle, 
  Wifi, WifiOff, Zap, ListChecks 
} from 'lucide-react';

interface FleetHealthPanelProps {
  fleetHealth: FleetHealth;
  machines: Machine[];
}

export function FleetHealthPanel({ fleetHealth, machines }: FleetHealthPanelProps) {
  const healthColor = 
    fleetHealth.overallHealth === 'healthy' ? 'text-emerald-500' :
    fleetHealth.overallHealth === 'degraded' ? 'text-amber-500' : 'text-red-500';

  const healthBg = 
    fleetHealth.overallHealth === 'healthy' ? 'bg-emerald-500/10 border-emerald-500/30' :
    fleetHealth.overallHealth === 'degraded' ? 'bg-amber-500/10 border-amber-500/30' : 
    'bg-red-500/10 border-red-500/30';

  return (
    <div className="hud-panel p-3 w-56 hud-corner-br">
      <div className="flex items-center gap-2 mb-3">
        <Activity className={`w-4 h-4 ${healthColor}`} />
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-foreground">
          Fleet Health
        </h3>
      </div>

      <div className={`p-2 rounded border mb-3 ${healthBg}`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-medium uppercase ${healthColor}`}>
            {fleetHealth.overallHealth}
          </span>
          <div className="flex items-center gap-1">
            {fleetHealth.overallHealth === 'healthy' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
            {fleetHealth.overallHealth === 'degraded' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
            {fleetHealth.overallHealth === 'critical' && <AlertTriangle className="w-3 h-3 text-red-500" />}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] text-muted-foreground">Active</span>
          </div>
          <span className="text-[10px] font-mono text-foreground">{fleetHealth.activeAgents}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <WifiOff className="w-3 h-3 text-gray-500" />
            <span className="text-[9px] text-muted-foreground">Offline</span>
          </div>
          <span className="text-[10px] font-mono text-foreground">{fleetHealth.offlineAgents}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] text-muted-foreground">Interventions</span>
          </div>
          <span className={`text-[10px] font-mono ${fleetHealth.interventionsRequired > 0 ? 'text-amber-500' : 'text-foreground'}`}>
            {fleetHealth.interventionsRequired}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ListChecks className="w-3 h-3 text-blue-500" />
            <span className="text-[9px] text-muted-foreground">Tasks Today</span>
          </div>
          <span className="text-[10px] font-mono text-foreground">{fleetHealth.tasksCompletedToday}</span>
        </div>
      </div>

      <div className="border-t border-white/5 pt-2">
        <div className="text-[9px] text-muted-foreground mb-2">Machines</div>
        <div className="space-y-1">
          {machines.map((machine) => (
            <div 
              key={machine.id}
              className="flex items-center justify-between text-[9px]"
            >
              <div className="flex items-center gap-1.5">
                <Server className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground truncate max-w-[100px]">{machine.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground text-[8px] uppercase">{machine.os}</span>
                {machine.isOnline ? (
                  <Wifi className="w-2.5 h-2.5 text-emerald-500" />
                ) : (
                  <WifiOff className="w-2.5 h-2.5 text-gray-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
