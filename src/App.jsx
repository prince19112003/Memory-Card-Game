import { useEffect, useState } from 'react';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';
import AnimatedBackground from './components/AnimateBackground';

// --- Sound Setup ---
const flipSound = new Howl({ src: ['/sounds/flip.mp3'], volume: 0.5 });
const matchSound = new Howl({ src: ['/sounds/match.mp3'], volume: 0.6 });
const winSound = new Howl({ src: ['/sounds/win.mp3'], volume: 0.7 });

// --- Emoji sets ---
const emojiSets = {
  Easy: ['🐱', '🐶', '🐸', '🐵'],
  Medium: ['🐱', '🐶', '🐸', '🐵', '🐼', '🦊'],
  Hard: [
    '🐱',
    '🐶',
    '🐸',
    '🐵',
    '🐼',
    '🦊',
    '🦁',
    '🐮',
    '🐷',
    '🐔',
    '🐧',
    '🐙',
  ],
};

export default function App() {
  const [mode, setMode] = useState(null);
  const [level, setLevel] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [turns, setTurns] = useState(0);
  const [player, setPlayer] = useState(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [gridCols, setGridCols] = useState(4);
  const [timer, setTimer] = useState(60);
  const [timeRunning, setTimeRunning] = useState(false);
  const [theme, setTheme] = useState('dark');

  // --- Theme toggle ---
  const toggleTheme = () => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    document.documentElement.classList.toggle('light');
  };

  // --- Start Game ---
  const startGame = selectedLevel => {
    const icons = emojiSets[selectedLevel];
    const shuffled = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon }));

    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setTurns(0);
    setPlayer(1);
    setScores({ 1: 0, 2: 0 });
    setLevel(selectedLevel);

    setGridCols(selectedLevel === 'Hard' ? 6 : 4);

    if (mode === 'Solo') {
      setTimer(
        selectedLevel === 'Easy' ? 40 : selectedLevel === 'Medium' ? 60 : 80
      );
      setTimeRunning(true);
    }
  };

  // --- Flip handler ---
  const handleFlip = index => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(index)
    )
      return;
    flipSound.play();
    setFlipped(prev => [...prev, index]);
  };

  // --- Matching logic ---
  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      const firstCard = cards[first];
      const secondCard = cards[second];

      if (firstCard.icon === secondCard.icon) {
        matchSound.play();
        setMatched(prev => [...prev, first, second]);
        setScores(s => ({ ...s, [player]: s[player] + 1 }));
      } else if (mode === 'Duel') {
        setTimeout(() => setPlayer(p => (p === 1 ? 2 : 1)), 1000);
      }
      setTimeout(() => setFlipped([]), 1000);
      setTurns(t => t + 1);
    }
  }, [flipped]);

  // --- Confetti + Win sound ---
  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      winSound.play();
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      setTimeRunning(false);
    }
  }, [matched]);

  // --- Timer ---
  useEffect(() => {
    if (mode !== 'Solo' || !timeRunning) return;
    if (timer <= 0) {
      setTimeRunning(false);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [mode, timer, timeRunning]);

  const totalPairs = cards.length / 2;

  const winner =
    matched.length === cards.length && cards.length > 0
      ? mode === 'Solo'
        ? '🎉 You matched them all!'
        : scores[1] > scores[2]
        ? '🏆 Player 1 Wins!'
        : scores[1] < scores[2]
        ? '🏆 Player 2 Wins!'
        : '🤝 It’s a Tie!'
      : mode === 'Solo' && timer <= 0
      ? '⏰ Time’s Up!'
      : null;

  const restart = () => startGame(level);

  return (
    <div
      className={`relative min-h-screen  overflow-hidden transition-colors duration-700 ${
        theme === 'dark'
          ? 'bg-[#030B1A] text-white'
          : 'bg-gray-100 text-gray-800'
      }`}>
      <AnimatedBackground theme={theme} />

      {/* Floating Theme Toggle Button */}
      <div className='fixed top-4 right-4 z-50 animate-float'>
        <button
          onClick={toggleTheme}
          className='flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-[#00b7ff] text-[#00eaff] bg-[#001e3c]/90 backdrop-blur-md hover:bg-[#002b5b] hover:shadow-[0_0_25px_#00b7ff] transition-all duration-300'>
          {/* Icon always visible */}
          <span className='text-2xl'>{theme === 'dark' ? '☀️' : '🌙'}</span>

          {/* Text hidden on small screens */}
          <span className='hidden sm:inline text-sm font-semibold tracking-wide'>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
      </div>

      <div className='flex flex-col items-center  pt-12 pb-8 px-4 text-center   '>
        <h1 className='text-5xl font-bold mb-8 text-[#00d9ff] drop-shadow-[0_0_20px_#00b7ff]'>
          ⚡ Memory Match Duel
        </h1>

        {/* Mode selection */}
        {!mode ? (
          <div className='flex flex-col items-center   gap-8'>
            <p className='text-lg mb-4 mt-8 font-bold'>Choose Game Mode:</p>
            <button
              onClick={() => setMode('Solo')}
              className='bg-[#001e3c] border border-[#00b7ff] text-[#00eaff] w-72 py-4 rounded-xl font-semibold hover:bg-[#002b5b] hover:shadow-[0_0_20px_#00b7ff] transition'>
              🎯 Single Player
            </button>
            <button
              onClick={() => setMode('Duel')}
              className='bg-[#001e3c] border border-[#00b7ff] text-[#00eaff] w-72 py-4 rounded-xl font-semibold hover:bg-[#002b5b] hover:shadow-[0_0_20px_#00b7ff] transition'>
              👥 Two Player
            </button>
          </div>
        ) : !level ? (
          <div className='flex flex-col items-center gap-4'>
            <p className='text-lg mb-2 font-bold'>Select Difficulty:</p>
            {['Easy', 'Medium', 'Hard'].map(lvl => (
              <button
                key={lvl}
                onClick={() => startGame(lvl)}
                className='bg-[#001e3c] border border-[#00b7ff] text-[#00eaff] w-72 py-4 rounded-xl font-semibold hover:bg-[#002b5b] hover:shadow-[0_0_20px_#00b7ff] transition'>
                🎮 {lvl}
              </button>
            ))}
            <button
              onClick={() => setMode(null)}
              className='mt-4 bg-[#001e3c] border border-[#00b7ff] text-[#00eaff] w-72 px-6 py-4 rounded-xl hover:bg-[#002b5b]'>
              ⬅️ Back
            </button>
          </div>
        ) : (
          <>
            {/* Timer */}
            {mode === 'Solo' && (
              <div className='mb-4 text-lg'>
                ⏱️ Time:{' '}
                <span
                  className={`font-bold ${
                    timer < 10 ? 'text-red-400 animate-pulse' : 'text-[#00eaff]'
                  }`}>
                  {timer}s
                </span>
              </div>
            )}

            {/* Duel player info */}
            {mode === 'Duel' && (
              <div className='flex justify-center gap-6 mb-6'>
                {[1, 2].map(p => {
                  const progress = (scores[p] / totalPairs) * 100;
                  return (
                    <div
                      key={p}
                      className={`player-card w-36 sm:w-48 rounded-2xl p-3 ${
                        player === p ? 'active scale-105' : 'opacity-80'
                      }`}>
                      <p className='font-semibold text-lg'>👤 Player {p}</p>
                      <div className='w-full bg-[#001e3c] rounded-full h-3 mt-2'>
                        <div
                          className='bg-[#00eaff] h-3 rounded-full transition-all duration-700'
                          style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className='text-sm mt-1'>Score: {scores[p]}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grid */}
            <div
              className={`grid gap-4 justify-center mx-auto`}
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                // width: gridCols === 6 ? '680px' : '400px',
              }}>
              {cards.map((card, i) => {
                const isFlipped = flipped.includes(i) || matched.includes(i);
                return (
                  <div
                    key={card.id}
                    className='relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] cursor-pointer perspective'
                    onClick={() => handleFlip(i)}>
                    <div className={`card ${isFlipped ? 'flipped' : ''}`}>
                      <div className='card-front neon-border flex items-center justify-center text-transparent rounded-2xl'>
                        ❓
                      </div>
                      <div className='card-back flex items-center justify-center text-4xl rounded-2xl'>
                        {card.icon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className='flex justify-center gap-4 mt-6'>
              <button
                onClick={restart}
                className='bg-[#001e3c] border border-[#00b7ff] text-[#00eaff] w-72 py-4 rounded-xl font-semibold hover:bg-[#002b5b] hover:shadow-[0_0_20px_#00b7ff] transition'>
                🔄 Restart
              </button>
              <button
                onClick={() => {
                  setLevel(null);
                  setCards([]);
                  setMatched([]);
                  setFlipped([]);
                  setTimeRunning(false);
                }}
                className='bg-[#001e3c] border border-[#00b7ff] text-[#00eaff] px-6 py-2 rounded-xl font-semibold hover:bg-[#002b5b]'>
                ⬅️ Back
              </button>
            </div>

            {winner && (
              <p className='mt-6 text-3xl font-bold winner-text'>{winner}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
