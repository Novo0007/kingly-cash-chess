import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookLibrary } from "./BookLibrary";
import { BookReader } from "./BookReader";
import { BookStoreBrowse } from "./BookStoreBrowse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Library,
  Store,
  Coins,
  Star,
  Sparkles,
  Heart,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
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

interface BookStoreProps {
  onBack: () => void;
  user: any;
}

type BookView = "browse" | "library" | "reader";

// Sample books as fallback when database is not available
const getSampleBooks = (): Book[] => [
  {
    id: "sample-1",
    title: "The Art of Strategy",
    author: "Sun Tzu",
    description:
      "Master the ancient art of strategic thinking and apply it to modern life and games.",
    genre: "strategy",
    price_coins: 150,
    pages: 12,
    reading_time_minutes: 45,
    difficulty_level: "intermediate",
    is_featured: true,
    content: `# Chapter 1: Understanding Strategy

Strategy is not just about winning battles, but about understanding the battlefield itself. In games, as in life, those who can see three moves ahead will always triumph over those who react to the present moment.

## The Foundation of Strategic Thinking

Every great strategist begins with observation. Watch your opponent, understand their patterns, and learn their weaknesses. This principle applies whether you're playing chess, planning a business venture, or navigating social situations.

## Key Principles:

1. **Know Yourself**: Understand your strengths and limitations
2. **Know Your Opponent**: Study their habits and tendencies
3. **Control the Environment**: Shape the battlefield to your advantage
4. **Adapt and Overcome**: Be flexible in your approach

The greatest victories are won before the battle begins. By positioning yourself advantageously and forcing your opponent into unfavorable situations, you create opportunities for success.

Remember: Strategy without action is just dreaming, but action without strategy is just chaos.`,
  },
  {
    id: "sample-2",
    title: "Programming for Beginners",
    author: "Jane Code",
    description:
      "Start your journey into the wonderful world of programming with this beginner-friendly guide.",
    genre: "technology",
    price_coins: 200,
    pages: 15,
    reading_time_minutes: 60,
    difficulty_level: "beginner",
    is_featured: true,
    content: `# Welcome to Programming!

Programming is like learning a new language - one that allows you to communicate with computers and bring your ideas to life. Don't worry if it seems intimidating at first; every expert was once a beginner.

## What is Programming?

Programming is the process of creating instructions for computers to follow. These instructions, called code, tell the computer exactly what to do step by step.

## Your First Program

Let's start with the classic "Hello, World!" program:

print("Hello, World!")

This simple line tells the computer to display the text "Hello, World!" on the screen. Congratulations - you've just learned your first programming concept!

## Basic Concepts:

1. **Variables**: Containers that store data
2. **Functions**: Reusable blocks of code
3. **Loops**: Instructions that repeat
4. **Conditionals**: Code that makes decisions

Remember: Programming is about solving problems creatively. Start small, be patient with yourself, and celebrate every victory!`,
  },
  {
    id: "sample-3",
    title: "Mindfulness in Daily Life",
    author: "Dr. Sarah Peace",
    description:
      "Discover the power of mindfulness and learn practical techniques for a more peaceful, focused life.",
    genre: "health",
    price_coins: 120,
    pages: 10,
    reading_time_minutes: 35,
    difficulty_level: "beginner",
    is_featured: false,
    content: `# The Journey to Mindfulness

Mindfulness is the practice of being fully present in the moment, aware of where you are and what you're doing, without being overwhelmed by what's happening around you.

## What is Mindfulness?

Mindfulness is a basic human ability to be fully present, aware of where we are and what we're doing, and not overly reactive or overwhelmed by what's happening around us.

## Simple Mindfulness Exercises:

### 1. Breathing Meditation
- Find a comfortable position
- Focus on your breath
- When your mind wanders, gently return to your breath
- Start with just 5 minutes daily

### 2. Body Scan
- Lie down comfortably
- Focus attention on different parts of your body
- Notice sensations without judgment
- Move from toes to head systematically

## Benefits of Regular Practice:

- Reduced stress and anxiety
- Improved focus and concentration
- Better emotional regulation
- Enhanced self-awareness
- Improved relationships

Remember: Mindfulness is not about emptying your mind, but about being aware of what's in it.`,
  },
];

