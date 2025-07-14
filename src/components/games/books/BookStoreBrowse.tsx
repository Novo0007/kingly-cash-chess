import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Star,
  Clock,
  Coins,
  Search,
  Filter,
  Crown,
  Heart,
  Zap,
  CheckCircle,
  Sparkles,
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

interface BookStoreBrowseProps {
  books: Book[];
  userBooks: UserBook[];
  userCoins: number;
  onPurchaseBook: (book: Book) => void;
  onOpenBook: (book: Book) => void;
  loading: boolean;
}

export const BookStoreBrowse: React.FC<BookStoreBrowseProps> = ({
  books,
  userBooks,
  userCoins,
  onPurchaseBook,
  onOpenBook,
  loading,
}) => {
  const { isMobile } = useDeviceType();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Get genres from books
  const genres = useMemo(() => {
    const genreSet = new Set(books.map((book) => book.genre));
    return Array.from(genreSet);
  }, [books]);

  // Check if user owns a book
  const isBookOwned = (bookId: string) => {
    return userBooks.some((userBook) => userBook.book_id === bookId);
  };

  // Filter books based on search and filters
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre =
        selectedGenre === "all" || book.genre === selectedGenre;
      const matchesDifficulty =
        selectedDifficulty === "all" ||
        book.difficulty_level === selectedDifficulty;

      return matchesSearch && matchesGenre && matchesDifficulty;
    });
  }, [books, searchTerm, selectedGenre, selectedDifficulty]);

  // Separate featured and regular books
  const featuredBooks = filteredBooks.filter((book) => book.is_featured);
  const regularBooks = filteredBooks.filter((book) => !book.is_featured);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getGenreColor = (genre: string) => {
    const colors = {
      strategy: "bg-blue-100 text-blue-800 border-blue-200",
      technology: "bg-purple-100 text-purple-800 border-purple-200",
      health: "bg-green-100 text-green-800 border-green-200",
      writing: "bg-pink-100 text-pink-800 border-pink-200",
      lifestyle: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      colors[genre as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const BookCard = ({
    book,
    isFeatured = false,
  }: {
    book: Book;
    isFeatured?: boolean;
  }) => {
    const owned = isBookOwned(book.id);
    const canAfford = userCoins >= book.price_coins;

    return (
      <Card
        className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
          isFeatured
            ? "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
            : "bg-white border border-gray-200"
        }`}
      >
        {isFeatured && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {owned && (
          <div className="absolute top-2 left-2 z-10">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Owned
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle
                className={`text-lg font-bold line-clamp-2 ${isMobile ? "text-base" : ""}`}
              >
                {book.title}
              </CardTitle>
              <p className="text-sm text-gray-600 font-medium mt-1">
                by {book.author}
              </p>
            </div>
            <div className="text-4xl ml-2">📖</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {book.description}
          </p>

          {/* Book Info */}
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(book.difficulty_level)}>
              {book.difficulty_level}
            </Badge>
            <Badge className={getGenreColor(book.genre)}>{book.genre}</Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{book.pages} pages</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {book.reading_time_minutes}m read
              </span>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-bold text-lg text-gray-800">
                {book.price_coins}
              </span>
            </div>

            {owned ? (
              <Button
                onClick={() => onOpenBook(book)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Read
              </Button>
            ) : (
              <Button
                onClick={() => onPurchaseBook(book)}
                disabled={!canAfford}
                className={`font-semibold ${
                  canAfford
                    ? "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Coins className="h-4 w-4 mr-2" />
                {canAfford ? "Buy" : "Need more coins"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-300/30 to-blue-300/30 rounded-full blur-xl animate-pulse"></div>
          <div className="relative text-5xl">📚✨</div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Book Store
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Discover amazing books and expand your knowledge with our curated
          collection
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search books, authors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-purple-200 focus:border-purple-400"
              />
            </div>

            {/* Filters */}
            <div
              className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-2"}`}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Books */}
      {featuredBooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-800">Featured Books</h2>
            <Sparkles className="h-6 w-6 text-yellow-600" />
          </div>
          <div
            className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`}
          >
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} isFeatured={true} />
            ))}
          </div>
        </div>
      )}

      {/* All Books */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-600" />
            All Books
          </h2>
          <span className="text-gray-600">
            {filteredBooks.length} books found
          </span>
        </div>

        {filteredBooks.length === 0 ? (
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No books found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={`grid gap-6 ${isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"}`}
          >
            {regularBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600">
                {books.length}
              </div>
              <div className="text-gray-600 font-medium">Total Books</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {userBooks.length}
              </div>
              <div className="text-gray-600 font-medium">Books Owned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {userCoins}
              </div>
              <div className="text-gray-600 font-medium">Available Coins</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
