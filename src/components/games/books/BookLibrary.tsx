import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Star,
  Clock,
  Heart,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  CheckCircle,
  BookMarked,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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

interface BookLibraryProps {
  userBooks: UserBook[];
  onOpenBook: (book: Book) => void;
  onUpdateProgress: (bookId: string, progress: number) => void;
  loading: boolean;
}

export const BookLibrary: React.FC<BookLibraryProps> = ({
  userBooks,
  onOpenBook,
  onUpdateProgress,
  loading,
}) => {
  const { isMobile } = useDeviceType();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "progress" | "title">(
    "recent",
  );

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = userBooks.filter(
      (userBook) =>
        userBook.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userBook.book.author.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => {
          const dateA = a.last_read_at ? new Date(a.last_read_at).getTime() : 0;
          const dateB = b.last_read_at ? new Date(b.last_read_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "progress":
        filtered.sort((a, b) => b.reading_progress - a.reading_progress);
        break;
      case "title":
        filtered.sort((a, b) => a.book.title.localeCompare(b.book.title));
        break;
    }

    return filtered;
  }, [userBooks, searchTerm, sortBy]);

  // Get reading statistics
  const readingStats = useMemo(() => {
    const completedBooks = userBooks.filter(
      (book) => book.reading_progress >= 100,
    ).length;
    const inProgressBooks = userBooks.filter(
      (book) => book.reading_progress > 0 && book.reading_progress < 100,
    ).length;
    const totalProgress = userBooks.reduce(
      (sum, book) => sum + book.reading_progress,
      0,
    );
    const averageProgress =
      userBooks.length > 0 ? Math.round(totalProgress / userBooks.length) : 0;

    return {
      total: userBooks.length,
      completed: completedBooks,
      inProgress: inProgressBooks,
      notStarted: userBooks.length - completedBooks - inProgressBooks,
      averageProgress,
    };
  }, [userBooks]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress > 0) return "bg-yellow-500";
    return "bg-gray-300";
  };

  const getProgressText = (progress: number) => {
    if (progress >= 100) return "Completed";
    if (progress > 0) return `${progress}% read`;
    return "Not started";
  };

  const formatLastRead = (lastReadAt?: string) => {
    if (!lastReadAt) return "Never";
    const date = new Date(lastReadAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center py-12">
          <div className="text-5xl animate-bounce mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-800">
            Loading your library...
          </h3>
        </div>
      </div>
    );
  }

  if (userBooks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Your Library is Empty
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Start building your collection by purchasing books from the store!
            </p>
            <div className="flex justify-center gap-2 text-3xl">
              <span className="animate-bounce">✨</span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.5s" }}
              >
                📖
              </span>
              <span className="animate-bounce" style={{ animationDelay: "1s" }}>
                💫
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-300/30 to-purple-300/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative text-5xl">📖💜</div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          My Library
        </h1>
        <p className="text-gray-600 text-lg">
          Your personal collection of books and reading progress
        </p>
      </div>

      {/* Reading Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Reading Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {readingStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Books</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {readingStats.completed}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {readingStats.inProgress}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {readingStats.averageProgress}%
              </div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Sort */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div
            className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "recent" | "progress" | "title")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-blue-400"
            >
              <option value="recent">Recently Read</option>
              <option value="progress">Reading Progress</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {filteredAndSortedBooks.length === 0 ? (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No books found
            </h3>
            <p className="text-gray-600">Try adjusting your search term</p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`}
        >
          {filteredAndSortedBooks.map((userBook) => (
            <Card
              key={userBook.id}
              className="relative overflow-hidden bg-white border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              {/* Progress Badge */}
              <div className="absolute top-2 right-2 z-10">
                {userBook.reading_progress >= 100 ? (
                  <Badge className="bg-green-500 text-white border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                ) : userBook.reading_progress > 0 ? (
                  <Badge className="bg-blue-500 text-white border-0">
                    {userBook.reading_progress}%
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500 text-white border-0">New</Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle
                      className={`text-lg font-bold line-clamp-2 ${isMobile ? "text-base" : ""}`}
                    >
                      {userBook.book.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 font-medium mt-1">
                      by {userBook.book.author}
                    </p>
                  </div>
                  <div className="text-4xl ml-2">📖</div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                  {userBook.book.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-gray-800">
                      {getProgressText(userBook.reading_progress)}
                    </span>
                  </div>
                  <Progress value={userBook.reading_progress} className="h-2" />
                </div>

                {/* Book Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BookMarked className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {userBook.book.pages} pages
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {userBook.book.reading_time_minutes}m
                    </span>
                  </div>
                </div>

                {/* Last Read */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Last read: {formatLastRead(userBook.last_read_at)}
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onOpenBook(userBook.book)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {userBook.reading_progress >= 100
                    ? "Read Again"
                    : userBook.reading_progress > 0
                      ? "Continue Reading"
                      : "Start Reading"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
