import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Star,
  Type,
  Sun,
  Moon,
  Settings,
  BookMarked,
  Clock,
  Eye,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url?: string;
  content: string;
  genre: string;
  price_coins: number;
  pages: number;
  reading_time_minutes: number;
  difficulty_level: string;
  is_featured: boolean;
}

interface UserBook {
  id: string;
  book_id: string;
  reading_progress: number;
  last_read_at?: string;
  is_favorite: boolean;
  book: Book;
}

interface BookReaderProps {
  book: Book;
  onBack: () => void;
  onUpdateProgress: (bookId: string, progress: number) => void;
  userBooks: UserBook[];
}

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  onBack,
  onUpdateProgress,
  userBooks,
}) => {
  const { isMobile } = useDeviceType();
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  // Get user's progress for this book
  const userBook = userBooks.find((ub) => ub.book_id === book.id);
  const savedProgress = userBook?.reading_progress || 0;

  // Split content into pages (roughly 500 words per page)
  const pages = useMemo(() => {
    const words = book.content.split(/\s+/);
    const wordsPerPage = isMobile ? 300 : 500;
    const pageCount = Math.ceil(words.length / wordsPerPage);

    const pageArray = [];
    for (let i = 0; i < pageCount; i++) {
      const startIndex = i * wordsPerPage;
      const endIndex = Math.min(startIndex + wordsPerPage, words.length);
      pageArray.push(words.slice(startIndex, endIndex).join(" "));
    }

    return pageArray;
  }, [book.content, isMobile]);

  // Initialize current page based on saved progress
  useEffect(() => {
    if (savedProgress > 0) {
      const pageFromProgress = Math.floor((savedProgress / 100) * pages.length);
      setCurrentPage(pageFromProgress);
    }
  }, [savedProgress, pages.length]);

  // Track reading time
  useEffect(() => {
    const timer = setInterval(() => {
      setReadingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update progress when page changes
  useEffect(() => {
    if (pages.length > 0) {
      const progress = Math.round(((currentPage + 1) / pages.length) * 100);
      onUpdateProgress(book.id, progress);
    }
  }, [currentPage, pages.length, book.id, onUpdateProgress]);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < pages.length) {
      setCurrentPage(pageNumber);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const currentProgress =
    pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0;

  const readerTheme = isDarkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-900";

  const cardTheme = isDarkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${readerTheme}`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-800/95 border-gray-700"
            : "bg-white/95 border-gray-200"
        } backdrop-blur-sm`}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className={isDarkMode ? "text-gray-300 hover:text-white" : ""}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className={`hidden ${isMobile ? "" : "md:block"}`}>
                <h1 className="font-bold text-lg line-clamp-1">{book.title}</h1>
                <p
                  className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
                >
                  by {book.author}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Reading Stats */}
              <div
                className={`hidden ${isMobile ? "" : "sm:flex"} items-center gap-4 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(readingTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookMarked className="h-4 w-4" />
                  <span>
                    {currentPage + 1}/{pages.length}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="ghost"
                size="sm"
                className={isDarkMode ? "text-gray-300 hover:text-white" : ""}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <Progress value={currentProgress} className="h-2" />
            <div
              className={`flex justify-between text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              <span>{Math.round(currentProgress)}% complete</span>
              <span>
                Page {currentPage + 1} of {pages.length}
              </span>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <Card className={`mt-4 ${cardTheme}`}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Font Size
                    </label>
                    <input
                      type="range"
                      min={12}
                      max={24}
                      step={1}
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div
                      className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {fontSize}px
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Theme
                    </label>
                    <Button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isDarkMode ? (
                        <>
                          <Sun className="h-4 w-4 mr-2" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="h-4 w-4 mr-2" />
                          Dark Mode
                        </>
                      )}
                    </Button>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Go to Page
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={pages.length}
                      value={currentPage + 1}
                      onChange={(e) => goToPage(parseInt(e.target.value) - 1)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reader Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className={`${cardTheme} min-h-[60vh]`}>
          <CardContent className="p-8">
            <div
              className={`prose max-w-none leading-relaxed transition-all duration-300`}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: "1.8",
                color: isDarkMode ? "#e5e7eb" : "#374151",
              }}
            >
              <div className="whitespace-pre-wrap">{pages[currentPage]}</div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            onClick={goToPreviousPage}
            disabled={currentPage === 0}
            variant="outline"
            className={`${isDarkMode ? "border-gray-600 text-gray-300 hover:text-white" : ""}`}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div
            className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Page {currentPage + 1} of {pages.length}
          </div>

          <Button
            onClick={goToNextPage}
            disabled={currentPage === pages.length - 1}
            variant="outline"
            className={`${isDarkMode ? "border-gray-600 text-gray-300 hover:text-white" : ""}`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Book Complete Message */}
        {currentPage === pages.length - 1 && (
          <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Congratulations!
              </h3>
              <p className="text-green-700 mb-4">
                You've completed "{book.title}"!
              </p>
              <div className="flex justify-center gap-4">
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <BookOpen className="h-4 w-4 mr-2" />
                  100% Complete
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(readingTime)} reading time
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
