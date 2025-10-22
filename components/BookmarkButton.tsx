"use client";

import { useState } from "react";
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

  const handleBookmarkClick = async () => {
    // Check if user is logged in
    if (status === "loading") {
      return; // Still loading
    }

    if (!session) {
      // User not logged in, redirect to login
      await signIn();
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
          // Stay on current page - no redirect needed
        } else {
          const error = await response.json();
          if (response.status === 401) {
            // User not authenticated, redirect to login
            await signIn();
          } else {
            alert(error.error || 'Failed to bookmark book');
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
      className={`w-full py-3 rounded-md transition font-medium flex items-center justify-center gap-2 ${
        bookmarked 
          ? 'bg-[#f97316] text-white hover:bg-[#ea580c]' 
          : 'bg-[#f97316] text-white hover:bg-[#ea580c]'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
      {isLoading ? 'Processing...' : bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
