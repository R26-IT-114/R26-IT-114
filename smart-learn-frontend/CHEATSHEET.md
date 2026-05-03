# 🎮 Working Memory Training System - Code Cheatsheet

Quick reference for using the system. For detailed docs, see `README.md`

---

## 📦 Installation

```bash
npm install
npm install -D tailwindcss postcss autoprefixer framer-motion
npm start
```

---

## 🚀 Basic Setup

```javascript
// Wrap your app with ProgressProvider
import WorkingMemoryHome from '@/modules/working-memory/pages/WorkingMemoryHome';

// That's it! WorkingMemoryHome already includes ProgressProvider
export default function App() {
  return <WorkingMemoryHome />;
}
```

---

## 🎯 Using Progress Hook

```javascript
import { useProgress } from '@/modules/working-memory/context';

function MyComponent() {
  const {
    isLevelUnlocked,
    isLevelCompleted,
    completeLevel,
    getCurrentLevel,
    getCompletedLevels,
    resetProgress,
  } = useProgress();

  // Check if level is playable
  if (isLevelUnlocked('sequence-recall', 2)) {
    // Show level 2 as playable
  }

  // Check if completed
  if (isLevelCompleted('sequence-recall', 1)) {
    // Show checkmark
  }

  // Mark level as complete
  const handleGameComplete = () => {
    completeLevel('sequence-recall', 1);  // Unlocks level 2
  };

  return (
    <div>
      <button onClick={handleGameComplete}>
        Complete Level 1
      </button>
    </div>
  );
}
```

---

## 🎨 Components Quick Guide

### HomePage - Display all games
```javascript
import { HomePage } from '@/modules/working-memory/components';

<HomePage 
  onGameSelect={(gameId, level) => {
    console.log(`Play: ${gameId}, Level: ${level}`);
  }}
/>
```

### GameCard - Individual game
```javascript
import { GameCard } from '@/modules/working-memory/components';

<GameCard
  gameId="sequence-recall"
  titleSinhala="අනුක්‍රම මතක ක්‍රීඩාව"
  descriptionSinhala="අංක හෝ වචන අනුපිළිවෙල මතු කරන්න"
  icon="🔢"
  color="bg-pink-200"
  maxLevels={4}
  onPlay={(gameId, level) => {
    // Navigate to game
  }}
/>
```

### StarButton - Animated star button
```javascript
import { StarButton } from '@/modules/working-memory/components';

<StarButton
  onClick={() => console.log('Clicked!')}
  size="md"              // 'sm' | 'md' | 'lg'
  variant="primary"      // 'primary' | 'success' | 'warning'
  disabled={false}
>
  Optional Text
</StarButton>
```

### InfiniteScrollList - Scroll management
```javascript
import { InfiniteScrollList } from '@/modules/working-memory/components';

<InfiniteScrollList
  items={games}
  itemsPerPage={3}
  isLoading={false}
  hasMore={true}
  onLoadMore={() => console.log('Load more')}
  renderItem={(game) => <GameCard {...game} />}
/>
```

---

## 📊 Constants & Configuration

```javascript
import {
  GAMES_DATA,
  PASTEL_COLORS,
  SINHALA_UI,
  LEVEL_CONFIG,
  ANIMATION_DURATIONS,
} from '@/modules/working-memory/utils';

// Game information
GAMES_DATA['sequence-recall']
// → { titleSinhala: '...', descriptionSinhala: '...', icon: '🔢' }

// UI Text
SINHALA_UI.PLAY          // 'ක්‍රීඩා කරන්න'
SINHALA_UI.LEVELS        // 'අවිසිසි'
SINHALA_UI.SUCCESS       // '🎉 සුපිරි! ...'

// Colors
PASTEL_COLORS[0]         // 'bg-pink-200'

// Timing
ANIMATION_DURATIONS.QUICK    // 200ms
ANIMATION_DURATIONS.NORMAL   // 500ms
ANIMATION_DURATIONS.SLOW     // 1000ms
```

---

## 🛠️ Helper Functions

