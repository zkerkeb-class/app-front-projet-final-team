import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';
import { SearchResult } from '@/types/search';
import { gql, useLazyQuery } from '@apollo/client';
import { formatSearchResults } from '@/utils/searchUtils';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SEARCH_QUERY = gql`
  query Search($input: SearchInput!) {
    search(input: $input) {
      tracks {
        artist_id
        artist_name
        album_id
        album_name
        id
        image_url
        name
      }
      artists {
        id
        image_url
        name
      }
      albums {
        id
        image_url
        name
      }
      playlists {
        id
        image_url
        name
      }
    }
  }
`;

const SearchSkeleton = () => (
  <div className="py-2">
    {Array.from({ length: 3 }).map((_, categoryIndex) => (
      <div key={categoryIndex}>
        <div className="px-3 py-1">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {Array.from({ length: 2 }).map((_, itemIndex) => (
          <div key={itemIndex} className="p-3 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default function SearchBar() {
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [search, { loading: isLoading, error }] = useLazyQuery(SEARCH_QUERY, {
    onCompleted: (data) => {
      const formattedResults = formatSearchResults(data.search);
      setResults(formattedResults);
    },
    onError: (error) => {
      console.error('Erreur de recherche:', error);
      setResults([]);
    },
  });

  const performSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      search({
        variables: {
          input: {
            query: searchQuery,
            limit: 3,
          },
        },
      });
    },
    [search],
  );

  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => performSearch(searchQuery), 300),
    [performSearch],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  const renderSearchResult = (result: SearchResult) => (
    <div
      key={result.id}
      onClick={() => {
        if (result.type === 'album') {
          router.push(`/album/${result.id}`);
        } else if (result.type === 'artist') {
          router.push(`/artist/${result.id}`);
        } else if (result.type === 'track') {
          router.push(`/album/${result.album_id}?trackId=${result.id}`);
        }
        setShowResults(false);
      }}
      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-3"
    >
      <div className="flex-shrink-0">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
          <Image
            src={result.image_url.urls.medium.webp}
            alt={result.title}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {result.title}
        </div>
        {result.type === 'track' ? (
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <span>
              {result.artist_name} • {result.album_name}
            </span>
          </div>
        ) : (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {result.subtitle}
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          placeholder={t('search.placeholder')}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                   text-gray-900 dark:text-white placeholder-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {query.trim() !== '' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('search.pressEnter')}
              </span>
            )}
          </div>
        )}
      </div>

      {showResults && (query.trim() !== '' || isLoading) && (
        <div
          className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                      max-h-96 overflow-y-auto z-50"
        >
          {error && (
            <div className="p-3 text-red-500 text-sm">{t('search.error')}</div>
          )}
          {isLoading ? (
            <SearchSkeleton />
          ) : results.length > 0 ? (
            Object.entries(groupedResults).map(([type, items]) => (
              <div key={type} className="py-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-800">
                  {t(`search.${type}s`)}
                </div>
                {items.map(renderSearchResult)}
              </div>
            ))
          ) : (
            <SearchSkeleton />
          )}
        </div>
      )}
    </div>
  );
}
