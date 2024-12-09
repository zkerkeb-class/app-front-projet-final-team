import { useTranslation } from 'next-i18next';
import { FixedSizeList as List } from 'react-window';
import { useRef, useState, useEffect } from 'react';

interface HorizontalListProps<T> {
  items: T[];
  title: string;
  renderItem: (item: T, style: React.CSSProperties) => React.ReactNode;
  height?: number;
  itemSize?: number;
  skeletonCount?: number;
}

/**
 * Generic horizontal list component with virtual scrolling
 */
export default function HorizontalList<T extends { id: string }>({
  items,
  title,
  renderItem,
  height = 250,
  itemSize = 200,
  skeletonCount = 5,
}: HorizontalListProps<T>) {
  const { t } = useTranslation('common');
  const listRef = useRef<HTMLDivElement>(null);
  const [listWidth, setListWidth] = useState(0);

  useEffect(() => {
    if (listRef.current) {
      setListWidth(listRef.current.clientWidth);
    }

    const handleResize = () => {
      if (listRef.current) {
        setListWidth(listRef.current.clientWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const item = items[index];
    return renderItem(item, style);
  };

  if (!listWidth) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
          <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
            {t('home.seeAll')}
          </button>
        </div>
        <div ref={listRef} className={`relative h-[${height}px]`}>
          <div className="flex space-x-4 overflow-x-auto">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="w-48 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="p-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
        <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
          {t('home.seeAll')}
        </button>
      </div>

      <div ref={listRef} className={`relative h-[${height}px]`}>
        <List
          height={height}
          itemCount={items.length}
          itemSize={itemSize}
          layout="horizontal"
          width={listWidth}
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
