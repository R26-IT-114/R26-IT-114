import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * InfiniteScrollList - Component for infinite scroll/lazy loading functionality
 * Observes when user scrolls near the bottom and loads more items
 * 
 * Props:
 * - items: Array of items to display
 * - itemsPerPage: Number of items to load per batch (default: 3)
 * - renderItem: Function to render each item
 * - isLoading: Boolean indicating if items are being loaded
 * - hasMore: Boolean indicating if there are more items to load
 */
const InfiniteScrollList = ({
  items,
  itemsPerPage = 3,
  renderItem,
  isLoading = false,
  hasMore = true,
  onLoadMore,
}) => {
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage);
  const observerTarget = useRef(null);

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && displayedCount < items.length) {
          // Load more items
          setDisplayedCount((prev) => Math.min(prev + itemsPerPage, items.length));
          onLoadMore?.();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, displayedCount, items.length, itemsPerPage, onLoadMore]);

  const displayedItems = items.slice(0, displayedCount);

  return (
    <div className="w-full">
      <div className="space-y-10">
        {displayedItems.map((item, index) => (
          <div key={item.id || index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Intersection observer target */}
      <div ref={observerTarget} className="py-8" />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-lime-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}

      {/* End of list message */}
      {displayedCount >= items.length && items.length > 0 && (
        <div className="text-center py-8">
          <p className="text-green-700 font-bold">🏁 අද පාඩම් මාලාව සම්පූර්ණයි!</p>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">කිසිදු ක්‍රීඩා තොරතුරු නොමැත</p>
        </div>
      )}
    </div>
  );
};

InfiniteScrollList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  itemsPerPage: PropTypes.number,
  renderItem: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  hasMore: PropTypes.bool,
  onLoadMore: PropTypes.func,
};

export default InfiniteScrollList;
