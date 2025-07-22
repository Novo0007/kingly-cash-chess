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
  const [aiProgress, setAiProgress] = useState(0);
  const [currentAITask, setCurrentAITask] = useState<string>("");
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

  // Canvas rendering function
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    if (!canvas || !originalCanvas || !originalImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((editState.rotation * Math.PI) / 180);
    ctx.scale(editState.flipX ? -1 : 1, editState.flipY ? -1 : 1);

    // Apply filters
    const filterString = [
      `brightness(${100 + editState.brightness}%)`,
      `contrast(${100 + editState.contrast}%)`,
      `saturate(${100 + editState.saturation}%)`,
      `hue-rotate(${editState.hue}deg)`,
      editState.filter !== "none" ? editState.filter : "",
    ].filter(Boolean).join(" ");

    ctx.filter = filterString;

    // Draw the main image
    ctx.drawImage(
      originalImage,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );

    // Draw layers
    layers.forEach(layer => {
      if (layer.visible && layer.canvas) {
        ctx.globalAlpha = layer.opacity / 100;
        ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
        ctx.drawImage(
          layer.canvas,
          -canvas.width / 2,
          -canvas.height / 2,
          canvas.width,
          canvas.height
        );
      }
    });

    ctx.restore();
  }, [originalImage, editState, layers]);

  // Update canvas when edit state changes
  useEffect(() => {
    if (originalImage) {
      renderCanvas();
    }
  }, [renderCanvas, originalImage]);

  const advancedTools = [
    { id: "adjust", label: "Adjust", icon: Sliders, color: "blue" },
    { id: "filters", label: "Filters", icon: Filter, color: "purple" },
    { id: "crop", label: "Crop", icon: Crop, color: "green" },
    { id: "brush", label: "Brush", icon: Brush, color: "red" },
    { id: "text", label: "Text", icon: Type, color: "indigo" },
    { id: "shapes", label: "Shapes", icon: Square, color: "pink" },
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
    if (!canvas || !originalCanvas) {
      console.error('Canvas references not available');
      return;
    }

    console.log('Setting up canvas with image:', img.width, 'x', img.height);

    // Store original dimensions
    setOriginalDimensions({ width: img.width, height: img.height });

    // Set up original quality canvas
    originalCanvas.width = img.width;
    originalCanvas.height = img.height;
    const originalCtx = originalCanvas.getContext("2d");
    if (originalCtx) {
      originalCtx.drawImage(img, 0, 0);
    }

    // Set up display canvas with appropriate scaling for mobile
    const maxDisplayWidth = isMobile ? window.innerWidth - 40 : 800;
    const maxDisplayHeight = isMobile ? window.innerHeight * 0.4 : 600;

    let displayWidth = img.width;
    let displayHeight = img.height;

    // Calculate scaling to fit within mobile constraints
    const scaleX = maxDisplayWidth / displayWidth;
    const scaleY = maxDisplayHeight / displayHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

    displayWidth = Math.floor(displayWidth * scale);
    displayHeight = Math.floor(displayHeight * scale);

    console.log('Canvas display size:', displayWidth, 'x', displayHeight);

    // Set canvas dimensions
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    // Set CSS size to match canvas size
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Draw the image on the display canvas immediately
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Clear and draw
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

      console.log('Image drawn to canvas successfully');
    } else {
      console.error('Failed to get canvas context');
    }

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

    // Force a re-render
    setTimeout(() => {
      if (canvas && ctx) {
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      }
    }, 100);
  }, [isMobile]);

  // AI Processing functions (simulated)
  const processAI = useCallback(async (tool: string) => {
    setIsAIProcessing(true);
    setCurrentAITask(tool);
    setAiProgress(0);

    // Simulate progressive AI processing
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      setAiProgress((i / steps) * 100);
    }

    if (!canvasRef.current || !originalImage) {
      setIsAIProcessing(false);
      setCurrentAITask("");
      setAiProgress(0);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsAIProcessing(false);
      setCurrentAITask("");
      setAiProgress(0);
      return;
    }

    // First re-render the current state
    renderCanvas();

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
        // Draw detection boxes over the current image
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
    setCurrentAITask("");
    setAiProgress(0);
  }, [originalImage, renderCanvas]);

  // Enhanced export function with mobile support
  const exportHighQuality = useCallback(() => {
    console.log('Export function called');

    // Try to use the current canvas if no original image available
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;

    if (!canvas) {
      alert('No image to export. Please upload an image first.');
      return;
    }

    try {
      // Use current canvas for export if it has content
      const sourceCanvas = originalCanvas && originalImage ? originalCanvas : canvas;

      // Create export canvas
      const exportCanvas = document.createElement("canvas");
      const exportCtx = exportCanvas.getContext("2d");
      if (!exportCtx) {
        throw new Error('Failed to create export context');
      }

      // Set export dimensions
      if (originalImage && originalDimensions.width > 0) {
        exportCanvas.width = originalDimensions.width;
        exportCanvas.height = originalDimensions.height;
      } else {
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
      }

      console.log('Export canvas size:', exportCanvas.width, 'x', exportCanvas.height);

      // Apply all transformations
      exportCtx.save();

      // Apply transformations if we have original image
      if (originalImage) {
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

        if (filterString) {
          exportCtx.filter = filterString;
        }

        // Draw the original image with transformations
        exportCtx.drawImage(
          originalImage,
          -exportCanvas.width / 2,
          -exportCanvas.height / 2,
          exportCanvas.width,
          exportCanvas.height
        );

        // Draw layers
        layers.forEach(layer => {
          if (layer.visible && layer.canvas) {
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
      } else {
        // Fallback: just copy current canvas
        exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
      }

      exportCtx.restore();

      console.log('About to create blob');

      // Export with maximum quality
      exportCanvas.toBlob((blob) => {
        if (!blob) {
          alert('Failed to create image file. Please try again.');
          return;
        }

        console.log('Blob created, size:', blob.size);

        // For mobile, use different download approach
        if (isMobile) {
          // Create image URL and open in new tab for mobile
          const url = URL.createObjectURL(blob);
          const newWindow = window.open(url, '_blank');
          if (!newWindow) {
            // Fallback to direct download
            const a = document.createElement("a");
            a.href = url;
            a.download = `edited-image-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }

          // Clean up URL after a delay
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        } else {
          // Standard download for desktop
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `edited-image-hq-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        // Show success message
        alert('Image exported successfully!');
      }, "image/png", 1.0);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [originalDimensions, editState, layers, textOverlays, originalImage, isMobile]);

  // Simple save function for mobile fallback
  const saveImage = useCallback(() => {
    console.log('Simple save function called');

    const canvas = canvasRef.current;
    if (!canvas) {
      alert('No image to save. Please upload an image first.');
      return;
    }

    try {
      // Convert canvas to data URL
      const dataURL = canvas.toDataURL('image/png', 1.0);

      if (isMobile) {
        // For mobile, create a link that opens the image
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `edited-image-${Date.now()}.png`;

        // Try to trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Also try opening in new tab as fallback
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<img src="${dataURL}" style="max-width:100%;height:auto;" />`);
          newWindow.document.title = 'Your Edited Image - Long press to save';
        }
      } else {
        // Desktop download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `edited-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      alert('Image saved! Check your downloads folder or long-press the image to save on mobile.');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed. Please try the Export HQ button.');
    }
  }, [isMobile]);

  // Enhanced music handling functions
  const handleMusicUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Music file selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file (MP3, WAV, OGG, etc).');
      return;
    }

    // Check file size (limit to 50MB for audio)
    if (file.size > 50 * 1024 * 1024) {
      alert('Audio file is too large. Please select a file smaller than 50MB.');
      return;
    }

    const track: MusicTrack = {
      id: Date.now().toString(),
      name: file.name,
      file,
      duration: 0,
      volume: 0.5, // Default to 50% volume
      startTime: 0,
      loop: false,
    };

    try {
      // Get audio duration
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      audio.onloadedmetadata = () => {
        track.duration = audio.duration;
        setMusicTracks(prev => [...prev, track]);
        URL.revokeObjectURL(url);
        console.log('Music track added successfully:', track.name);

        // Show success message
        alert(`Music track "${track.name}" added successfully!`);
      };

      audio.onerror = (error) => {
        console.error('Failed to load audio metadata:', error);
        URL.revokeObjectURL(url);
        alert('Failed to load audio file. Please try a different file.');
      };

      audio.src = url;
    } catch (error) {
      console.error('Error processing audio file:', error);
      alert('Error processing audio file. Please try again.');
    }

    // Clear the input value to allow re-uploading the same file
    if (event.target) {
      event.target.value = '';
    }
  }, []);

  const playMusic = useCallback((trackId: string) => {
    const track = musicTracks.find(t => t.id === trackId);
    if (!track || !audioRef.current) {
      console.error('Track or audio reference not found');
      return;
    }

    console.log('Playing music track:', track.name);

    try {
      // Stop current music if playing
      if (isPlaying && currentTrack && currentTrack !== trackId) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Only create new URL if it's a different track
      if (currentTrack !== trackId) {
        const url = URL.createObjectURL(track.file);
        audioRef.current.src = url;

        // Clean up URL when audio loads
        audioRef.current.onloadeddata = () => {
          URL.revokeObjectURL(url);
        };
      }

      audioRef.current.volume = track.volume;
      audioRef.current.loop = track.loop;

      // Add error handling for mobile playback
      audioRef.current.oncanplaythrough = () => {
        audioRef.current?.play().then(() => {
          setCurrentTrack(trackId);
          setIsPlaying(true);
          console.log('Music playback started successfully');
        }).catch((error) => {
          console.error('Failed to play audio:', error);
          // Try to enable audio context for mobile
          if (error.name === 'NotAllowedError') {
            alert('Please tap anywhere on the screen first to enable audio playback.');
          } else {
            alert('Failed to play audio. Please try again or check if the file is corrupted.');
          }
        });
      };

      // Handle audio end event
      audioRef.current.onended = () => {
        console.log('Music track ended');
        if (!track.loop) {
          setIsPlaying(false);
          setCurrentTrack('');
        }
      };

      audioRef.current.onerror = (error) => {
        console.error('Audio playback error:', error);
        alert('Audio playback failed. Please try a different file.');
        setIsPlaying(false);
        setCurrentTrack('');
      };

    } catch (error) {
      console.error('Error in playMusic:', error);
      alert('Failed to play music. Please try again.');
    }
  }, [musicTracks, isPlaying, currentTrack]);

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack("");
  }, []);

  const pauseMusic = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  const resumeMusic = useCallback(() => {
    if (audioRef.current && !isPlaying && currentTrack) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Failed to resume audio:', error);
      });
    }
  }, [isPlaying, currentTrack]);

  // Handle file upload with preserved quality
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF, etc).');
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select an image smaller than 10MB.');
      return;
    }

    // Show loading state
    setIsEditing(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('File read successfully');

      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);

        setOriginalImage(img);
        setIsEditing(true);

        // Setup canvas
        try {
          setupCanvas(img);
          console.log('Canvas setup completed');
        } catch (error) {
          console.error('Canvas setup failed:', error);
          alert('Failed to setup canvas. Please try again.');
          return;
        }

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

        // Clear text overlays
        setTextOverlays([]);

        // Show success message
        if (isMobile) {
          alert('Image loaded successfully! You can now edit your photo.');
        }
      };

      img.onerror = (error) => {
        console.error('Image load failed:', error);
        alert('Failed to load image. Please try a different file or check if the image is corrupted.');
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = (error) => {
      console.error('File read failed:', error);
      alert('Failed to read file. Please try again.');
    };

    reader.readAsDataURL(file);

    // Clear input to allow re-uploading same file
    if (event.target) {
      event.target.value = '';
    }
  }, [setupCanvas, isMobile]);

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
              <div className="flex flex-col gap-1">
                <span className="text-sm">AI Processing: {currentAITask}</span>
                <div className="w-20 bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${aiProgress}%` }}
                  />
                </div>
              </div>
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
                
                <div className="flex gap-2">
                  <Button
                    onClick={saveImage}
                    className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white border-0`}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
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
            </div>

            {/* Tool-specific controls */}
            {currentTool === "adjust" && (
              <div className="space-y-4">
                {/* Scrollable adjust controls for mobile */}
                <div className={`${isMobile ? "overflow-x-auto pb-2" : ""}`}>
                  <div className={`${isMobile ? "flex gap-4 min-w-max" : "grid grid-cols-1 md:grid-cols-4 gap-4"}`}>
                    <div className={`space-y-2 ${isMobile ? "min-w-[200px]" : ""}`}>
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

                    <div className={`space-y-2 ${isMobile ? "min-w-[200px]" : ""}`}>
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

                    <div className={`space-y-2 ${isMobile ? "min-w-[200px]" : ""}`}>
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

                    <div className={`space-y-2 ${isMobile ? "min-w-[200px]" : ""}`}>
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
                </div>

                {/* Transform controls */}
                <div className={`flex gap-2 ${isMobile ? "overflow-x-auto pb-2" : "flex-wrap"}`}>
                  <Button
                    onClick={() => setEditState(prev => ({ ...prev, rotation: prev.rotation + 90 }))}
                    variant="outline"
                    size="sm"
                    className={isMobile ? "min-w-max" : ""}
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotate
                  </Button>
                  <Button
                    onClick={() => setEditState(prev => ({ ...prev, flipX: !prev.flipX }))}
                    variant="outline"
                    size="sm"
                    className={isMobile ? "min-w-max" : ""}
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Flip H
                  </Button>
                  <Button
                    onClick={() => setEditState(prev => ({ ...prev, flipY: !prev.flipY }))}
                    variant="outline"
                    size="sm"
                    className={isMobile ? "min-w-max" : ""}
                  >
                    <Move className="w-4 h-4 mr-2" />
                    Flip V
                  </Button>
                  <Button
                    onClick={() => setEditState({
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
                    })}
                    variant="outline"
                    size="sm"
                    className={isMobile ? "min-w-max" : ""}
                  >
                    <Undo className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {currentTool === "ai" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-foreground">AI Tools</h4>
                  {isAIProcessing && (
                    <div className="flex items-center gap-2 text-blue-500">
                      <Brain className="w-4 h-4 animate-pulse" />
                      <span className="text-xs">Processing...</span>
                    </div>
                  )}
                </div>

                {/* Mobile scrollable AI tools */}
                <div className={`${isMobile ? "overflow-x-auto pb-2" : ""}`}>
                  <div className={`${
                    isMobile
                      ? "flex gap-3 min-w-max"
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  }`}>
                    {aiTools.map((tool) => (
                      <Button
                        key={tool.id}
                        onClick={() => processAI(tool.id)}
                        disabled={isAIProcessing}
                        variant="outline"
                        className={`p-4 h-auto flex flex-col items-start gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 ${
                          isMobile ? "min-w-[180px] flex-shrink-0" : ""
                        } ${isAIProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <tool.icon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-sm">{tool.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-left leading-tight">{tool.description}</p>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* AI Processing Status */}
                {isAIProcessing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-blue-600 animate-pulse" />
                      <span className="text-sm font-medium text-blue-800">AI Processing: {currentAITask}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${aiProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-blue-600 mt-1">
                      <span>Processing...</span>
                      <span>{Math.round(aiProgress)}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTool === "text" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Text Tool</h4>

                {/* Mobile scrollable text controls */}
                <div className={`${isMobile ? "overflow-x-auto pb-2" : ""}`}>
                  <div className={`${isMobile ? "flex gap-4 min-w-max" : "grid grid-cols-1 md:grid-cols-3 gap-4"}`}>
                    <div className={`space-y-2 ${isMobile ? "min-w-[160px]" : ""}`}>
                      <label className="text-sm font-medium text-foreground">Font</label>
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="w-full p-2 rounded border bg-background text-sm"
                      >
                        {fonts.map(font => (
                          <option key={font} value={font}>{font}</option>
                        ))}
                      </select>
                    </div>

                    <div className={`space-y-2 ${isMobile ? "min-w-[160px]" : ""}`}>
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

                    <div className={`space-y-2 ${isMobile ? "min-w-[160px]" : ""}`}>
                      <label className="text-sm font-medium text-foreground">Color</label>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-full h-10 rounded border"
                      />
                      <div className="text-xs text-muted-foreground">{brushColor}</div>
                    </div>
                  </div>
                </div>

                {/* Text input area */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Text Content</label>
                  <input
                    type="text"
                    placeholder="Enter your text here..."
                    className="w-full p-2 rounded border bg-background"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const text = e.currentTarget.value;
                        if (text.trim()) {
                          const newText: TextOverlay = {
                            id: Date.now().toString(),
                            text: text.trim(),
                            x: 100,
                            y: 100,
                            fontSize: textSize,
                            color: brushColor,
                            fontFamily: selectedFont,
                            rotation: 0,
                          };
                          setTextOverlays(prev => [...prev, newText]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addTextOverlay} className="flex-1">
                    <Type className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>

                  {textOverlays.length > 0 && (
                    <Button
                      onClick={() => setTextOverlays([])}
                      variant="outline"
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>

                {/* Active text overlays */}
                {textOverlays.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Text Overlays ({textOverlays.length})</label>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {textOverlays.map((overlay, index) => (
                        <div key={overlay.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                          <span className="truncate flex-1">{overlay.text}</span>
                          <Button
                            onClick={() => setTextOverlays(prev => prev.filter(t => t.id !== overlay.id))}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTool === "brush" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Brush Tool</h4>

                {/* Mobile scrollable brush controls */}
                <div className={`${isMobile ? "overflow-x-auto pb-2" : ""}`}>
                  <div className={`${isMobile ? "flex gap-4 min-w-max" : "grid grid-cols-1 md:grid-cols-3 gap-4"}`}>
                    <div className={`space-y-2 ${isMobile ? "min-w-[150px]" : ""}`}>
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

                    <div className={`space-y-2 ${isMobile ? "min-w-[150px]" : ""}`}>
                      <label className="text-sm font-medium text-foreground">Color</label>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-full h-10 rounded border"
                      />
                      <div className="text-xs text-muted-foreground">{brushColor}</div>
                    </div>

                    <div className={`space-y-2 ${isMobile ? "min-w-[200px]" : ""}`}>
                      <label className="text-sm font-medium text-foreground">Brush Tools</label>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Set brush mode
                            console.log('Brush mode activated');
                          }}
                        >
                          <Brush className="w-4 h-4 mr-1" />
                          Paint
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            // Set eraser mode
                            setBrushColor('#FFFFFF');
                          }}
                        >
                          <Eraser className="w-4 h-4 mr-1" />
                          Erase
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brush Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Brush className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Drawing Tips</span>
                  </div>
                  <p className="text-xs text-blue-600">
                    {isMobile ? "Touch and drag to draw on the canvas" : "Click and drag to draw on the canvas"}
                  </p>
                </div>
              </div>
            )}

            {currentTool === "shapes" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Shapes Tool</h4>

                {/* Mobile scrollable shapes */}
                <div className={`${isMobile ? "overflow-x-auto pb-2" : ""}`}>
                  <div className={`${isMobile ? "flex gap-3 min-w-max" : "grid grid-cols-3 md:grid-cols-6 gap-3"}`}>
                    {[
                      { id: 'rectangle', icon: Square, name: 'Rectangle' },
                      { id: 'circle', icon: Circle, name: 'Circle' },
                      { id: 'line', icon: Move, name: 'Line' },
                      { id: 'arrow', icon: MousePointer, name: 'Arrow' },
                    ].map((shape) => (
                      <Button
                        key={shape.id}
                        variant="outline"
                        className={`p-3 h-auto flex flex-col items-center gap-2 ${
                          isMobile ? "min-w-[80px] flex-shrink-0" : ""
                        }`}
                        onClick={() => {
                          // Add shape to canvas
                          const canvas = canvasRef.current;
                          if (!canvas) return;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;

                          ctx.strokeStyle = brushColor;
                          ctx.lineWidth = 3;

                          const centerX = canvas.width / 2;
                          const centerY = canvas.height / 2;
                          const size = 50;

                          switch (shape.id) {
                            case 'rectangle':
                              ctx.strokeRect(centerX - size, centerY - size, size * 2, size * 2);
                              break;
                            case 'circle':
                              ctx.beginPath();
                              ctx.arc(centerX, centerY, size, 0, 2 * Math.PI);
                              ctx.stroke();
                              break;
                            case 'line':
                              ctx.beginPath();
                              ctx.moveTo(centerX - size, centerY);
                              ctx.lineTo(centerX + size, centerY);
                              ctx.stroke();
                              break;
                            case 'arrow':
                              // Draw arrow
                              ctx.beginPath();
                              ctx.moveTo(centerX - size, centerY);
                              ctx.lineTo(centerX + size, centerY);
                              ctx.moveTo(centerX + size - 10, centerY - 10);
                              ctx.lineTo(centerX + size, centerY);
                              ctx.lineTo(centerX + size - 10, centerY + 10);
                              ctx.stroke();
                              break;
                          }
                        }}
                      >
                        <shape.icon className="w-6 h-6" />
                        <span className="text-xs">{shape.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Shape properties */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Stroke Color</label>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-full h-10 rounded border"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Stroke Width</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full photo-editor-slider"
                    />
                    <span className="text-xs text-muted-foreground">{brushSize}px</span>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Square className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Shapes Info</span>
                  </div>
                  <p className="text-xs text-green-600">
                    Click on any shape to add it to the center of your canvas
                  </p>
                </div>
              </div>
            )}

            {currentTool === "music" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Background Music</h4>
                  <Button
                    onClick={() => {
                      console.log('Add track button clicked');
                      audioInputRef.current?.click();
                    }}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0"
                    size="sm"
                  >
                    <FileAudio className="w-4 h-4 mr-2" />
                    Add Track
                  </Button>
                </div>

                {/* Music player controls */}
                {musicTracks.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {musicTracks.length} track{musicTracks.length > 1 ? 's' : ''} loaded
                      </span>
                    </div>

                    {isPlaying && (
                      <div className="flex items-center gap-2 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium">Playing</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile-optimized music tracks list */}
                <div className={`space-y-2 ${isMobile ? "max-h-60" : "max-h-40"} overflow-y-auto`}>
                  {musicTracks.map((track, index) => (
                    <div key={track.id} className={`${isMobile ? "p-4" : "p-3"} bg-muted/50 rounded-lg border transition-all hover:bg-muted/70`}>
                      {/* Track header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{track.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Track {index + 1} • {track.duration ? `${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}` : 'Loading...'}
                          </p>
                        </div>

                        <Button
                          onClick={() => {
                            console.log('Removing track:', track.name);
                            setMusicTracks(prev => prev.filter(t => t.id !== track.id));
                            if (currentTrack === track.id) {
                              stopMusic();
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Controls row */}
                      <div className="flex items-center gap-3">
                        {/* Play controls */}
                        <div className="flex gap-1">
                          <Button
                            onClick={() => {
                              console.log('Play/pause clicked for track:', track.name);
                              if (currentTrack === track.id) {
                                if (isPlaying) {
                                  pauseMusic();
                                } else {
                                  resumeMusic();
                                }
                              } else {
                                playMusic(track.id);
                              }
                            }}
                            variant={currentTrack === track.id ? "default" : "outline"}
                            size="sm"
                            className={currentTrack === track.id ? "bg-blue-600 text-white" : ""}
                          >
                            {currentTrack === track.id && isPlaying ?
                              <Pause className="w-4 h-4" /> :
                              <Play className="w-4 h-4" />
                            }
                          </Button>

                          {currentTrack === track.id && (
                            <Button
                              onClick={() => {
                                console.log('Stop clicked');
                                stopMusic();
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <StopCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Volume control */}
                        <div className="flex-1 flex items-center gap-2">
                          <Volume2 className="w-3 h-3 text-muted-foreground" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={track.volume}
                            onChange={(e) => {
                              const newVolume = parseFloat(e.target.value);
                              console.log('Volume changed:', newVolume);
                              setMusicTracks(prev =>
                                prev.map(t => t.id === track.id ? { ...t, volume: newVolume } : t)
                              );
                              if (audioRef.current && currentTrack === track.id) {
                                audioRef.current.volume = newVolume;
                              }
                            }}
                            className={`flex-1 ${isMobile ? "h-2" : "h-1"}`}
                          />
                          <span className="text-xs text-muted-foreground min-w-[3ch]">
                            {Math.round(track.volume * 100)}%
                          </span>
                        </div>

                        {/* Loop toggle */}
                        <Button
                          onClick={() => {
                            const newLoop = !track.loop;
                            console.log('Loop toggled:', newLoop);
                            setMusicTracks(prev =>
                              prev.map(t => t.id === track.id ? { ...t, loop: newLoop } : t)
                            );
                            if (audioRef.current && currentTrack === track.id) {
                              audioRef.current.loop = newLoop;
                            }
                          }}
                          variant={track.loop ? "default" : "outline"}
                          size="sm"
                          className={track.loop ? "bg-green-600 text-white" : ""}
                        >
                          <Shuffle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty state */}
                {musicTracks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                      <Headphones className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="font-medium mb-1">No music tracks yet</p>
                    <p className="text-sm">
                      Add background music to enhance your photo editing experience
                    </p>
                    <Button
                      onClick={() => audioInputRef.current?.click()}
                      className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0"
                      size="sm"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      Add Your First Track
                    </Button>
                  </div>
                )}

                {/* Mobile audio tips */}
                {isMobile && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Headphones className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Mobile Audio Tips</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Tap the screen first to enable audio. Use headphones for best experience.
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentTool === "crop" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Crop Tool</h4>

                {/* Crop presets for mobile */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Crop Presets</label>
                  <div className={`${isMobile ? "overflow-x-auto pb-2" : ""}`}>
                    <div className={`${isMobile ? "flex gap-2 min-w-max" : "grid grid-cols-3 gap-2"}`}>
                      {[
                        { id: 'square', name: '1:1 Square', ratio: 1 },
                        { id: 'landscape', name: '16:9 Wide', ratio: 16/9 },
                        { id: 'portrait', name: '9:16 Tall', ratio: 9/16 },
                        { id: 'photo', name: '4:3 Photo', ratio: 4/3 },
                        { id: 'golden', name: '3:2 Golden', ratio: 3/2 },
                        { id: 'custom', name: 'Free Form', ratio: 0 },
                      ].map((preset) => (
                        <Button
                          key={preset.id}
                          onClick={() => {
                            if (!originalImage || !canvasRef.current) return;

                            const canvas = canvasRef.current;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return;

                            if (preset.ratio === 0) {
                              // Free form - enable manual cropping
                              setCropMode(true);
                              alert('Click and drag on the image to select crop area');
                            } else {
                              // Apply preset crop
                              const canvasWidth = canvas.width;
                              const canvasHeight = canvas.height;

                              let cropWidth, cropHeight;

                              if (preset.ratio > canvasWidth / canvasHeight) {
                                cropWidth = canvasWidth;
                                cropHeight = canvasWidth / preset.ratio;
                              } else {
                                cropHeight = canvasHeight;
                                cropWidth = canvasHeight * preset.ratio;
                              }

                              const cropX = (canvasWidth - cropWidth) / 2;
                              const cropY = (canvasHeight - cropHeight) / 2;

                              // Create new canvas with cropped dimensions
                              const croppedCanvas = document.createElement('canvas');
                              croppedCanvas.width = cropWidth;
                              croppedCanvas.height = cropHeight;
                              const croppedCtx = croppedCanvas.getContext('2d');

                              if (croppedCtx) {
                                croppedCtx.drawImage(
                                  canvas,
                                  cropX, cropY, cropWidth, cropHeight,
                                  0, 0, cropWidth, cropHeight
                                );

                                // Update main canvas
                                canvas.width = cropWidth;
                                canvas.height = cropHeight;
                                ctx.clearRect(0, 0, cropWidth, cropHeight);
                                ctx.drawImage(croppedCanvas, 0, 0);

                                console.log(`Applied ${preset.name} crop`);
                              }
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className={`${isMobile ? "min-w-[120px] flex-shrink-0" : ""} flex flex-col items-center gap-1 h-auto p-3`}
                        >
                          <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center">
                            <div
                              className="bg-current"
                              style={{
                                width: preset.ratio > 1 ? '16px' : '12px',
                                height: preset.ratio > 1 ? '9px' : '16px',
                              }}
                            />
                          </div>
                          <span className="text-xs">{preset.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Crop controls */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      setCropMode(!cropMode);
                      if (!cropMode) {
                        alert(isMobile ? 'Touch and drag to select crop area' : 'Click and drag to select crop area');
                      }
                    }}
                    variant={cropMode ? "default" : "outline"}
                    className={cropMode ? "bg-green-600 text-white" : ""}
                  >
                    <Crop className="w-4 h-4 mr-2" />
                    {cropMode ? 'Exit Crop' : 'Manual Crop'}
                  </Button>

                  <Button
                    onClick={() => {
                      // Reset to original size
                      if (originalImage && canvasRef.current) {
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          canvas.width = originalImage.width;
                          canvas.height = originalImage.height;
                          ctx.drawImage(originalImage, 0, 0);
                          setCropMode(false);
                          setCropStart(null);
                          setCropEnd(null);
                        }
                      }
                    }}
                    variant="outline"
                  >
                    <Undo className="w-4 h-4 mr-2" />
                    Reset Crop
                  </Button>
                </div>

                {/* Crop instructions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Crop className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Crop Instructions</span>
                  </div>
                  <p className="text-xs text-green-700">
                    {cropMode
                      ? (isMobile ? 'Touch and drag on the image to select crop area, then tap "Apply Crop"' : 'Click and drag on the image to select crop area, then click "Apply Crop"')
                      : 'Choose a preset ratio or enable manual crop mode'
                    }
                  </p>

                  {cropMode && (
                    <Button
                      onClick={() => {
                        if (cropStart && cropEnd && canvasRef.current) {
                          const canvas = canvasRef.current;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;

                          const x = Math.min(cropStart.x, cropEnd.x);
                          const y = Math.min(cropStart.y, cropEnd.y);
                          const width = Math.abs(cropEnd.x - cropStart.x);
                          const height = Math.abs(cropEnd.y - cropStart.y);

                          if (width > 10 && height > 10) {
                            // Create cropped image
                            const imageData = ctx.getImageData(x, y, width, height);
                            canvas.width = width;
                            canvas.height = height;
                            ctx.putImageData(imageData, 0, 0);

                            setCropMode(false);
                            setCropStart(null);
                            setCropEnd(null);

                            alert('Crop applied successfully!');
                          } else {
                            alert('Please select a larger crop area.');
                          }
                        } else {
                          alert('Please select a crop area first.');
                        }
                      }}
                      className="mt-2 w-full bg-green-600 text-white"
                      size="sm"
                    >
                      Apply Crop
                    </Button>
                  )}
                </div>
              </div>
            )}

            {currentTool === "filters" && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Photo Filters</h4>
                {/* Mobile scrollable filters */}
                <div className={`${isMobile ? "overflow-x-auto pb-2" : ""}`}>
                  <div className={`${
                    isMobile
                      ? "flex gap-3 min-w-max"
                      : "grid grid-cols-2 md:grid-cols-5 gap-3"
                  }`}>
                    {filters.map((filter) => (
                      <Button
                        key={filter.id}
                        onClick={() => setEditState(prev => ({ ...prev, filter: filter.filter }))}
                        variant={editState.filter === filter.filter ? "default" : "outline"}
                        className={`p-3 h-auto flex flex-col items-center gap-2 filter-preview ${
                          isMobile ? "min-w-[80px] flex-shrink-0" : ""
                        } ${
                          editState.filter === filter.filter
                            ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white`
                            : ""
                        }`}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded"
                             style={{ filter: filter.filter }} />
                        <span className="text-xs text-center">{filter.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                {/* Filter intensity control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Filter Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="w-full photo-editor-slider"
                    onChange={(e) => {
                      const intensity = parseInt(e.target.value) / 100;
                      // Apply filter with custom intensity - this is a simplified version
                      const currentFilter = editState.filter;
                      if (currentFilter !== "none" && intensity < 1) {
                        // Blend between no filter and full filter based on intensity
                        const blended = `opacity(${intensity}) ${currentFilter}`;
                        setEditState(prev => ({ ...prev, filter: blended }));
                      }
                    }}
                  />
                  <span className="text-xs text-muted-foreground">Adjust filter strength</span>
                </div>
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
                      className="photo-editor-canvas max-w-full h-auto rounded-lg shadow-lg border-2 border-gray-200"
                      style={{
                        cursor: currentTool === "crop" ? "crosshair" : currentTool === "brush" ? "crosshair" : "default",
                        maxHeight: isMobile ? "400px" : "600px",
                        imageRendering: "high-quality",
                        background: "#f8f9fa"
                      }}
                      onMouseDown={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        if (currentTool === "brush") {
                          setIsDrawing(true);
                          // Start drawing at this position
                        } else if (currentTool === "crop" && cropMode) {
                          setCropStart({ x, y });
                          setCropEnd({ x, y });
                          setIsDragging(true);
                        }
                      }}
                      onMouseMove={(e) => {
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const rect = canvas.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;

                        if (isDrawing && currentTool === "brush") {
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;

                          ctx.lineWidth = brushSize;
                          ctx.lineCap = "round";
                          ctx.strokeStyle = brushColor;
                          ctx.lineTo(x, y);
                          ctx.stroke();
                          ctx.beginPath();
                          ctx.moveTo(x, y);
                        } else if (isDragging && currentTool === "crop" && cropMode && cropStart) {
                          setCropEnd({ x, y });

                          // Draw crop selection overlay
                          const ctx = canvas.getContext("2d");
                          if (ctx && originalImage) {
                            // Redraw original image
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

                            // Draw crop overlay
                            const cropX = Math.min(cropStart.x, x);
                            const cropY = Math.min(cropStart.y, y);
                            const cropWidth = Math.abs(x - cropStart.x);
                            const cropHeight = Math.abs(y - cropStart.y);

                            // Dark overlay
                            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);

                            // Clear crop area
                            ctx.globalCompositeOperation = "destination-out";
                            ctx.fillRect(cropX, cropY, cropWidth, cropHeight);

                            // Draw crop border
                            ctx.globalCompositeOperation = "source-over";
                            ctx.strokeStyle = "#00ff00";
                            ctx.lineWidth = 2;
                            ctx.setLineDash([5, 5]);
                            ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
                            ctx.setLineDash([]);
                          }
                        }
                      }}
                      onMouseUp={() => {
                        if (currentTool === "brush") {
                          setIsDrawing(false);
                          const canvas = canvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.beginPath();
                            }
                          }
                        } else if (currentTool === "crop" && cropMode) {
                          setIsDragging(false);
                        }
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;

                        if (currentTool === "brush") {
                          setIsDrawing(true);
                          // Start drawing at this position
                        } else if (currentTool === "crop" && cropMode) {
                          setCropStart({ x, y });
                          setCropEnd({ x, y });
                          setIsDragging(true);
                        }
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        const touch = e.touches[0];
                        const rect = canvas.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;

                        if (isDrawing && currentTool === "brush") {
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;

                          ctx.lineWidth = brushSize;
                          ctx.lineCap = "round";
                          ctx.strokeStyle = brushColor;
                          ctx.lineTo(x, y);
                          ctx.stroke();
                          ctx.beginPath();
                          ctx.moveTo(x, y);
                        } else if (isDragging && currentTool === "crop" && cropMode && cropStart) {
                          setCropEnd({ x, y });

                          // Draw crop selection overlay (same as mouse)
                          const ctx = canvas.getContext("2d");
                          if (ctx && originalImage) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

                            const cropX = Math.min(cropStart.x, x);
                            const cropY = Math.min(cropStart.y, y);
                            const cropWidth = Math.abs(x - cropStart.x);
                            const cropHeight = Math.abs(y - cropStart.y);

                            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                            ctx.fillRect(0, 0, canvas.width, canvas.height);

                            ctx.globalCompositeOperation = "destination-out";
                            ctx.fillRect(cropX, cropY, cropWidth, cropHeight);

                            ctx.globalCompositeOperation = "source-over";
                            ctx.strokeStyle = "#00ff00";
                            ctx.lineWidth = 3; // Thicker for mobile
                            ctx.setLineDash([5, 5]);
                            ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
                            ctx.setLineDash([]);
                          }
                        }
                      }}
                      onTouchEnd={() => {
                        if (currentTool === "brush") {
                          setIsDrawing(false);
                          const canvas = canvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.beginPath();
                            }
                          }
                        } else if (currentTool === "crop" && cropMode) {
                          setIsDragging(false);
                        }
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
