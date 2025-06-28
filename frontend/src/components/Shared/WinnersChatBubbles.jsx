import React, { useEffect, useState } from 'react';

// Random names for winners
const randomNames = [
  'Amit', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Sara', 'Rohit', 'Anjali',
  'Raj', 'Meera', 'Arjun', 'Kavya', 'Dev', 'Zara', 'Karan', 'Ishita',
  'Vivek', 'Riya', 'Aditya', 'Pooja', 'Siddharth', 'Tanvi', 'Aryan', 'Neha',
  'Krishna', 'Ananya', 'Shivam', 'Diya', 'Rishabh', 'Mira', 'Dhruv', 'Aisha',
  'Kabir', 'Sana', 'Vedant', 'Kiara', 'Shaurya', 'Aria', 'Advait', 'Myra',
  'Ishaan', 'Zoya', 'Arnav', 'Avni', 'Reyansh', 'Kyra', 'Vihaan', 'Aaradhya'
];

// Generate random winner
const generateRandomWinner = () => {
  const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
  const randomAmount = Math.floor(Math.random() * (4000 - 400 + 1)) + 400;
  return { name: randomName, amount: randomAmount };
};

// Generate initial winners array
const generateWinners = () => {
  return Array.from({ length: 20 }, () => generateRandomWinner());
};

const DISPLAY_TIME = 3500; // ms each bubble is visible

const WinnersChatBubbles = () => {
  const [winners, setWinners] = useState(generateWinners());
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const hideTimeout = setTimeout(() => setVisible(false), DISPLAY_TIME - 600);
    const nextTimeout = setTimeout(() => {
      setCurrent((prev) => {
        const nextIndex = (prev + 1) % winners.length;
        // Generate new random winner when we reach the end
        if (nextIndex === 0) {
          setWinners(generateWinners());
        }
        return nextIndex;
      });
      setVisible(true);
    }, DISPLAY_TIME);
    return () => {
      clearTimeout(hideTimeout);
      clearTimeout(nextTimeout);
    };
  }, [current, winners.length]);

  return (
    <div className="fixed left-4 bottom-4 z-50 flex flex-col items-start space-y-2 pointer-events-none select-none" style={{ minWidth: '220px' }}>
      <div
        className={`transition-all duration-500 ease-in-out transform ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'} shadow-2xl`}
        key={current}
      >
        <div className="flex items-center bg-white/90 border border-yellow-300 rounded-2xl px-4 py-3 gap-3 animate-pop-in">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="font-bold text-gray-800">{winners[current].name}</div>
            <div className="text-green-700 font-semibold text-sm">Won ₹{winners[current].amount} <span className="bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold ml-1">2x</span></div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pop-in { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .animate-pop-in { animation: pop-in 0.5s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default WinnersChatBubbles; 