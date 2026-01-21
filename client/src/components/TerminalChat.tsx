import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus, Send, Clock, Pencil, Terminal, Bot, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TerminalChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockConversations = [
  { id: '1', title: 'Debug convoy orchestration', date: 'Today' },
  { id: '2', title: 'Implement bead handoff logic', date: 'Yesterday' },
  { id: '3', title: 'Fix Mayor coordination issue', date: '2 days ago' },
];

export function TerminalChat({ isOpen, onClose }: TerminalChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [askBeforeEdits, setAskBeforeEdits] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        "I'll analyze the convoy orchestration patterns and identify any bottlenecks in the handoff chain.",
        "Looking at the current bead assignments... I see 3 Polecats are waiting on upstream dependencies.",
        "The Mayor has queued this task. I'll coordinate with the assigned agents to optimize the workflow.",
        "Scanning the rig for potential conflicts... All agents are properly synchronized.",
        "I've identified the issue. The hook state wasn't being persisted correctly between handoffs.",
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 bottom-0 right-0 w-[420px] bg-[#1a1c23]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50 flex flex-col" 
      data-testid="terminal-chat"
    >
      {/* Tactical Corner Markers */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50 z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50 z-10" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50 z-10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50 z-10" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-foreground">Gas Town Terminal</span>
          </div>
          <Badge variant="outline" className="rounded-none text-[8px] border-primary/30 text-primary">
            ONLINE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-white/5 text-muted-foreground hover:text-foreground rounded-none"
            data-testid="new-chat"
          >
            <Plus className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 hover:bg-white/5 text-muted-foreground hover:text-foreground rounded-none"
            data-testid="close-terminal"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Past Conversations Dropdown */}
      <div className="px-4 py-2 border-b border-white/5">
        <button 
          onClick={() => setShowConversations(!showConversations)}
          className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          data-testid="past-conversations-toggle"
        >
          <Clock className="w-3 h-3" />
          <span className="uppercase tracking-wider">Past Conversations</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showConversations ? 'rotate-180' : ''}`} />
        </button>
        
        {showConversations && (
          <div className="mt-2 space-y-1" data-testid="conversation-list">
            {mockConversations.map(conv => (
              <button 
                key={conv.id}
                className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-primary/50"
                data-testid={`conversation-${conv.id}`}
              >
                <div className="text-xs font-mono text-foreground">{conv.title}</div>
                <div className="text-[10px] font-mono text-muted-foreground">{conv.date}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <span className="text-sm font-mono uppercase tracking-widest text-primary">Gas Town Terminal</span>
              </div>
              
              <div className="w-20 h-20 mx-auto my-6 flex items-center justify-center border border-white/10 bg-white/[0.02]">
                <Bot className="w-10 h-10 text-primary/60" />
              </div>
            </div>
            
            <p className="text-xs font-mono text-muted-foreground mb-1">
              Create a <span className="text-primary">GASTOWN.md</span> file for instructions
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/60">
              The Mayor will read every single time.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${msg.id}`}
              >
                <div 
                  className={`max-w-[85%] px-3 py-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary/10 text-foreground border border-primary/20' 
                      : 'bg-white/[0.02] text-foreground border border-white/5'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-primary">
                      <Bot className="w-3 h-3" />
                      <span>Gas Town</span>
                    </div>
                  )}
                  <p className="text-xs font-mono leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start" data-testid="typing-indicator">
                <div className="bg-white/[0.02] text-muted-foreground px-3 py-2 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-primary">
                    <Bot className="w-3 h-3" />
                    <span>Gas Town</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-white/5 bg-white/[0.02]">
        <div className="px-3 py-2 text-[10px] font-mono text-muted-foreground/60 flex items-center gap-2 border-b border-white/5">
          <span className="text-primary/40">ESC</span>
          <span>to focus or unfocus terminal</span>
          <button 
            className="ml-auto flex items-center gap-1 hover:text-muted-foreground transition-colors"
            data-testid="command-history"
          >
            <Clock className="w-3 h-3" />
          </button>
          <span className="text-primary/40">/</span>
        </div>
        
        <div className="p-3">
          <div className="flex items-center gap-2 bg-[#0d0f12] border border-white/10 px-3 py-2 focus-within:border-primary/50 transition-colors">
            <button 
              onClick={() => setAskBeforeEdits(!askBeforeEdits)}
              className={`flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-1 transition-colors ${
                askBeforeEdits ? 'bg-white/5 text-foreground border border-white/10' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="ask-before-edits"
            >
              <Pencil className="w-3 h-3" />
              <span>Ask before edits</span>
            </button>
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter command..."
              className="flex-1 bg-transparent border-none outline-none text-foreground text-xs placeholder:text-muted-foreground/40 font-mono"
              data-testid="chat-input"
            />
            
            <Button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              size="icon"
              className={`h-7 w-7 rounded-none transition-colors ${
                inputValue.trim() 
                  ? 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30' 
                  : 'bg-white/5 text-muted-foreground border border-white/10 cursor-not-allowed'
              }`}
              data-testid="send-message"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