export const BookStore: React.FC<BookStoreProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<BookView>("browse");
  const [books, setBooks] = useState<Book[]>([]);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);

  // Initialize user coins if needed
  const initializeUserCoins = useCallback(async () => {
    if (!user) return;

    try {
      const { data: existingCoins, error: fetchError } = await supabase
        .from("user_coins")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error(
          "Error fetching user coins:",
          fetchError.message,
          fetchError,
        );
        // If table doesn't exist, set default coins
        setUserCoins(1000);
        return;
      }

      if (!existingCoins) {
        const { error } = await supabase.from("user_coins").insert([
          {
            user_id: user.id,
            balance: 1000,
            total_earned: 1000,
            total_spent: 0,
          },
        ]);

        if (error) {
          console.error("Error creating user coins:", error.message, error);
          // Set default coins even if insert fails
          setUserCoins(1000);
        } else {
          setUserCoins(1000);
        }
      } else {
        setUserCoins(existingCoins.balance);
      }
    } catch (error) {
      console.error(
        "Error initializing user coins:",
        error instanceof Error ? error.message : error,
      );
      // Set default coins as fallback
      setUserCoins(1000);
    }
  }, [user]);

  // Fetch all books
  const fetchBooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching books:", error.message, error);
        // If books table doesn't exist, create sample books in memory
        if (error.message.includes("does not exist")) {
          console.log("Books table doesn't exist, using sample data");
          setDatabaseAvailable(false);
          setBooks(getSampleBooks());
          return;
        }
        toast.error("Failed to load books");
        return;
      }

      setBooks(data || getSampleBooks());
    } catch (error) {
      console.error(
        "Error fetching books:",
        error instanceof Error ? error.message : error,
      );
      toast.error("Failed to load books");
      // Use sample books as fallback
      setBooks(getSampleBooks());
    }
  }, []);

  // Fetch user's purchased books
  const fetchUserBooks = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_books")
        .select(
          `
          *,
          book:books(*)
        `,
        )
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) {
        console.error("Error fetching user books:", error.message, error);
        // If table doesn't exist, start with empty array
        if (error.message.includes("does not exist")) {
          console.log(
            "User books table doesn't exist, starting with empty library",
          );
          setUserBooks([]);
          return;
        }
        setUserBooks([]);
        return;
      }

      setUserBooks(data || []);
    } catch (error) {
      console.error(
        "Error fetching user books:",
        error instanceof Error ? error.message : error,
      );
      setUserBooks([]);
    }
  }, [user]);

  // Fetch user coins
  const fetchUserCoins = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_coins")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user coins:", error.message, error);
        // If table doesn't exist or no record found, use default
        if (
          error.code === "PGRST116" ||
          error.message.includes("does not exist")
        ) {
          setUserCoins(1000);
          return;
        }
        setUserCoins(1000);
        return;
      }

      setUserCoins(data?.balance || 1000);
    } catch (error) {
      console.error(
        "Error fetching user coins:",
        error instanceof Error ? error.message : error,
      );
      setUserCoins(1000);
    }
  }, [user]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);

      // Try to fetch books first to test database availability
      try {
        const { error } = await supabase.from("books").select("id").limit(1);
        if (error && error.message.includes("does not exist")) {
          console.log("Database tables not found, running in demo mode");
          setDatabaseAvailable(false);
          setBooks(getSampleBooks());
          setUserCoins(1000);
          setUserBooks([]);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.log("Database not accessible, running in demo mode");
        setDatabaseAvailable(false);
        setBooks(getSampleBooks());
        setUserCoins(1000);
        setUserBooks([]);
        setLoading(false);
        return;
      }

      // Database is available, fetch real data
      await Promise.all([
        initializeUserCoins(),
        fetchBooks(),
        fetchUserBooks(),
        fetchUserCoins(),
      ]);
      setLoading(false);
    };

    initializeData();
  }, [initializeUserCoins, fetchBooks, fetchUserBooks, fetchUserCoins]);

  // Purchase a book
  const purchaseBook = async (book: Book) => {
    if (!user) return;

    // Check if user has enough coins
    if (userCoins < book.price_coins) {
      toast.error(
        `You need ${book.price_coins} coins to purchase this book. You have ${userCoins} coins.`,
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(244, 114, 182, 0.9))",
            color: "white",
            border: "none",
          },
        },
      );
      return;
    }

    // Check if user already owns the book
    const alreadyOwned = userBooks.some(
      (userBook) => userBook.book_id === book.id,
    );
    if (alreadyOwned) {
      toast.error("You already own this book!", {
        style: {
          background:
            "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(244, 114, 182, 0.9))",
          color: "white",
          border: "none",
        },
      });
      return;
    }

    try {
      // Try to call the stored procedure first
      const { data, error } = await supabase.rpc("purchase_book", {
        user_id_param: user.id,
        book_id_param: book.id,
      });

      if (error && !error.message.includes("does not exist")) {
        console.error("Error purchasing book:", error.message, error);
        toast.error("Failed to purchase book");
        return;
      }

      // If stored procedure exists and works
      if (!error && data) {
        const result = data as any;
        if (result.success) {
          toast.success("�� Book purchased successfully!", {
            style: {
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(59, 130, 246, 0.9))",
              color: "white",
              border: "none",
            },
          });
          setUserCoins(result.new_balance);
          await fetchUserBooks();
          return;
        } else {
          toast.error(result.message, {
            style: {
              background:
                "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(244, 114, 182, 0.9))",
              color: "white",
              border: "none",
            },
          });
          return;
        }
      }

      // Fallback: Manual purchase logic when database functions don't exist
      console.log("Using fallback purchase logic");

      // Simulate successful purchase
      const newBalance = userCoins - book.price_coins;
      setUserCoins(newBalance);

      // Add book to user's library (in memory only)
      const newUserBook: UserBook = {
        id: `user-book-${Date.now()}`,
        book_id: book.id,
        reading_progress: 0,
        is_favorite: false,
        book: book,
      };
      setUserBooks((prev) => [newUserBook, ...prev]);

      toast.success("📚 Book purchased successfully!", {
        style: {
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(59, 130, 246, 0.9))",
          color: "white",
          border: "none",
        },
      });
    } catch (error) {
      console.error(
        "Error purchasing book:",
        error instanceof Error ? error.message : error,
      );
      toast.error("Failed to purchase book");
    }
  };

  // Open book for reading
  const openBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentView("reader");
  };

  // Update reading progress
  const updateReadingProgress = async (bookId: string, progress: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_books")
        .update({
          reading_progress: progress,
          last_read_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("book_id", bookId);

      if (error) {
        console.error("Error updating reading progress:", error.message, error);
        // Fallback: Update progress in memory only
        setUserBooks((prev) =>
          prev.map((userBook) =>
            userBook.book_id === bookId
              ? {
                  ...userBook,
                  reading_progress: progress,
                  last_read_at: new Date().toISOString(),
                }
              : userBook,
          ),
        );
      }
    } catch (error) {
      console.error(
        "Error updating reading progress:",
        error instanceof Error ? error.message : error,
      );
      // Fallback: Update progress in memory only
      setUserBooks((prev) =>
        prev.map((userBook) =>
          userBook.book_id === bookId
            ? {
                ...userBook,
                reading_progress: progress,
                last_read_at: new Date().toISOString(),
              }
            : userBook,
        ),
      );
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "browse":
        return (
          <BookStoreBrowse
            books={books}
            userBooks={userBooks}
            userCoins={userCoins}
            onPurchaseBook={purchaseBook}
            onOpenBook={openBook}
            loading={loading}
          />
        );
      case "library":
        return (
          <BookLibrary
            userBooks={userBooks}
            onOpenBook={openBook}
            onUpdateProgress={updateReadingProgress}
            loading={loading}
          />
        );
      case "reader":
        return selectedBook ? (
          <BookReader
            book={selectedBook}
            onBack={() => setCurrentView("library")}
            onUpdateProgress={updateReadingProgress}
            userBooks={userBooks}
          />
        ) : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">📚</div>
          <h3 className="text-xl font-bold text-gray-800">
            Loading Book Store...
          </h3>
          <p className="text-gray-600">Preparing your reading adventure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Database Notice */}
      {!databaseAvailable && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-500 p-4">
          <div className="flex items-center max-w-6xl mx-auto">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h4 className="text-yellow-800 font-semibold">Demo Mode</h4>
              <p className="text-yellow-700 text-sm">
                Book store is running in demo mode with sample data. Purchases
                and progress won't be saved permanently.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 p-4 bg-white/90 backdrop-blur-sm border-b border-purple-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentView("browse")}
              variant={currentView === "browse" ? "default" : "outline"}
              className={`${
                currentView === "browse"
                  ? "bg-purple-600 text-white"
                  : "border-purple-300 text-purple-600"
              } ${isMobile ? "px-3" : "px-4"}`}
            >
              <Store className="h-4 w-4 mr-2" />
              {!isMobile && "Browse"}
            </Button>
            <Button
              onClick={() => setCurrentView("library")}
              variant={currentView === "library" ? "default" : "outline"}
              className={`${
                currentView === "library"
                  ? "bg-purple-600 text-white"
                  : "border-purple-300 text-purple-600"
              } ${isMobile ? "px-3" : "px-4"}`}
            >
              <Library className="h-4 w-4 mr-2" />
              {!isMobile && "Library"}
            </Button>
          </div>

          {/* Coins Display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl px-3 py-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <span className="font-bold text-yellow-800">{userCoins}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-8">{renderCurrentView()}</div>
    </div>
  );
};
