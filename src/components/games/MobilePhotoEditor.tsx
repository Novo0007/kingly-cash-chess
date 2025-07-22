import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlassSurface } from "@/components/ui/glass-surface";
import { SplitText } from "@/components/ui/split-text";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Upload,
  Download,
  RotateCw,
  RotateCcw,
  Crop,
  Palette,
  Sliders,
  Sun,
  Contrast,
  Zap,
  Undo,
  Redo,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  Filter,
  Move,
  ZoomIn,
  ZoomOut,
  Square,
  Circle,
  Type,
  Brush,
  Wand2,
  Scissors,
  Eye,
  EyeOff,
  Layers,
  Music,
  Volume2,
  Play,
  Pause,
  StopCircle,
  Mic,
  FileAudio,
  Headphones,
  Settings,
  Save,
  FolderOpen,
  Trash2,
  Copy,
  MousePointer,
  PaintBucket,
  Eraser,
  Pipette,
  Grid3X3,
  Maximize,
  Minimize,
  RotateCcw as Flip,
  Shuffle,
  Cpu,
  Brain,
  Scan,
  Target,
  Layers3,
  PenTool,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Home,
  Menu,
} from "lucide-react";

export interface MobilePhotoEditorProps {
  onClose?: () => void;
}

interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  filter: string;
  zoom: number;
  panX: number;
  panY: number;
}

interface MusicTrack {
  id: string;
  name: string;
  file: File;
  duration: number;
  volume: number;
  startTime: number;
  loop: boolean;
}

