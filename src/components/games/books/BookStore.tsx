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

export const BookStore: React.FC<BookStoreProps> = ({ onBack, user }) => {
  const { isMobile } = useDeviceType();
  const [currentView, setCurrentView] = useState<BookView>("browse");
  const [books, setBooks] = useState<Book[]>([]);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);

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
        console.error("Error fetching books:", error);
        toast.error("Failed to load books");
        return;
      }

      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Failed to load books");
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
        console.error("Error fetching user books:", error);
        return;
      }

      setUserBooks(data || []);
    } catch (error) {
      console.error("Error fetching user books:", error);
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
        console.error("Error fetching user coins:", error);
        return;
      }

      setUserCoins(data?.balance || 0);
    } catch (error) {
      console.error("Error fetching user coins:", error);
    }
  }, [user]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
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

    try {
      // Call the stored procedure
      const { data, error } = await supabase.rpc("purchase_book", {
        user_id_param: user.id,
        book_id_param: book.id,
      });

      if (error) {
        console.error("Error purchasing book:", error);
        toast.error("Failed to purchase book");
        return;
      }

      const result = data as any;

      if (result.success) {
        toast.success("📚 Book purchased successfully!", {
          style: {
            background:
              "linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(59, 130, 246, 0.9))",
            color: "white",
            border: "none",
          },
        });
        setUserCoins(result.new_balance);
        await fetchUserBooks();
      } else {
        toast.error(result.message, {
          style: {
            background:
              "linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(244, 114, 182, 0.9))",
            color: "white",
            border: "none",
          },
        });
      }
    } catch (error) {
      console.error("Error purchasing book:", error);
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
        console.error("Error updating reading progress:", error);
      }
    } catch (error) {
      console.error("Error updating reading progress:", error);
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
