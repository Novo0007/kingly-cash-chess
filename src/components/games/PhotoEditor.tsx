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
} from "lucide-react";

export interface PhotoEditorProps {
  onClose?: () => void;
}

interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
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
}

interface HistoryState {
  imageData: ImageData;
  editState: EditState;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({ onClose }) => {
  const { currentTheme } = useTheme();
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [currentTool, setCurrentTool] = useState<string>("adjust");
  const [isEditing, setIsEditing] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [editState, setEditState] = useState<EditState>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    rotation: 0,
    flipX: false,
    flipY: false,
    filter: "none",
    crop: null,
  });

  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const tools = [
    { id: "adjust", label: "Adjust", icon: Sliders, color: "blue" },
    { id: "filters", label: "Filters", icon: Filter, color: "purple" },
    { id: "crop", label: "Crop", icon: Crop, color: "green" },
    { id: "effects", label: "Effects", icon: Sparkles, color: "pink" },
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
  ];

  // Save state to history
  const saveToHistory = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistoryState: HistoryState = {
      imageData,
      editState: { ...editState },
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryState);
    
    if (newHistory.length > 20) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setHistory(newHistory);
  }, [editState, history, historyIndex]);

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
    
    // Apply brightness, contrast, saturation via canvas filters
    const filterString = [
      `brightness(${100 + editState.brightness}%)`,
      `contrast(${100 + editState.contrast}%)`,
      `saturate(${100 + editState.saturation}%)`,
      editState.filter !== "none" ? editState.filter : "",
    ].filter(Boolean).join(" ");
    
    ctx.filter = filterString;
    
    // Draw image
    const drawWidth = editState.crop ? editState.crop.width : originalImage.width;
    const drawHeight = editState.crop ? editState.crop.height : originalImage.height;
    const sourceX = editState.crop ? editState.crop.x : 0;
    const sourceY = editState.crop ? editState.crop.y : 0;
    
    ctx.drawImage(
      originalImage,
      sourceX,
      sourceY,
      drawWidth,
      drawHeight,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
  }, [originalImage, editState]);

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
        
        // Set canvas size
        if (canvasRef.current) {
          const maxWidth = isMobile ? 300 : 600;
          const maxHeight = isMobile ? 400 : 500;
          
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          
          // Initial draw
          setTimeout(applyEdits, 100);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [isMobile, applyEdits]);

  // Handle canvas mouse events for cropping
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== "crop" || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropStart({ x, y });
    setCropEnd({ x, y });
    setIsDragging(true);
    setCropMode(true);
  }, [currentTool]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !cropStart || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCropEnd({ x, y });
  }, [isDragging, cropStart]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Apply crop
  const applyCrop = useCallback(() => {
    if (!cropStart || !cropEnd || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const scaleX = originalImage!.width / canvas.width;
    const scaleY = originalImage!.height / canvas.height;
    
    const x = Math.min(cropStart.x, cropEnd.x) * scaleX;
    const y = Math.min(cropStart.y, cropEnd.y) * scaleY;
    const width = Math.abs(cropEnd.x - cropStart.x) * scaleX;
    const height = Math.abs(cropEnd.y - cropStart.y) * scaleY;
    
    setEditState(prev => ({
      ...prev,
      crop: { x, y, width, height },
    }));
    
    setCropMode(false);
    setCropStart(null);
    setCropEnd(null);
    saveToHistory();
  }, [cropStart, cropEnd, originalImage, saveToHistory]);

  // Export image
  const exportImage = useCallback(() => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setEditState(prevState.editState);
      setHistoryIndex(prev => prev - 1);
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.putImageData(prevState.imageData, 0, 0);
        }
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setEditState(nextState.editState);
      setHistoryIndex(prev => prev + 1);
      
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.putImageData(nextState.imageData, 0, 0);
        }
      }
    }
  }, [history, historyIndex]);

  // Apply edits when state changes
  useEffect(() => {
    if (originalImage) {
      applyEdits();
    }
  }, [editState, originalImage, applyEdits]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-xl flex items-center justify-center shadow-lg`}>
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <SplitText
              text="Photo Editor"
              animation="slide"
              direction="up"
              stagger={50}
              splitBy="char"
              trigger={true}
              className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-foreground`}
            />
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
              Professional photo editing tools
            </p>
          </div>
        </div>
        
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

      {/* Upload Section */}
      {!isEditing && (
        <GlassSurface className="p-8 rounded-2xl text-center" blur="md" opacity={0.1}>
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Upload className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-foreground`}>
                Upload Your Photo
              </h3>
              <p className={`${isMobile ? "text-sm" : "text-base"} text-muted-foreground max-w-md mx-auto`}>
                Choose an image to start editing. Supports JPG, PNG, and WebP formats.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className={`${isMobile ? "w-full" : "px-8"} py-3 bg-gradient-to-r ${currentTheme.gradients.primary} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Image
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </GlassSurface>
      )}

      {/* Editor Interface */}
      {isEditing && (
        <div className="space-y-4">
          {/* Toolbar */}
          <GlassSurface className="p-4 rounded-2xl" blur="md" opacity={0.15}>
            <div className="flex items-center justify-between mb-4">
              <div className={`flex ${isMobile ? "gap-2" : "gap-3"} flex-wrap`}>
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id)}
                    variant={currentTool === tool.id ? "default" : "outline"}
                    size={isMobile ? "sm" : "default"}
                    className={`flex items-center gap-2 ${
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
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tool-specific controls */}
            {currentTool === "adjust" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Brightness</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editState.brightness}
                      onChange={(e) => setEditState(prev => ({ ...prev, brightness: parseInt(e.target.value) }))}
                      className="w-full"
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
                      className="w-full"
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
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{editState.saturation}</span>
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

            {currentTool === "filters" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    onClick={() => setEditState(prev => ({ ...prev, filter: filter.filter }))}
                    variant={editState.filter === filter.filter ? "default" : "outline"}
                    className={`p-3 h-auto flex flex-col items-center gap-2 ${
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

            {currentTool === "crop" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click and drag on the image to select crop area, then click Apply Crop.
                </p>
                {cropMode && (
                  <div className="flex gap-2">
                    <Button onClick={applyCrop} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Check className="w-4 h-4 mr-2" />
                      Apply Crop
                    </Button>
                    <Button 
                      onClick={() => {
                        setCropMode(false);
                        setCropStart(null);
                        setCropEnd(null);
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </GlassSurface>

          {/* Canvas */}
          <GlassSurface className="p-4 rounded-2xl" blur="md" opacity={0.1}>
            <div className="flex justify-center">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="max-w-full h-auto rounded-lg shadow-lg cursor-crosshair"
                  style={{ 
                    cursor: currentTool === "crop" ? "crosshair" : "default",
                    maxHeight: isMobile ? "400px" : "500px"
                  }}
                />
                
                {/* Crop overlay */}
                {cropMode && cropStart && cropEnd && (
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                    style={{
                      left: Math.min(cropStart.x, cropEnd.x),
                      top: Math.min(cropStart.y, cropEnd.y),
                      width: Math.abs(cropEnd.x - cropStart.x),
                      height: Math.abs(cropEnd.y - cropStart.y),
                    }}
                  />
                )}
              </div>
            </div>
          </GlassSurface>

          {/* Export */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={exportImage}
              className={`${isMobile ? "flex-1" : "px-8"} py-3 bg-gradient-to-r ${currentTheme.gradients.accent} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <Download className="w-5 h-5 mr-2" />
              Export Image
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className={isMobile ? "px-4" : "px-6"}
            >
              <Upload className="w-5 h-5 mr-2" />
              New Image
            </Button>
          </div>
        </div>
      )}
      
      <canvas ref={hiddenCanvasRef} className="hidden" />
    </div>
  );
};
