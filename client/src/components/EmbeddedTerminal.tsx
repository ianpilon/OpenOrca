import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { useTerminalSession, TerminalLine, LoopContext } from '@/hooks/useTerminalSession';
import { Terminal, ChevronRight, Loader2, X, Minimize2, Square, Info, Activity, Trash2, HelpCircle } from 'lucide-react';

interface EmbeddedTerminalProps {
  loopId?: string;
  loopName?: string;
  loopContext?: LoopContext;
  mode?: 'full' | 'compact' | 'inline';
  initialLines?: TerminalLine[];
  onCommand?: (command: string) => Promise<string | void>;
  onClose?: () => void;
  className?: string;
  showHeader?: boolean;
  maxHeight?: string;
}

export function EmbeddedTerminal({
  loopId,
  loopName,
  loopContext,
  mode = 'full',
  initialLines,
  onCommand,
  onClose,
  className = '',
  showHeader = true,
  maxHeight = '300px',
}: EmbeddedTerminalProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(mode !== 'compact');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const {
    lines,
    isProcessing,
    executeCommand,
    cancelRequest,
    navigateHistory,
    clearTerminal,
    hasApiKey,
  } = useTerminalSession({ 
    loopId, 
    loopName, 
    loopContext,
    onCommand, 
    initialLines 
  });

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      if (input.toLowerCase().trim() === 'clear') {
        clearTerminal();
        setInput('');
      } else {
        executeCommand(input);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevCommand = navigateHistory('up');
      setInput(prevCommand);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCommand = navigateHistory('down');
      setInput(nextCommand);
    } else if (e.key === 'Escape' && isProcessing) {
      cancelRequest();
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  // Quick action handler - executes command when button is clicked
  const handleQuickAction = useCallback((command: string) => {
    if (!isProcessing) {
      executeCommand(command);
    }
  }, [isProcessing, executeCommand]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-emerald-400';
      case 'output': return 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'system': return 'text-amber-400';
      case 'streaming': return 'text-gray-300';
      default: return 'text-gray-400';
    }
  };

  const getLinePrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return '$ ';
      case 'output': return '';
      case 'error': return '✗ ';
      case 'system': return '> ';
      case 'streaming': return '';
      default: return '';
    }
  };

  if (mode === 'compact' && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`terminal-compact flex items-center gap-2 px-3 py-1.5 text-xs ${className}`}
        data-testid={`terminal-expand-${loopId || 'global'}`}
      >
        <Terminal className="w-3 h-3 text-emerald-400" />
        <span className="text-muted-foreground">Terminal</span>
        {lines.length > 0 && (
          <span className="text-emerald-400 font-mono">{lines.length}</span>
        )}
      </button>
    );
  }

  return (
    <div 
      className={`terminal-container flex flex-col ${className}`}
      onClick={focusInput}
      data-testid={`terminal-${loopId || 'global'}`}
    >
      {showHeader && (
        <div className="terminal-header flex items-center justify-between px-3 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono text-muted-foreground">
              {loopName || loopId || 'claude-code'}
            </span>
            {!hasApiKey && (
              <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                No API key
              </span>
            )}
            {isProcessing && (
              <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {isProcessing && (
              <button
                onClick={(e) => { e.stopPropagation(); cancelRequest(); }}
                className="p-1 hover:bg-red-500/10 rounded text-red-400"
                title="Cancel request (Esc)"
                data-testid={`terminal-cancel-${loopId || 'global'}`}
              >
                <Square className="w-3 h-3" />
              </button>
            )}
            {mode === 'compact' && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="p-1 hover:bg-white/5 rounded"
                data-testid={`terminal-minimize-${loopId || 'global'}`}
              >
                <Minimize2 className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {onClose && (
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="p-1 hover:bg-white/5 rounded"
                data-testid={`terminal-close-${loopId || 'global'}`}
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      )}

      <div 
        ref={outputRef}
        className="terminal-output flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed"
        style={{ maxHeight: maxHeight }}
      >
        {lines.length === 0 && (
          <div className="text-muted-foreground/50 italic">
            {hasApiKey 
              ? "Click Status or Context above, or ask Claude anything about this agent..."
              : "No API key configured. Add one in Settings to chat with Claude."}
          </div>
        )}
        {lines.map((line) => (
          <div 
            key={line.id} 
            className={`terminal-line ${getLineColor(line.type)} whitespace-pre-wrap break-words`}
          >
            <span className="opacity-60">{getLinePrefix(line.type)}</span>
            {line.content}
            {line.type === 'streaming' && (
              <span className="terminal-cursor" />
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions - clickable buttons so users don't need to remember commands */}
      <div className="terminal-quick-actions flex items-center gap-1.5 px-3 py-1.5 border-t border-white/5 bg-white/[0.02]">
        <span className="text-[10px] text-muted-foreground/50 mr-1">Quick:</span>
        <button
          onClick={(e) => { e.stopPropagation(); handleQuickAction('status'); }}
          disabled={isProcessing}
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded transition-colors disabled:opacity-50"
          title="Show agent status"
        >
          <Activity className="w-2.5 h-2.5" />
          Status
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleQuickAction('context'); }}
          disabled={isProcessing}
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors disabled:opacity-50"
          title="Show full agent context"
        >
          <Info className="w-2.5 h-2.5" />
          Context
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleQuickAction('help'); }}
          disabled={isProcessing}
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded transition-colors disabled:opacity-50"
          title="Show help"
        >
          <HelpCircle className="w-2.5 h-2.5" />
          Help
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); clearTerminal(); }}
          disabled={isProcessing}
          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
          title="Clear terminal"
        >
          <Trash2 className="w-2.5 h-2.5" />
          Clear
        </button>
      </div>

      <div className="terminal-input-container flex items-center gap-2 px-3 py-2 border-t border-white/5">
        <ChevronRight className="w-3 h-3 text-emerald-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder={isProcessing ? 'Processing... (Esc to cancel)' : 'Ask Claude about this agent...'}
          className="terminal-input flex-1 bg-transparent border-none outline-none text-xs font-mono text-gray-200 placeholder:text-muted-foreground/30"
          autoComplete="off"
          spellCheck={false}
          data-testid={`terminal-input-${loopId || 'global'}`}
        />
      </div>
    </div>
  );
}