```javascript
import {
  shuffleArray,
  generateRandomNumbers,
  generateRandomColors,
  formatTime,
  calculateScore,
  getSuccessMessage,
  delay,
  playSound,
  triggerHaptic,
  generateConfetti,
} from '@/modules/working-memory/utils';

// Shuffle array
const shuffled = shuffleArray([1, 2, 3, 4, 5]);
// → [3, 1, 5, 2, 4]

// Generate random numbers (for Sequence Recall game)
const sequence = generateRandomNumbers(1, 9, 5);
// → [7, 2, 9, 4, 1]

// Generate colors
const colors = generateRandomColors(['#FF6B6B', '#4D96FF'], 3);
// → ['#FF6B6B', '#4D96FF', '#FF6B6B']

// Format time
const time = formatTime(125);
// → "02:05" (2 minutes, 5 seconds)

// Calculate score
const score = calculateScore(45, 2, 60);
// → 85

// Get success message
const message = getSuccessMessage(92);
// → "🏆 අසාරණ! ඔබ හරිම දක්ෂ!"

// Delay execution
await delay(1000);  // Wait 1 second

// Play sound (placeholder)
playSound('success.mp3');

// Trigger vibration (mobile)
triggerHaptic(50);  // 50ms vibration

// Generate confetti animation data
const confetti = generateConfetti(50);
```

---

## 🎮 Create a New Game - Step by Step

### Step 1: Add to constants
```javascript
// utils/constants.js
export const GAMES_DATA = {
  'my-new-game': {
    titleSinhala: 'මගේ නව ක්‍රීඩාව',
    descriptionSinhala: 'එය ඉතා විනෝදජනක!',
    icon: '🎮',
  }
};
```

### Step 2: Create game component
```javascript
// components/MyNewGame.jsx
import { useProgress } from '../context';

export default function MyNewGame({ level, onComplete }) {
  const { completeLevel } = useProgress();

  const handleComplete = () => {
    // Mark level as complete (auto-unlocks next)
    completeLevel('my-new-game', level);
    // Return to homepage
    onComplete();
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">
        ගිණුම් ගිණුම ක්‍රීඩාව
      </h2>
      
      {/* Your game logic */}
      
      <button 
        onClick={handleComplete}
        className="bg-green-400 text-white px-6 py-3 rounded-xl"
      >
        ඉවරයි
      </button>
    </div>
  );
}
```

### Step 3: Add to HomePage
```javascript
// components/HomePage.jsx - Update games array
const games = [
  // ... existing games
  {
    id: 'my-new-game',
    titleSinhala: 'මගේ නව ක්‍රීඩාව',
    descriptionSinhala: 'එය ඉතා විනෝදජනක!',
    icon: '🎮',
    color: 'bg-indigo-200',
    maxLevels: 4,
  }
];
```

### Step 4: Add navigation route
```javascript
// pages/WorkingMemoryHome.jsx
import MyNewGame from '../components/MyNewGame';

if (selectedGame === 'my-new-game') {
  return (
    <GameWrapper onBack={handleGameBack} title="මගේ නව ක්‍රීඩාව">
      <MyNewGame 
        level={selectedLevel} 
        onComplete={handleStepComplete}
      />
    </GameWrapper>
  );
}
```

---

## 🎨 Styling with Tailwind

```javascript
// Pastel colors
<div className="bg-pink-200">...</div>
<div className="bg-blue-200">...</div>
<div className="bg-green-200">...</div>

// Shadows
<div className="shadow-card hover:shadow-card-hover">...</div>

// Rounded corners
<div className="rounded-xl">...</div>
<div className="rounded-2xl">...</div>

// Animations (custom)
<div className="animate-glow">Glowing</div>
<div className="animate-bounce-star">Bouncing</div>
<div className="animate-fade-in-up">Fading in</div>

// Gradients
<div className="bg-gradient-to-r from-pink-400 to-yellow-400">
  Gradient
</div>

// Responsive
<div className="text-sm md:text-lg lg:text-xl">
  Responsive text
</div>
```

---

## 💾 localStorage Management

```javascript
// Check saved progress
const progress = localStorage.getItem('wmProgressData');
console.log(JSON.parse(progress));

// Example output:
// {
//   "sequence-recall": {
//     "currentLevel": 2,
//     "completedLevels": [1],
//     "unlockedLevels": [1, 2]
//   }
// }

// Manual reset (for testing)
localStorage.removeItem('wmProgressData');

// Clear all storage
localStorage.clear();
```

---

## 🎬 Animation Examples

