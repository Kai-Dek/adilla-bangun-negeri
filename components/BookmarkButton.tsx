"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  bookId: string;
  isBookmarked?: boolean;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({ 
  bookId, 
  isBookmarked = false, 
  onBookmarkChange 
}: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  // Sinkronisasi state lokal jika status bookmark diperbarui dari server/parent
  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const handleBookmarkClick = async () => {
    // Check if user is logged in
    if (status === "loading") {
      return; // Still loading
    }

    if (!session) {
      // User not logged in, redirect to login
      await signIn(undefined, { callbackUrl: window.location.href });
      return;
    }

    setIsLoading(true);

    try {
      if (bookmarked) {
        // Remove bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookId }),
        });

        if (response.ok) {
          setBookmarked(false);
          onBookmarkChange?.(false);
        } else {
          const error = await response.json();
          alert(error.error || 'Failed to remove bookmark');
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookId }),
        });

        if (response.ok) {
          setBookmarked(true);
          onBookmarkChange?.(true);
        } else {
          const error = await response.json();
          if (response.status === 401) {
            // User not authenticated, redirect to login
            await signIn(undefined, { callbackUrl: window.location.href });
          } else if (error.error === "Book already bookmarked" || error.message === "Book already bookmarked") {
            // Jika status bookmark di backend sudah aktif, sinkronkan state UI agar user bisa melepasnya
            setBookmarked(true);
            onBookmarkChange?.(true);
          } else {
            alert(error.error || error.message || 'Failed to bookmark book');
          }
        }
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
      alert('An error occurred while processing your request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleBookmarkClick}
      disabled={isLoading}
      className={`w-full py-3 rounded-md transition-all duration-200 font-medium flex items-center justify-center gap-2 ${
        bookmarked 
          ? 'bg-[#f97316] text-white hover:bg-[#ea580c] shadow-md ring-2 ring-orange-400/30' 
          : 'bg-white border-2 border-[#f97316] text-[#f97316] hover:bg-orange-50'
      } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]'}`}
    >
      <Bookmark 
        className={`w-5 h-5 transition-transform duration-200 ${bookmarked ? 'scale-110' : ''}`}
        fill={bookmarked ? "currentColor" : "none"} 
      />
      {isLoading ? 'Memproses...' : bookmarked ? 'Tersimpan' : 'Bookmark'}
    </button>
  );
}
