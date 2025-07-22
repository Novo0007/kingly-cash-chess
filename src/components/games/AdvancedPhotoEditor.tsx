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
  Shapes,
  Text,
} from "lucide-react";

export interface AdvancedPhotoEditorProps {
  onClose?: () => void;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  canvas: HTMLCanvasElement;
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
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  zoom: number;
  panX: number;
  panY: number;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
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

interface HistoryState {
  imageData: ImageData;
  editState: EditState;
  layers: Layer[];
  textOverlays: TextOverlay[];
}

export const AdvancedPhotoEditor: React.FC<AdvancedPhotoEditorProps> = ({ onClose }) => {
  const { currentTheme } = useTheme();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [currentTool, setCurrentTool] = useState<string>("adjust");
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [currentLayer, setCurrentLayer] = useState<string>("");
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string>("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  
  const [editState, setEditState] = useState<EditState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    rotation: 0,
    flipX: false,
    flipY: false,
    filter: "none",
    crop: null,
    zoom: 1,
    panX: 0,
    panY: 0,
  });

  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState("#000000");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [textSize, setTextSize] = useState(24);

  const advancedTools = [
    { id: "adjust", label: "Adjust", icon: Sliders, color: "blue" },
    { id: "filters", label: "Filters", icon: Filter, color: "purple" },
    { id: "crop", label: "Crop", icon: Crop, color: "green" },
    { id: "brush", label: "Brush", icon: Brush, color: "red" },
    { id: "text", label: "Text", icon: Type, color: "indigo" },
    { id: "shapes", label: "Shapes", icon: Shapes, color: "pink" },
    { id: "ai", label: "AI Tools", icon: Cpu, color: "cyan" },
    { id: "music", label: "Music", icon: Music, color: "orange" },
  ];

  const aiTools = [
    { id: "remove-bg", label: "Remove Background", icon: Scissors, description: "AI-powered background removal" },
    { id: "object-detect", label: "Object Detection", icon: Scan, description: "Detect and highlight objects" },
    { id: "style-transfer", label: "Style Transfer", icon: Wand2, description: "Apply artistic styles" },
    { id: "enhance", label: "AI Enhance", icon: Sparkles, description: "Auto-enhance image quality" },
    { id: "colorize", label: "Colorize", icon: Palette, description: "Add colors to B&W photos" },
    { id: "upscale", label: "Super Resolution", icon: Maximize, description: "AI upscaling for better quality" },
  ];

  const filters = [
    { id: "none", name: "Original", filter: "none" },
    { id: "grayscale", name: "B&W", filter: "grayscale(100%)" },
    { id: "sepia", name: "Sepia", filter: "sepia(100%)" },
    { id: "vintage", name: "Vintage", filter: "sepia(50%) contrast(120%) brightness(110%)" },
    { id: "cool", name: "Cool", filter: "hue-rotate(180deg) saturate(120%)" },
    { id: "warm", name: "Warm", filter: "hue-rotate(20deg) saturate(130%)" },
    { id: "dramatic", name: "Drama", filter: "contrast(150%) brightness(90%) saturate(120%)" },
    { id: "soft", name: "Soft", filter: "blur(0.5px) brightness(110%)" },
    { id: "neon", name: "Neon", filter: "contrast(200%) brightness(150%) saturate(200%) hue-rotate(90deg)" },
    { id: "cyberpunk", name: "Cyberpunk", filter: "contrast(150%) saturate(180%) hue-rotate(270deg)" },
  ];

  const fonts = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana", "Impact", "Comic Sans MS"];

  // Preserve original dimensions and quality
  const setupCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    if (!canvas || !originalCanvas) return;

    // Store original dimensions
    setOriginalDimensions({ width: img.width, height: img.height });
    
    // Set up original quality canvas
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    const originalCtx = originalCanvas.getContext("2d");
    if (originalCtx) {
      originalCtx.drawImage(img, 0, 0);
    }

    // Set up display canvas with appropriate scaling
    const maxDisplayWidth = isMobile ? 350 : 800;
    const maxDisplayHeight = isMobile ? 500 : 600;
    
    let displayWidth = img.width;
    let displayHeight = img.height;
    
    if (displayWidth > maxDisplayWidth) {
      displayHeight = (displayHeight * maxDisplayWidth) / displayWidth;
      displayWidth = maxDisplayWidth;
    }
    
    if (displayHeight > maxDisplayHeight) {
      displayWidth = (displayWidth * maxDisplayHeight) / displayHeight;
      displayHeight = maxDisplayHeight;
    }
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // Create initial layer
    const initialLayer: Layer = {
      id: "background",
      name: "Background",
      visible: true,
      opacity: 100,
      blendMode: "normal",
      canvas: document.createElement("canvas"),
    };
    
