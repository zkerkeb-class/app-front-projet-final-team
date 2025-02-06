import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  type: 'artist' | 'album';
}

/**
 * A reusable skeleton loader component for artists and albums
 * @param {SkeletonLoaderProps} props - The component props
 * @returns {JSX.Element} The skeleton loader component
 */
export default function SkeletonLoader({
  count = 5,
  type,
}: SkeletonLoaderProps) {
  return (
    <div className="flex gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex-none w-48 animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="relative aspect-square bg-gray-200 dark:bg-gray-700" />
            <div className="p-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              {type === 'artist' && (
                <div className="mt-2 flex gap-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
                </div>
              )}
              {type === 'album' && (
                <div className="mt-2 flex justify-between">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
