"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import BookmarkButton from "./BookmarkButton";

interface BookmarkButtonWrapperProps {
  bookId: string;
}

export default function BookmarkButtonWrapper({ bookId }: BookmarkButtonWrapperProps) {
  const { data: session } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const checkBookmarkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookmarks?bookId=${bookId}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.isBookmarked || false);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }, [bookId]);

  // Check if user has bookmarked this book
  useEffect(() => {
    if (session?.user) {
      checkBookmarkStatus();
    } else {
      setIsBookmarked(false);
    }
  }, [session?.user, checkBookmarkStatus]);

  return (
    <BookmarkButton 
      bookId={bookId} 
      isBookmarked={isBookmarked}
      onBookmarkChange={setIsBookmarked}
    />
  );
}

