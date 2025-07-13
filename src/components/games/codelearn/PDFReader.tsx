import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Bookmark,
  Search,
  Menu,
  X,
  FileText,
  Maximize,
  Minimize,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PDFReaderProps {
  pdfUrl: string;
  title: string;
  onBack: () => void;
}

export const PDFReader: React.FC<PDFReaderProps> = ({
  pdfUrl,
  title,
  onBack,
}) => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(150); // This would come from PDF metadata
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookmarks, setBookmarks] = useState([
    { page: 5, title: "Introduction to Variables" },
    { page: 23, title: "Functions and Scope" },
    { page: 45, title: "Object-Oriented Programming" },
  ]);

  const handleZoomIn = () => {
    if (zoom < 200) setZoom(zoom + 25);
  };

  const handleZoomOut = () => {
    if (zoom > 50) setZoom(zoom - 25);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const addBookmark = () => {
    const title = prompt("Bookmark title:");
    if (title) {
      setBookmarks([...bookmarks, { page: currentPage, title }]);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setShowBookmarks(false);
  };

  return (
    <div
      className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : "relative"}`}
    >
      {/* Header Controls */}
      <div className="bg-card border-b border-border p-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              {!isMobile && "Back"}
            </Button>
            <div className="hidden md:block">
              <h1 className="font-semibold text-lg">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>

          {/* Mobile Title */}
          {isMobile && (
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">{title}</h1>
              <p className="text-xs text-muted-foreground">
                {currentPage}/{totalPages}
              </p>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              <Bookmark className="h-4 w-4" />
              {!isMobile && "Bookmarks"}
            </Button>

            <Button variant="outline" size="sm" onClick={addBookmark}>
              <Bookmark className="h-4 w-4" />
              {!isMobile && "Add"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation and Zoom Controls */}
        <div className="flex items-center justify-between mt-3 gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="px-3 py-1 bg-muted rounded text-sm min-w-0">
              <span className="hidden sm:inline">Page </span>
              {currentPage}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <div className="px-3 py-1 bg-muted rounded text-sm min-w-[60px] text-center">
              {zoom}%
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <Progress value={(currentPage / totalPages) * 100} className="h-2" />
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Sidebar - Bookmarks */}
        {showBookmarks && (
          <div
            className={`${isMobile ? "absolute inset-0 z-10 bg-card" : "w-80"} border-r border-border p-4 overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Bookmarks</h3>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBookmarks(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {bookmarks.map((bookmark, index) => (
                <Card
                  key={index}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => goToPage(bookmark.page)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{bookmark.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Page {bookmark.page}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {bookmark.page}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {bookmarks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No bookmarks yet</p>
                <p className="text-xs">Add bookmarks to save your progress</p>
              </div>
            )}
          </div>
        )}

        {/* PDF Viewer Area */}
        <div className="flex-1 bg-muted/30 p-4 overflow-auto">
          <div className="mx-auto max-w-4xl">
            {/* PDF Viewer Area - Embedded Documentation */}
            <div
              className="bg-card shadow-lg mx-auto border border-border rounded-lg overflow-hidden"
              style={{
                width: `${zoom}%`,
                minHeight: "600px",
                maxWidth: "100%",
              }}
            >
              <iframe
                src={pdfUrl}
                title={title}
                className="w-full h-full min-h-[600px] border-0"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "top left",
                  width: `${100 / (zoom / 100)}%`,
                  height: `${100 / (zoom / 100)}%`,
                }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm font-medium">
              {currentPage} / {totalPages}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBookmarks(!showBookmarks)}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={addBookmark}>
                <Bookmark className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
