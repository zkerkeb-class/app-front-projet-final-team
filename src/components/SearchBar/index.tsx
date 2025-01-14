import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';
import { SearchResult } from '@/types/search';
import { gql, useLazyQuery } from '@apollo/client';
import { formatSearchResults } from '@/utils/searchUtils';

const SEARCH_QUERY = gql`
  query Search($input: SearchInput!) {
    search(input: $input)
  }
`;

export default function SearchBar() {
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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
            entityType: 'TITLE',
            limit: 10,
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

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder={t('search.placeholder')}
          className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 
                   text-gray-900 dark:text-white placeholder-gray-500 
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent" />
          </div>
        )}
      </div>

      {showResults && (results.length > 0 || isLoading) && (
        <div
          className="absolute w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                      max-h-96 overflow-y-auto z-50"
        >
          {error && (
            <div className="p-3 text-red-500 text-sm">{t('search.error')}</div>
          )}
          {results.map((result) => (
            <div
              key={result.id}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer 
                       flex items-center space-x-3"
            >
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt={result.title}
                  className="w-10 h-10 rounded object-cover"
                />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {result.title}
                </div>
                {result.subtitle && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {result.subtitle}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
