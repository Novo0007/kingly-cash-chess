import React from "react";
import { Button } from "@/components/ui/button";
import { GlassSurface } from "@/components/ui/glass-surface";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Cpu,
  Zap,
  Sparkles,
  Eye,
  Scissors,
  Palette,
  Wand2,
  Target,
  Scan,
  Maximize,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export interface AIProcessorProps {
  isProcessing: boolean;
  currentTask?: string;
  onCancel?: () => void;
  progress?: number;
}

interface AITask {
  id: string;
  name: string;
  description: string;
  icon: any;
  estimatedTime: number;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "processing" | "completed" | "error";
}

export const AIProcessor: React.FC<AIProcessorProps> = ({
  isProcessing,
  currentTask,
  onCancel,
  progress = 0,
}) => {
  const aiTasks: AITask[] = [
    {
      id: "remove-bg",
      name: "Background Removal",
      description: "Intelligently detecting and removing background elements",
      icon: Scissors,
      estimatedTime: 3000,
      difficulty: "medium",
      status: currentTask === "remove-bg" ? "processing" : "pending",
    },
    {
      id: "object-detect",
      name: "Object Detection",
      description: "Analyzing image content and identifying objects",
      icon: Scan,
      estimatedTime: 2000,
      difficulty: "easy",
      status: currentTask === "object-detect" ? "processing" : "pending",
    },
    {
      id: "style-transfer",
      name: "Style Transfer",
      description: "Applying artistic neural style transformations",
      icon: Wand2,
      estimatedTime: 5000,
      difficulty: "hard",
      status: currentTask === "style-transfer" ? "processing" : "pending",
    },
    {
      id: "enhance",
      name: "AI Enhancement",
      description: "Optimizing image quality using machine learning",
      icon: Sparkles,
      estimatedTime: 2500,
      difficulty: "medium",
      status: currentTask === "enhance" ? "processing" : "pending",
    },
    {
      id: "colorize",
      name: "Auto Colorization",
      description: "Adding realistic colors to black and white images",
      icon: Palette,
      estimatedTime: 4000,
      difficulty: "hard",
      status: currentTask === "colorize" ? "processing" : "pending",
    },
    {
      id: "upscale",
      name: "Super Resolution",
      description: "Increasing image resolution using AI upscaling",
      icon: Maximize,
      estimatedTime: 6000,
      difficulty: "hard",
      status: currentTask === "upscale" ? "processing" : "pending",
    },
  ];

  const currentAITask = aiTasks.find(task => task.id === currentTask);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing": return <Clock className="w-4 h-4 animate-spin" />;
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error": return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  if (!isProcessing && !currentTask) return null;

  return (
    <GlassSurface className="p-6 rounded-2xl max-w-md mx-auto" blur="md" opacity={0.1}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Brain className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI Processing</h3>
          <p className="text-sm text-muted-foreground">Neural network analysis in progress</p>
        </div>
      </div>

      {/* Current Task */}
      {currentAITask && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <currentAITask.icon className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-foreground">{currentAITask.name}</h4>
                <Badge className={getDifficultyColor(currentAITask.difficulty)}>
                  {currentAITask.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentAITask.description}</p>
            </div>
            {getStatusIcon(currentAITask.status)}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Processing Steps */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-foreground">Processing Steps:</h5>
            <div className="space-y-1">
              {[
                "Loading neural network model",
                "Preprocessing image data",
                "Running inference pipeline",
                "Post-processing results",
                "Applying transformations"
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    progress > (index + 1) * 20 
                      ? "bg-green-500" 
                      : progress > index * 20 
                        ? "bg-blue-500 animate-pulse" 
                        : "bg-gray-300"
                  }`} />
                  <span className={
                    progress > (index + 1) * 20 
                      ? "text-green-600" 
                      : progress > index * 20 
                        ? "text-blue-600" 
                        : "text-muted-foreground"
                  }>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Cpu className="w-5 h-5 mx-auto mb-1 text-blue-600" />
          <div className="text-xs font-medium text-foreground">GPU</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
          <div className="text-xs font-medium text-foreground">Speed</div>
          <div className="text-xs text-muted-foreground">Fast</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Eye className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <div className="text-xs font-medium text-foreground">Quality</div>
          <div className="text-xs text-muted-foreground">High</div>
        </div>
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full"
          disabled={!isProcessing}
        >
          Cancel Processing
        </Button>
      )}

      {/* Fun Facts */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-800">AI Fact</span>
        </div>
        <p className="text-xs text-purple-700">
          Modern AI models can process millions of pixels in seconds, analyzing complex patterns 
          that would take humans hours to identify manually.
        </p>
      </div>
    </GlassSurface>
  );
};

// Utility functions for AI processing simulation
export const simulateAIProgress = (
  onProgress: (progress: number) => void,
  duration: number = 3000
): Promise<void> => {
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        onProgress(progress);
        clearInterval(interval);
        setTimeout(resolve, 500);
      } else {
        onProgress(progress);
      }
    }, duration / 20);
  });
};

export const getAIProcessingTime = (taskId: string): number => {
  const times: Record<string, number> = {
    "remove-bg": 3000,
    "object-detect": 2000,
    "style-transfer": 5000,
    "enhance": 2500,
    "colorize": 4000,
    "upscale": 6000,
  };
  return times[taskId] || 3000;
};
