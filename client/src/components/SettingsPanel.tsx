import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, X, Key, CheckCircle, AlertCircle, 
  Loader2, Eye, EyeOff, ExternalLink, Sun, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApiKey } from '@/hooks/useApiKey';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { 
    isConfigured, 
    isValidating, 
    validationError, 
    validateAndSaveKey, 
    clearKey,
    apiKey 
  } = useApiKey();
  const { theme, setTheme } = useTheme();
  
  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    const success = await validateAndSaveKey(inputKey);
    if (success) {
      setSaveSuccess(true);
      setInputKey('');
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleClear = () => {
    clearKey();
    setInputKey('');
  };

  const maskedKey = apiKey 
    ? `${apiKey.slice(0, 10)}${'•'.repeat(20)}${apiKey.slice(-4)}`
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] max-w-[90vw]"
          >
            <div className="hud-panel hud-corner-tl hud-corner-br">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Settings
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                  data-testid="close-settings"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-medium text-foreground uppercase tracking-wider">
                      Anthropic API Key
                    </h3>
                    {isConfigured && (
                      <Badge variant="outline" className="text-[8px] text-emerald-400 border-emerald-500/50">
                        <CheckCircle className="w-2 h-2 mr-1" />
                        CONFIGURED
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground mb-3">
                    Enter your Anthropic API key to enable real Claude conversations in terminals.
                    Your key is stored locally in your browser and never sent to our servers.
                  </p>

                  {isConfigured ? (
                    <div className="space-y-3">
                      <div className="p-3 rounded border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs text-emerald-400">API key configured</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowKey(!showKey)}
                            className="h-6 px-2 text-[10px]"
                            data-testid="toggle-key-visibility"
                          >
                            {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                        <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                          {showKey ? apiKey : maskedKey}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="text-xs text-red-400 border-red-500/30 hover:bg-red-500/10"
                        data-testid="clear-api-key"
                      >
                        Remove API Key
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          type={showKey ? 'text' : 'password'}
                          placeholder="sk-ant-api03-..."
                          value={inputKey}
                          onChange={(e) => setInputKey(e.target.value)}
                          className="pr-10 font-mono text-xs bg-muted border-border"
                          data-testid="api-key-input"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          data-testid="toggle-input-visibility"
                        >
                          {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>

                      {validationError && (
                        <div className="flex items-center gap-2 text-[11px] text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          {validationError}
                        </div>
                      )}

                      {saveSuccess && (
                        <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                          <CheckCircle className="w-3 h-3" />
                          API key saved successfully!
                        </div>
                      )}

                      <Button
                        onClick={handleSave}
                        disabled={isValidating || !inputKey.trim()}
                        className="w-full"
                        data-testid="save-api-key"
                      >
                        {isValidating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          'Save API Key'
                        )}
                      </Button>
                    </div>
                  )}

                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-3 text-[10px] text-primary hover:underline"
                  >
                    Get an API key from Anthropic
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-400" />
                    )}
                    <h3 className="text-xs font-medium text-foreground uppercase tracking-wider">
                      Appearance
                    </h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                      className="flex-1 text-xs"
                      data-testid="theme-dark"
                    >
                      <Moon className="w-3 h-3 mr-1.5" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                      className="flex-1 text-xs"
                      data-testid="theme-light"
                    >
                      <Sun className="w-3 h-3 mr-1.5" />
                      Light
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-xs font-medium text-foreground uppercase tracking-wider mb-2">
                    Model Configuration
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Loom uses <span className="text-primary font-mono">claude-sonnet-4-20250514</span> for 
                    optimal balance of speed and capability.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
