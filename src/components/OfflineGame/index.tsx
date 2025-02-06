import { useState, useEffect } from 'react';
import { MusicalNoteIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'next-i18next';

const CARDS = [
  { id: 1, symbol: '♪' },
  { id: 2, symbol: '♫' },
  { id: 3, symbol: '♬' },
  { id: 4, symbol: '♭' },
  { id: 5, symbol: '♮' },
  { id: 6, symbol: '♯' },
];

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function OfflineGame() {
  const { t } = useTranslation('common');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);

  // Initialiser le jeu
  const initializeGame = () => {
    const gameCards = [...CARDS, ...CARDS]
      .map((card) => ({
        ...card,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setIsGameComplete(false);
  };

  const handleCardClick = (index: number) => {
    if (
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedCards.length === 2
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves((m) => m + 1);

      const [firstIndex, secondIndex] = newFlippedCards;
      if (cards[firstIndex].id === cards[secondIndex].id) {
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);

        if (newCards.every((card) => card.isMatched)) {
          setIsGameComplete(true);
          if (!bestScore || moves + 1 < bestScore) {
            setBestScore(moves + 1);
          }
        }
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializeGame();
  }, []);

  return (
    <div className="mt-8 select-none">
      <div className="text-center mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          {t('offline.game.moves')}: {moves}
          {bestScore && ` | ${t('offline.game.bestScore')}: ${bestScore}`}
        </p>
        {isGameComplete && (
          <div className="mt-4">
            <p className="text-green-600 dark:text-green-400 mb-2">
              {t('offline.game.congratulations')}{' '}
              {t('offline.game.completedIn', { moves })}
            </p>
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {t('offline.game.newGame')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto p-4">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => handleCardClick(index)}
            className={`
              aspect-square flex items-center justify-center text-2xl font-bold rounded-lg cursor-pointer transform transition-all duration-300
              ${
                card.isFlipped || card.isMatched
                  ? 'bg-purple-600 text-white rotate-0'
                  : 'bg-gray-200 dark:bg-gray-700 text-transparent rotate-180'
              }
              ${!card.isMatched && 'hover:bg-purple-500 dark:hover:bg-purple-800'}
            `}
          >
            {(card.isFlipped || card.isMatched) && card.symbol}
          </div>
        ))}
      </div>

      <p className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        {t('offline.game.instructions')}
      </p>
    </div>
  );
}
