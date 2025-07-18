import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal, Play, Trash2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface TerminalLine {
  type: "input" | "output" | "error" | "system";
  content: string;
  timestamp?: number;
}

interface CodeTerminalProps {
  onExecute?: (
    command: string,
  ) => Promise<string | { output: string; error?: string }>;
  initialMessage?: string;
  disabled?: boolean;
  className?: string;
}

export const CodeTerminal: React.FC<CodeTerminalProps> = ({
  onExecute,
  initialMessage = "Welcome to Code Terminal! Type your commands below.",
  disabled = false,
  className = "",
}) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "system",
      content: initialMessage,
      timestamp: Date.now(),
    },
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when terminal is clicked
  useEffect(() => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const addLine = (line: TerminalLine) => {
    setLines((prev) => [...prev, { ...line, timestamp: Date.now() }]);
  };

  const handleExecute = async () => {
    if (!currentInput.trim() || isExecuting) return;

    const command = currentInput.trim();

    // Add input to terminal
    addLine({
      type: "input",
      content: `$ ${command}`,
    });

    // Add to command history
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setCurrentInput("");
    setIsExecuting(true);

    try {
      if (onExecute) {
        const result = await onExecute(command);

        if (typeof result === "string") {
          addLine({
            type: "output",
            content: result,
          });
        } else {
          if (result.output) {
            addLine({
              type: "output",
              content: result.output,
            });
          }
          if (result.error) {
            addLine({
              type: "error",
              content: result.error,
            });
          }
        }
      } else {
        // Default behavior for common commands
        await handleDefaultCommands(command);
      }
    } catch (error) {
      addLine({
        type: "error",
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDefaultCommands = async (command: string): Promise<void> => {
    const cmd = command.toLowerCase().trim();

    // Simulate command execution delay
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 700),
    );

    switch (cmd) {
      case "help":
        addLine({
          type: "output",
          content: `Available commands:
• help - Show this help message
• clear - Clear the terminal
• echo [text] - Print text to terminal
• date - Show current date and time
• whoami - Show current user
• pwd - Show current directory
• ls - List directory contents`,
        });
        break;

      case "clear":
        setLines([
          {
            type: "system",
            content: initialMessage,
            timestamp: Date.now(),
          },
        ]);
        break;

      case "date":
        addLine({
          type: "output",
          content: new Date().toLocaleString(),
        });
        break;

      case "whoami":
        addLine({
          type: "output",
          content: "codelearner",
        });
        break;

      case "pwd":
        addLine({
          type: "output",
          content: "/home/codelearner/workspace",
        });
        break;

      case "ls":
        addLine({
          type: "output",
          content: `total 4
drwxr-xr-x 2 codelearner codelearner 4096 $(date +%b) $(date +%d) $(date +%H:%M) .
drwxr-xr-x 3 codelearner codelearner 4096 $(date +%b) $(date +%d) $(date +%H:%M) ..
-rw-r--r-- 1 codelearner codelearner  123 $(date +%b) $(date +%d) $(date +%H:%M) main.py
-rw-r--r-- 1 codelearner codelearner   45 $(date +%b) $(date +%d) $(date +%H:%M) README.md`,
        });
        break;

      default:
        if (cmd.startsWith("echo ")) {
          const text = command.substring(5);
          addLine({
            type: "output",
            content: text,
          });
        } else if (
          cmd.startsWith("python ") ||
          cmd.startsWith("node ") ||
          cmd.startsWith("java ")
        ) {
          addLine({
            type: "output",
            content: "Code execution simulated successfully! ✅",
          });
        } else {
          addLine({
            type: "error",
            content: `Command '${command}' not found. Type 'help' for available commands.`,
          });
        }
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput("");
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const clearTerminal = () => {
    setLines([
      {
        type: "system",
        content: initialMessage,
        timestamp: Date.now(),
      },
    ]);
  };

  const copyTerminalContent = async () => {
    const content = lines.map((line) => line.content).join("\n");
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Terminal content copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input":
        return "text-cyan-400";
      case "output":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "system":
        return "text-yellow-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <Card className={`bg-gray-900 border-gray-700 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Terminal className="w-5 h-5" />
            Code Terminal
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={copyTerminalContent}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={clearTerminal}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="h-64 overflow-y-auto bg-black/50 px-4 py-2 font-mono text-sm"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, index) => (
            <div
              key={index}
              className={`${getLineColor(line.type)} leading-relaxed`}
            >
              <pre className="whitespace-pre-wrap font-mono">
                {line.content}
              </pre>
            </div>
          ))}

          {/* Current input line */}
          {!disabled && (
            <div className="flex items-center text-cyan-400 mt-1">
              <span className="mr-2">$</span>
              <Input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none text-cyan-400 font-mono text-sm p-0 h-auto focus:ring-0 placeholder:text-gray-500"
                placeholder={isExecuting ? "Executing..." : "Type a command..."}
                disabled={disabled || isExecuting}
                autoComplete="off"
              />
            </div>
          )}
        </div>

        {/* Input Controls */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-gray-400 font-mono text-sm">$</span>
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border-gray-600 text-white font-mono text-sm focus:border-cyan-400"
                placeholder={
                  isExecuting ? "Executing..." : "Type your command here..."
                }
                disabled={disabled || isExecuting}
                autoComplete="off"
              />
            </div>
            <Button
              onClick={handleExecute}
              disabled={disabled || isExecuting || !currentInput.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Play className="w-4 h-4 mr-1" />
              Run
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>Press Enter to execute</span>
            <span>↑/↓ for command history</span>
            <span>{commandHistory.length} commands in history</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