```javascript
import { motion } from 'framer-motion';

// Fade in on load
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Fading in
</motion.div>

// Bounce on tap
<motion.button
  whileTap={{ scale: 0.95 }}
  onClick={() => {}}
>
  Click me
</motion.button>

// Rotate on hover
<motion.div
  whileHover={{ rotate: 10 }}
>
  Hover over me
</motion.div>

// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
>
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.title}
    </motion.div>
  ))}
</motion.div>
```

---

## 📱 Mobile Optimization

```javascript
// Large touch targets
<button className="p-4 w-12 h-12 md:w-16 md:h-16">
  Touch me
</button>

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">
  Large heading
</h1>

// Mobile-first layout
<div className="flex flex-col md:flex-row gap-4">
  <div>One column on mobile</div>
  <div>Two columns on desktop</div>
</div>

// Scroll optimization
<div className="overflow-y-auto max-h-screen">
  Scrollable content
</div>
```

---

## 🧪 Testing Progress System

```javascript
// Test complete level flow
1. Open app
2. localStorage is empty
3. Only Level 1 shows as unlocked
4. Click Play on Level 1
5. Complete the game
6. Check: completeLevel called
7. Check: localStorage updated
8. Return to homepage
9. Verify: Level 2 now unlocked

// Manual testing
const { completeLevel } = useProgress();

// Simulate progression
completeLevel('sequence-recall', 1);
completeLevel('sequence-recall', 2);
completeLevel('sequence-recall', 3);
// Now level 4 should be unlocked
```

---

## 🔍 Common Patterns

### Pattern 1: Fetch & Check Permission
```javascript
const { isLevelUnlocked } = useProgress();

// Don't allow access to locked levels
if (!isLevelUnlocked(gameId, level)) {
  return <div>🔒 This level is locked!</div>;
}

return <GameComponent />;
```

### Pattern 2: Show Progress Badge
```javascript
const { isLevelCompleted } = useProgress();
const completed = isLevelCompleted(gameId, level);

<div className={completed ? 'bg-green-300' : 'bg-yellow-300'}>
  {completed ? '✓ Completed' : 'In Progress'}
</div>
```

### Pattern 3: Unlock on Complete
```javascript
const { completeLevel } = useProgress();

const handleGameComplete = () => {
  // Game logic...
  
  // Mark as complete
  completeLevel(gameId, level);
  
  // Show success
  alert('🎉 Great job!');
  
  // Navigate back
  goBack();
};
```

### Pattern 4: Reset for Testing
```javascript
const { resetProgress } = useProgress();

const handleReset = () => {
  resetProgress();
  window.location.reload();  // Refresh to see reset
};

<button onClick={handleReset}>Reset All Progress</button>
```

---

## 📚 Documentation Files

- **README.md** - Full reference guide
- **QUICK_START.js** - Commented quick reference
- **ARCHITECTURE.md** - System design & data flow
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **CHEATSHEET.md** - This file!

---

## 🚨 Troubleshooting

```javascript
// Progress not saving?
console.log(localStorage.getItem('wmProgressData'));
// Should show JSON data

// Components not rendering?
// Check ProgressProvider wraps app
<ProgressProvider>
  <App />
</ProgressProvider>

// Animations stuttering?
// Check: GPU acceleration enabled
// Reduce number of simultaneous animations
// Use transform + opacity only (most performant)

// Styles not applying?
// Verify tailwind.config.js content paths
// Check @tailwind directives in global.css
// Run: npm run build

// Sinhala text not displaying?
// Check font: 'Segoe UI', Tahoma, Geneva
// Verify UTF-8 encoding
// Check browser supports Sinhala script
```

---

## 🎯 Quick Command Reference

```bash
# Start development
npm start

# Build for production
npm build

# Run tests
npm test

# Lint code
npm run lint

# Preview production build
npm preview
```

---

## 🎓 Learning Resources

- React Hooks: https://react.dev/reference/react/hooks
- Tailwind CSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion/
- Context API: https://react.dev/reference/react/useContext
- localStorage API: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

## 📝 Notes

- All games use Sinhala UI (easy to change in constants.js)
- Progress automatically saves to localStorage
- No external dependencies for core functionality
- Fully responsive design
- Optimized for children age 6-8
- Easy to extend with new games

---

**Last Updated:** May 2, 2026
**Version:** 1.0.0
**Status:** ✅ Ready to Use

Happy coding! 🚀