export const MobilePhotoEditor: React.FC<MobilePhotoEditorProps> = ({ onClose }) => {
  const { currentTheme } = useTheme();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [currentTool, setCurrentTool] = useState<string>("adjust");
  const [isEditing, setIsEditing] = useState(false);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [currentAITask, setCurrentAITask] = useState<string>("");
  
  const [editState, setEditState] = useState<EditState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    rotation: 0,
    flipX: false,
    flipY: false,
    filter: "none",
    zoom: 1,
    panX: 0,
    panY: 0,
  });

  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState("#000000");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [textSize, setTextSize] = useState(24);

  // Mobile-optimized tools
  const mobileTools = [
    { id: "adjust", label: "Adjust", icon: Sliders, color: "from-blue-500 to-blue-600" },
    { id: "filters", label: "Filters", icon: Filter, color: "from-purple-500 to-purple-600" },
    { id: "ai", label: "AI Magic", icon: Sparkles, color: "from-pink-500 to-pink-600" },
    { id: "crop", label: "Crop", icon: Crop, color: "from-green-500 to-green-600" },
    { id: "text", label: "Text", icon: Type, color: "from-indigo-500 to-indigo-600" },
    { id: "music", label: "Music", icon: Music, color: "from-orange-500 to-orange-600" },
  ];

  const aiTools = [
    { id: "remove-bg", label: "Remove BG", icon: Scissors, description: "Smart background removal" },
    { id: "enhance", label: "AI Enhance", icon: Sparkles, description: "Auto improve quality" },
    { id: "style-transfer", label: "Art Style", icon: Wand2, description: "Apply artistic effects" },
    { id: "colorize", label: "Colorize", icon: Palette, description: "Add colors to B&W" },
    { id: "upscale", label: "HD Boost", icon: Maximize, description: "Increase resolution" },
    { id: "object-detect", label: "Smart Crop", icon: Scan, description: "Focus on subjects" },
  ];

  const filters = [
    { id: "none", name: "Original", filter: "none", preview: "🖼️" },
    { id: "grayscale", name: "B&W", filter: "grayscale(100%)", preview: "⬜" },
    { id: "sepia", name: "Vintage", filter: "sepia(100%)", preview: "🟤" },
    { id: "warm", name: "Warm", filter: "hue-rotate(20deg) saturate(130%)", preview: "🟠" },
    { id: "cool", name: "Cool", filter: "hue-rotate(180deg) saturate(120%)", preview: "🔵" },
    { id: "dramatic", name: "Drama", filter: "contrast(150%) brightness(90%)", preview: "⚡" },
    { id: "soft", name: "Soft", filter: "blur(0.5px) brightness(110%)", preview: "☁️" },
    { id: "neon", name: "Neon", filter: "contrast(200%) saturate(200%)", preview: "🌈" },
  ];

  // Calculate optimal canvas dimensions
  const calculateCanvasDimensions = useCallback((img: HTMLImageElement) => {
    if (!containerRef.current) return { width: 300, height: 300 };

    const container = containerRef.current;
    const containerWidth = container.clientWidth - 32; // padding
    const containerHeight = window.innerHeight * 0.5; // 50% of screen height
    
    const imgAspectRatio = img.width / img.height;
    
    let displayWidth = containerWidth;
    let displayHeight = containerWidth / imgAspectRatio;
    
    // If height exceeds container, scale by height
    if (displayHeight > containerHeight) {
      displayHeight = containerHeight;
      displayWidth = containerHeight * imgAspectRatio;
    }
    
    return {
      width: Math.floor(displayWidth),
      height: Math.floor(displayHeight)
    };
  }, []);

  // Setup canvas with proper scaling
  const setupCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    if (!canvas || !originalCanvas) return;

    // Store original dimensions
    setOriginalDimensions({ width: img.width, height: img.height });
    
    // Set up original quality canvas (full resolution)
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    const originalCtx = originalCanvas.getContext("2d");
    if (originalCtx) {
      originalCtx.imageSmoothingEnabled = true;
      originalCtx.imageSmoothingQuality = "high";
      originalCtx.drawImage(img, 0, 0);
    }

    // Calculate and set display dimensions
    const dimensions = calculateCanvasDimensions(img);
    setDisplayDimensions(dimensions);
    
    // Set up display canvas
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    
    // Draw image to display canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, [calculateCanvasDimensions]);

  // Apply edits to canvas
  const applyEdits = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply transformations
    ctx.save();
    
    // Move to center for rotations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // Apply rotation
    ctx.rotate((editState.rotation * Math.PI) / 180);
    
    // Apply flip
    ctx.scale(editState.flipX ? -1 : 1, editState.flipY ? -1 : 1);
    
    // Apply zoom and pan
    ctx.scale(editState.zoom, editState.zoom);
    ctx.translate(editState.panX, editState.panY);
    
    // Apply CSS filters via canvas
    const filterString = [
      `brightness(${100 + editState.brightness}%)`,
      `contrast(${100 + editState.contrast}%)`,
      `saturate(${100 + editState.saturation}%)`,
      `hue-rotate(${editState.hue}deg)`,
      editState.filter !== "none" ? editState.filter : "",
    ].filter(Boolean).join(" ");
    
    ctx.filter = filterString;
    
    // Draw image
    ctx.drawImage(
      originalImage,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );
    
    ctx.restore();
  }, [originalImage, editState]);

  // AI Processing simulation
  const processAI = useCallback(async (tool: string) => {
    setIsAIProcessing(true);
    setCurrentAITask(tool);
    setAiProgress(0);
    setShowBottomSheet(false);
    
    // Simulate progress
    for (let i = 0; i <= 100; i += 5) {
      setAiProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Apply AI effect
    switch (tool) {
      case "remove-bg":
        setEditState(prev => ({ ...prev, filter: "none" }));
        break;
      case "enhance":
        setEditState(prev => ({
          ...prev,
          brightness: 10,
          contrast: 15,
          saturation: 20
        }));
        break;
      case "style-transfer":
        setEditState(prev => ({
          ...prev,
          filter: "contrast(130%) saturate(150%) sepia(20%)"
        }));
        break;
      case "colorize":
        setEditState(prev => ({
          ...prev,
          filter: "sepia(50%) saturate(200%) hue-rotate(180deg)"
        }));
        break;
      case "upscale":
        setEditState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.5, 3) }));
        break;
    }
    
    setIsAIProcessing(false);
    setCurrentAITask("");
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setIsEditing(true);
        setupCanvas(img);
        
        // Reset edit state
        setEditState({
          brightness: 0,
          contrast: 0,
          saturation: 0,
          hue: 0,
          rotation: 0,
          flipX: false,
          flipY: false,
          filter: "none",
          zoom: 1,
          panX: 0,
          panY: 0,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [setupCanvas]);

  // Music handling
  const handleMusicUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const track: MusicTrack = {
      id: Date.now().toString(),
      name: file.name.split('.')[0],
      file,
      duration: 0,
      volume: 0.7,
      startTime: 0,
      loop: false,
    };

    setMusicTracks(prev => [...prev, track]);
  }, []);

  const playMusic = useCallback((trackId: string) => {
    const track = musicTracks.find(t => t.id === trackId);
    if (!track || !audioRef.current) return;

    const url = URL.createObjectURL(track.file);
    audioRef.current.src = url;
    audioRef.current.volume = track.volume;
    audioRef.current.loop = track.loop;
    audioRef.current.play();
    
    setCurrentTrack(trackId);
    setIsPlaying(true);
  }, [musicTracks]);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack("");
  }, []);

  // High-quality export
  const exportImage = useCallback(() => {
    const originalCanvas = originalCanvasRef.current;
    if (!originalCanvas || !originalImage) return;

    // Create export canvas with original dimensions
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = originalDimensions.width;
    exportCanvas.height = originalDimensions.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    // Apply all transformations at original resolution
    exportCtx.save();
    exportCtx.translate(exportCanvas.width / 2, exportCanvas.height / 2);
    exportCtx.rotate((editState.rotation * Math.PI) / 180);
    exportCtx.scale(editState.flipX ? -1 : 1, editState.flipY ? -1 : 1);
    
    // Apply filters
    const filterString = [
      `brightness(${100 + editState.brightness}%)`,
      `contrast(${100 + editState.contrast}%)`,
      `saturate(${100 + editState.saturation}%)`,
      `hue-rotate(${editState.hue}deg)`,
      editState.filter !== "none" ? editState.filter : "",
    ].filter(Boolean).join(" ");
    
    exportCtx.filter = filterString;
    exportCtx.drawImage(
      originalImage,
      -exportCanvas.width / 2,
      -exportCanvas.height / 2,
      exportCanvas.width,
      exportCanvas.height
    );
    
    exportCtx.restore();
    
    // Export with maximum quality
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-edited-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png", 1.0);
  }, [originalDimensions, editState, originalImage]);

  // Apply edits when state changes
  useEffect(() => {
    if (originalImage && isEditing) {
      applyEdits();
    }
  }, [editState, originalImage, isEditing, applyEdits]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (originalImage && isEditing) {
        setupCanvas(originalImage);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [originalImage, isEditing, setupCanvas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="rounded-full w-10 h-10 p-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">AI Photo Studio</span>
        </div>
        
        <Button
          onClick={exportImage}
          disabled={!isEditing}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 text-sm"
        >
          <Download className="w-4 h-4 mr-1" />
          Save
        </Button>
      </div>

      {/* Upload Section */}
      {!isEditing && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Upload Photo</h3>
                  <p className="text-gray-600 text-sm">
                    Choose a photo to start creating amazing edits with AI
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Photo
                  </Button>
                  
                  <Button
                    onClick={() => audioInputRef.current?.click()}
                    variant="outline"
                    className="w-full py-3 border-2 border-gray-200 rounded-2xl"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Add Music
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Interface */}
      {isEditing && (
        <div className="flex-1 flex flex-col">
          {/* Canvas Container */}
          <div ref={containerRef} className="flex-1 flex items-center justify-center p-4 relative">
            {isAIProcessing && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl mx-4">
                <div className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">AI Processing</h4>
                      <p className="text-sm text-gray-600 mt-1">{currentAITask}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                          style={{ width: `${aiProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{aiProgress}% complete</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="canvas-container">
              <canvas
                ref={canvasRef}
                className="responsive-canvas rounded-2xl shadow-lg border-4 border-white"
                style={{
                  width: displayDimensions.width,
                  height: displayDimensions.height,
                  imageRendering: "high-quality"
                }}
              />
              
              {/* Zoom Controls */}
              {editState.zoom !== 1 && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setEditState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.2, 0.5) }))}
                      variant="ghost"
                      size="sm"
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-medium">{Math.round(editState.zoom * 100)}%</span>
                    <Button
                      onClick={() => setEditState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.2, 3) }))}
                      variant="ghost"
                      size="sm"
                      className="rounded-full w-8 h-8 p-0"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Tools Bar */}
          <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200/50 p-4">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {mobileTools.map((tool) => (
                <Button
                  key={tool.id}
                  onClick={() => {
                    setCurrentTool(tool.id);
                    setShowBottomSheet(true);
                  }}
                  variant="ghost"
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[70px] ${
                    currentTool === tool.id 
                      ? `bg-gradient-to-br ${tool.color} text-white shadow-lg` 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tool.icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{tool.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet */}
      {showBottomSheet && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setShowBottomSheet(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[70vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 capitalize">{currentTool}</h3>
              <Button
                onClick={() => setShowBottomSheet(false)}
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* Adjust Controls */}
              {currentTool === "adjust" && (
                <div className="space-y-6">
                  {[
                    { key: "brightness", label: "Brightness", min: -100, max: 100, icon: Sun },
                    { key: "contrast", label: "Contrast", min: -100, max: 100, icon: Contrast },
                    { key: "saturation", label: "Saturation", min: -100, max: 100, icon: Palette },
                    { key: "hue", label: "Hue", min: -180, max: 180, icon: Zap },
                  ].map((control) => (
                    <div key={control.key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <control.icon className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{control.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {editState[control.key as keyof EditState]}{control.key === "hue" ? "°" : ""}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={control.min}
                        max={control.max}
                        value={editState[control.key as keyof EditState] as number}
                        onChange={(e) => setEditState(prev => ({ 
                          ...prev, 
                          [control.key]: parseInt(e.target.value) 
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button
                      onClick={() => setEditState(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                      variant="outline"
                      className="flex items-center gap-2 py-3 rounded-xl"
                    >
                      <RotateCw className="w-4 h-4" />
                      Rotate
                    </Button>
                    <Button
                      onClick={() => setEditState(prev => ({ ...prev, flipX: !prev.flipX }))}
                      variant="outline"
                      className="flex items-center gap-2 py-3 rounded-xl"
                    >
                      <Move className="w-4 h-4" />
                      Flip
                    </Button>
                  </div>
                </div>
              )}

              {/* AI Tools */}
              {currentTool === "ai" && (
                <div className="grid grid-cols-2 gap-4">
                  {aiTools.map((tool) => (
                    <Button
                      key={tool.id}
                      onClick={() => processAI(tool.id)}
                      disabled={isAIProcessing}
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-center gap-3 text-left rounded-2xl border-2 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{tool.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{tool.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}

              {/* Filters */}
              {currentTool === "filters" && (
                <div className="grid grid-cols-4 gap-3">
                  {filters.map((filter) => (
                    <Button
                      key={filter.id}
                      onClick={() => setEditState(prev => ({ ...prev, filter: filter.filter }))}
                      variant="outline"
                      className={`p-3 h-auto flex flex-col items-center gap-2 rounded-2xl border-2 ${
                        editState.filter === filter.filter
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl">{filter.preview}</div>
                      <span className="text-xs font-medium text-gray-900">{filter.name}</span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Music */}
              {currentTool === "music" && (
                <div className="space-y-4">
                  <Button
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl"
                  >
                    <FileAudio className="w-5 h-5 mr-2" />
                    Add Music Track
                  </Button>
                  
                  <div className="space-y-3">
                    {musicTracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Button
                          onClick={() => currentTrack === track.id ? stopMusic() : playMusic(track.id)}
                          variant="outline"
                          size="sm"
                          className="rounded-full w-10 h-10 p-0"
                        >
                          {currentTrack === track.id && isPlaying ? 
                            <Pause className="w-4 h-4" /> : 
                            <Play className="w-4 h-4" />
                          }
                        </Button>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{track.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Volume2 className="w-3 h-3 text-gray-500" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={track.volume}
                              onChange={(e) => {
                                const newVolume = parseFloat(e.target.value);
                                setMusicTracks(prev => 
                                  prev.map(t => t.id === track.id ? { ...t, volume: newVolume } : t)
                                );
                                if (audioRef.current && currentTrack === track.id) {
                                  audioRef.current.volume = newVolume;
                                }
                              }}
                              className="flex-1 h-1"
                            />
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => setMusicTracks(prev => prev.filter(t => t.id !== track.id))}
                          variant="ghost"
                          size="sm"
                          className="rounded-full w-8 h-8 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {musicTracks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Headphones className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No music tracks added</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Hidden elements */}
      <canvas ref={originalCanvasRef} className="hidden" />
      <canvas ref={hiddenCanvasRef} className="hidden" />
      <audio ref={audioRef} />
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={handleMusicUpload}
        className="hidden"
      />
    </div>
  );
};