    initialLayer.canvas.width = img.width;
    initialLayer.canvas.height = img.height;
    const layerCtx = initialLayer.canvas.getContext("2d");
    if (layerCtx) {
      layerCtx.drawImage(img, 0, 0);
    }
    
    setLayers([initialLayer]);
    setCurrentLayer("background");
  }, [isMobile]);

  // AI Processing functions (simulated)
  const processAI = useCallback(async (tool: string) => {
    setIsAIProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    if (!canvasRef.current || !originalImage) {
      setIsAIProcessing(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsAIProcessing(false);
      return;
    }

    switch (tool) {
      case "remove-bg":
        // Simulate background removal by applying a mask effect
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        // Create a rough edge effect
        for (let i = 0; i < 20; i++) {
          ctx.beginPath();
          ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 50 + 10,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        break;
        
      case "object-detect":
        // Draw detection boxes
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        
        // Simulate object detection boxes
        const boxes = [
          { x: canvas.width * 0.2, y: canvas.height * 0.3, width: canvas.width * 0.3, height: canvas.height * 0.4 },
          { x: canvas.width * 0.6, y: canvas.height * 0.1, width: canvas.width * 0.25, height: canvas.height * 0.3 },
        ];
        
        boxes.forEach(box => {
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
          ctx.fillRect(box.x, box.y, box.width, box.height);
        });
        break;
        
      case "style-transfer":
        // Apply artistic style effect
        setEditState(prev => ({
          ...prev,
          filter: "contrast(130%) saturate(150%) hue-rotate(15deg) sepia(20%)"
        }));
        break;
        
      case "enhance":
        // Auto-enhance
        setEditState(prev => ({
          ...prev,
          brightness: 10,
          contrast: 15,
          saturation: 20
        }));
        break;
        
      case "colorize":
        // Add color to B&W
        setEditState(prev => ({
          ...prev,
          filter: "sepia(100%) saturate(200%) hue-rotate(180deg)"
        }));
        break;
        
      case "upscale":
        // Simulate upscaling by applying sharpening
        setEditState(prev => ({
          ...prev,
          filter: "contrast(110%) brightness(105%)"
        }));
        break;
    }
    
    setIsAIProcessing(false);
  }, [originalImage]);

  // High-quality export function
  const exportHighQuality = useCallback(() => {
    const originalCanvas = originalCanvasRef.current;
    if (!originalCanvas) return;

    // Create export canvas with original dimensions
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = originalDimensions.width;
    exportCanvas.height = originalDimensions.height;
    const exportCtx = exportCanvas.getContext("2d");
    if (!exportCtx) return;

    // Apply all transformations at original resolution
    exportCtx.save();
    
    // Apply transformations
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
    
    // Draw layers
    layers.forEach(layer => {
      if (layer.visible) {
        exportCtx.globalAlpha = layer.opacity / 100;
        exportCtx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        exportCtx.drawImage(
          layer.canvas,
          -exportCanvas.width / 2,
          -exportCanvas.height / 2,
          exportCanvas.width,
          exportCanvas.height
        );
      }
    });
    
    // Draw text overlays
    textOverlays.forEach(overlay => {
      exportCtx.font = `${overlay.fontSize}px ${overlay.fontFamily}`;
      exportCtx.fillStyle = overlay.color;
      exportCtx.fillText(overlay.text, overlay.x, overlay.y);
    });
    
    exportCtx.restore();
    
    // Export with maximum quality
    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-hq-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png", 1.0); // Maximum quality
  }, [originalDimensions, editState, layers, textOverlays]);

  // Music handling functions
  const handleMusicUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const track: MusicTrack = {
      id: Date.now().toString(),
      name: file.name,
      file,
      duration: 0,
      volume: 1,
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

  // Handle file upload with preserved quality
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
          crop: null,
          zoom: 1,
          panX: 0,
          panY: 0,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [setupCanvas]);

  // Add text overlay
  const addTextOverlay = useCallback(() => {
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: "Click to edit",
      x: 100,
      y: 100,
      fontSize: textSize,
      color: "#ffffff",
      fontFamily: selectedFont,
      rotation: 0,
    };
    
    setTextOverlays(prev => [...prev, newText]);
  }, [textSize, selectedFont]);

  // Create new layer
  const addLayer = useCallback(() => {
    if (!originalImage) return;
    
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      opacity: 100,
      blendMode: "normal",
      canvas: document.createElement("canvas"),
    };
    
    newLayer.canvas.width = originalImage.width;
    newLayer.canvas.height = originalImage.height;
    
    setLayers(prev => [...prev, newLayer]);
    setCurrentLayer(newLayer.id);
  }, [originalImage, layers.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-xl flex items-center justify-center shadow-lg`}>
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <SplitText
              text="Advanced Photo Studio"
              animation="slide"
              direction="up"
              stagger={30}
              splitBy="char"
              trigger={true}
              className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-foreground`}
            />
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
              Professional editing with AI tools & music
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAIProcessing && (
            <div className="flex items-center gap-2 text-blue-500">
              <Brain className="w-4 h-4 animate-pulse" />
              <span className="text-sm">AI Processing...</span>
            </div>
          )}
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Upload Section */}
      {!isEditing && (
        <GlassSurface className="p-8 rounded-2xl text-center" blur="md" opacity={0.1}>
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Upload className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-foreground`}>
                Upload Your Photo
              </h3>
              <p className={`${isMobile ? "text-sm" : "text-base"} text-muted-foreground max-w-md mx-auto`}>
                Start with high-resolution images for best results. Supports all formats.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className={`py-3 bg-gradient-to-r ${currentTheme.gradients.primary} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Image
              </Button>
              
              <Button
                onClick={() => audioInputRef.current?.click()}
                variant="outline"
                className="py-3"
              >
                <Music className="w-5 h-5 mr-2" />
                Add Music
              </Button>
            </div>
            
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
        </GlassSurface>
      )}

      {/* Advanced Editor Interface */}
      {isEditing && (
        <div className="space-y-4">
          {/* Advanced Toolbar */}
          <GlassSurface className="p-4 rounded-2xl" blur="md" opacity={0.15}>
            <div className="flex items-center justify-between mb-4">
              <div className={`flex ${isMobile ? "gap-1" : "gap-2"} flex-wrap`}>
                {advancedTools.map((tool) => (
                  <Button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    variant={currentTool === tool.id ? "default" : "outline"}
                    size={isMobile ? "sm" : "default"}
                    className={`flex items-center gap-2 photo-editor-tool-btn ${
                      currentTool === tool.id
                        ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white border-0`
                        : "bg-card border-border text-foreground hover:bg-accent"
                    }`}
                  >
                    <tool.icon className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                    {!isMobile && tool.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowLayers(!showLayers)}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className={showLayers ? "bg-accent" : ""}
                >
                  <Layers3 className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={() => setShowMusic(!showMusic)}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className={showMusic ? "bg-accent" : ""}
                >
                  <Music className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={exportHighQuality}
                  className={`bg-gradient-to-r ${currentTheme.gradients.accent} text-white border-0 export-animation`}
                  size={isMobile ? "sm" : "default"}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export HQ
                </Button>
              </div>
            </div>

            {/* Tool-specific controls */}
            {currentTool === "adjust" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Brightness</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editState.brightness}
                      onChange={(e) => setEditState(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full photo-editor-slider"
                    />
                    <span className="text-xs text-muted-foreground">{editState.brightness}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contrast</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editState.contrast}
                      onChange={(e) => setEditState(prev => ({ ...prev, contrast: parseInt(e.target.value) }))}
                      className="w-full photo-editor-slider"
                    />
                    <span className="text-xs text-muted-foreground">{editState.contrast}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Saturation</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editState.saturation}
                      onChange={(e) => setEditState(prev => ({ ...prev, saturation: parseInt(e.target.value) }))}
                      className="w-full photo-editor-slider"
                    />
                    <span className="text-xs text-muted-foreground">{editState.saturation}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Hue</label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={editState.hue}
                      onChange={(e) => setEditState(prev => ({ ...prev, hue: parseInt(e.target.value) }))}
                      className="w-full photo-editor-slider"
                    />
                    <span className="text-xs text-muted-foreground">{editState.hue}°</span>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setEditState(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </Button>
                  <Button
                    onClick={() => setEditState(prev => ({ ...prev, flipX: !prev.flipX }))}
                    variant="outline"
                    size="sm"
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Flip H
                  </Button>
                  <Button
                    onClick={() => setEditState(prev => ({ ...prev, flipY: !prev.flipY }))}
                    variant="outline"
                    size="sm"
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Flip V
                  </Button>
                </div>
              </div>
            )}

            {currentTool === "ai" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiTools.map((tool) => (
                    <Button
                      key={tool.id}
                      onClick={() => processAI(tool.id)}
                      disabled={isAIProcessing}
                      variant="outline"
                      className="p-4 h-auto flex flex-col items-start gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <tool.icon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{tool.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">{tool.description}</p>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentTool === "text" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Font</label>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-full p-2 rounded border bg-background"
                    >
                      {fonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Size</label>
                    <input
                      type="range"
                      min="12"
                      max="120"
                      value={textSize}
                      onChange={(e) => setTextSize(parseInt(e.target.value))}
                      className="w-full photo-editor-slider"
                    />
                    <span className="text-xs text-muted-foreground">{textSize}px</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Color</label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-full h-10 rounded border"
                    />
                  </div>
                </div>
                
                <Button onClick={addTextOverlay} className="w-full">
                  <Type className="w-4 h-4 mr-2" />
                  Add Text
                </Button>
              </div>
            )}

            {currentTool === "brush" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Brush Size</label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full photo-editor-slider"
                    />
                    <span className="text-xs text-muted-foreground">{brushSize}px</span>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Color</label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-full h-10 rounded border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tools</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Brush className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eraser className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Pipette className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentTool === "music" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Background Music</h4>
                  <Button
                    onClick={() => audioInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    <FileAudio className="w-4 h-4 mr-2" />
                    Add Track
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {musicTracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Button
                        onClick={() => currentTrack === track.id ? stopMusic() : playMusic(track.id)}
                        variant="outline"
                        size="sm"
                      >
                        {currentTrack === track.id && isPlaying ? 
                          <Pause className="w-4 h-4" /> : 
                          <Play className="w-4 h-4" />
                        }
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Volume2 className="w-3 h-3" />
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
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {musicTracks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Headphones className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No music tracks added yet</p>
                  </div>
                )}
              </div>
            )}

            {currentTool === "filters" && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    onClick={() => setEditState(prev => ({ ...prev, filter: filter.filter }))}
                    variant={editState.filter === filter.filter ? "default" : "outline"}
                    className={`p-3 h-auto flex flex-col items-center gap-2 filter-preview ${
                      editState.filter === filter.filter
                        ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white`
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded" 
                         style={{ filter: filter.filter }} />
                    <span className="text-xs">{filter.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </GlassSurface>

          {/* Canvas Area */}
          <div className="flex gap-4">
            {/* Main Canvas */}
            <div className="flex-1">
              <GlassSurface className="p-4 rounded-2xl" blur="md" opacity={0.1}>
                <div className="flex justify-center">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="photo-editor-canvas max-w-full h-auto rounded-lg shadow-lg"
                      style={{ 
                        cursor: currentTool === "crop" ? "crosshair" : currentTool === "brush" ? "crosshair" : "default",
                        maxHeight: isMobile ? "400px" : "600px",
                        imageRendering: "high-quality"
                      }}
                    />
                    
                    {/* Text overlays */}
                    {textOverlays.map((overlay) => (
                      <div
                        key={overlay.id}
                        className="absolute cursor-move text-white border border-dashed border-white/50 p-1"
                        style={{
                          left: overlay.x,
                          top: overlay.y,
                          fontSize: overlay.fontSize,
                          fontFamily: overlay.fontFamily,
                          color: overlay.color,
                          transform: `rotate(${overlay.rotation}deg)`,
                        }}
                      >
                        {overlay.text}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassSurface>
            </div>

            {/* Side Panels */}
            {(showLayers || showMusic) && (
              <div className="w-80 space-y-4">
                {/* Layers Panel */}
                {showLayers && (
                  <GlassSurface className="p-4 rounded-2xl" blur="md" opacity={0.1}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-foreground">Layers</h4>
                      <Button onClick={addLayer} variant="outline" size="sm">
                        <Layers className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {layers.map((layer) => (
                        <div
                          key={layer.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            currentLayer === layer.id 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-border bg-card hover:bg-accent"
                          }`}
                          onClick={() => setCurrentLayer(layer.id)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{layer.name}</span>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setLayers(prev => 
                                  prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)
                                );
                              }}
                              variant="ghost"
                              size="sm"
                            >
                              {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                          </div>
                          
                          <div className="mt-2">
                            <label className="text-xs text-muted-foreground">Opacity</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={layer.opacity}
                              onChange={(e) => {
                                setLayers(prev => 
                                  prev.map(l => l.id === layer.id ? { ...l, opacity: parseInt(e.target.value) } : l)
                                );
                              }}
                              className="w-full h-1 mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassSurface>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hidden elements */}
      <canvas ref={originalCanvasRef} className="hidden" />
      <canvas ref={hiddenCanvasRef} className="hidden" />
      <audio ref={audioRef} />
    </div>
  );
};
