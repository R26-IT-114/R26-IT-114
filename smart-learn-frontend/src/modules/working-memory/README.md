# Working Memory Training System - Implementation Guide

## 📋 Overview

This is a modern, child-friendly React web application for a "Working Memory Training System" designed for children aged 6–8. The system features a colorful, playful design with smooth animations and an interactive level-lock system.

## 🎯 Project Structure

```
src/modules/working-memory/
├── components/
│   ├── HomePage.jsx              # Main homepage with game cards
│   ├── GameCard.jsx              # Individual game card component
│   ├── StarButton.jsx            # Animated star button component
│   ├── InfiniteScrollList.jsx    # Infinite scroll/lazy loading
│   ├── MemoryTask.jsx            # (Existing) Sequence recall game
│   └── MemoryMatchGame.jsx       # (Existing) Matching pairs game
├── context/
│   └── ProgressContext.jsx       # Progress tracking & unlock system
├── pages/
│   ├── WorkingMemoryHome.jsx     # Main page wrapper
│   └── WorkingMemoryLayout.jsx   # (Existing)
├── utils/
│   ├── constants.js              # Constants & Sinhala UI text
│   └── helpers.js                # Helper functions
├── hooks/
│   └── useDyscalculia.js         # (Existing)
├── api/
│   └── dyscalculiaApi.js         # (Existing)
├── services/
└── data/
```

## 🚀 Key Features

### 1. **Colorful, Child-Friendly UI**
- Soft pastel colors (pink, blue, green, yellow, purple, peach)
- Rounded corners and shadow effects
- Large, easy-to-tap buttons
- Emoji icons for visual appeal

### 2. **Smooth Animations** (Framer Motion)
- Card hover animations (scale + shadow)
- Button click bounce effects
- Star icon glow animation
- Fade-in and slide-up transitions
- Infinite scroll with lazy loading

### 3. **Level Lock System**
- Only the first level is unlocked initially
- Next level unlocks ONLY if the previous level is completed correctly
- Progress saved in `localStorage`
- Visual indicators (🔒 for locked, ✓ for completed)

### 4. **Games List** (9 Total)
1. **අනුක්‍රම මතක ක්‍රීඩාව** - Sequence Recall
2. **ප්‍රතිවිරුද්ධ මතක ක්‍රීඩාව** - Reverse Sequence
3. **N-Back මතක ක්‍රීඩාව** - N-Back Game
4. **කාඩ් සමාන කිරීමේ ක්‍රීඩාව** - Matching Pairs
5. **උපදෙස් මතක තබා ගැනීම** - Instruction Game
6. **අතුරුදන් වූ දේ සොයන්න** - Missing Item Game
7. **කාල සීමා මතක ක්‍රීඩාව** - Timed Recall
8. **අනුපිළිවෙලට සකස් කිරීම** - Sorting Memory
9. **ශබ්ද මතක ක්‍රීඩාව** - Sound Memory

### 5. **Sinhala Language Support**
- All UI text in Sinhala (සිංහල)
- Easy to switch languages in the future

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "framer-motion": "^latest",
  "tailwindcss": "^latest"
}
```

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
npm install
npm install -D tailwindcss postcss autoprefixer framer-motion
```

### 2. Configure Tailwind
Already configured in:
- `tailwind.config.js` - Custom colors, animations, shadows
- `postcss.config.js` - PostCSS configuration
- `src/styles/global.css` - Tailwind directives

### 3. Run Development Server
```bash
npm start
# or
npm run dev
```

## 🎮 How It Works

### Progress Context (`ProgressContext.jsx`)

Manages the entire progress and unlock system:

```javascript
import { useProgress } from './context/ProgressContext';

// In your component:
const { 
  isLevelUnlocked,      // Check if level is unlocked
  isLevelCompleted,     // Check if level is completed
  completeLevel,        // Mark level as completed (unlocks next)
  getCurrentLevel,      // Get current level for a game
  getCompletedLevels,   // Get all completed levels
  getUnlockedLevels,    // Get all unlocked levels
  resetProgress,        // Reset all progress
} = useProgress();
```

**Data Structure (localStorage):**
```javascript
{
  "gameId": {
    "currentLevel": 2,
    "completedLevels": [1],
    "unlockedLevels": [1, 2]
  }
}
```

### HomePage Component

Displays all games with infinite scroll:

```javascript
<HomePage 
  onGameSelect={(gameId, level) => {
    // Navigate to game screen
  }}
/>
```

### GameCard Component

Individual game card with levels and lock system:

```javascript
<GameCard
  gameId="sequence-recall"
  titleSinhala="අනුක්‍රම මතක ක්‍රීඩාව"
  descriptionSinhala="අංක හෝ වචන අනුපිළිවෙල මතු කරන්න"
  icon="🔢"
  color="bg-pink-200"
  maxLevels={4}
  onPlay={(gameId, level) => {}}
/>
```

### StarButton Component

Animated star button with glow effect:

```javascript
<StarButton
  onClick={handleClick}
  size="md"  // 'sm' | 'md' | 'lg'
  variant="primary"  // 'primary' | 'success' | 'warning'
>
  Optional text
</StarButton>
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  pastel: {
    pink: '#FFB3D9',
    blue: '#B3D9FF',
    // ... add more colors
  }
}
```

### Sinhala Text
Edit `utils/constants.js`:
```javascript
export const SINHALA_UI = {
  PLAY: 'ක්‍රීඩා කරන්න',
  // ... add more text
};
```

### Animation Timing
Edit `utils/constants.js`:
```javascript
export const ANIMATION_DURATIONS = {
  QUICK: 200,
  NORMAL: 500,
  SLOW: 1000,
};
```

## ✨ Advanced Features

### Infinite Scroll
The `InfiniteScrollList` component automatically loads more games as the user scrolls:

```javascript
<InfiniteScrollList
  items={games}
  itemsPerPage={3}
  isLoading={isLoading}
  hasMore={true}
  onLoadMore={handleLoadMore}
  renderItem={(game) => <GameCard {...game} />}
/>
```

### Local Storage Persistence
Progress is automatically saved to `localStorage` with key `wmProgressData`:

```javascript
// Manually check progress:
const savedProgress = localStorage.getItem('wmProgressData');
console.log(JSON.parse(savedProgress));

// Reset progress (for testing):
localStorage.removeItem('wmProgressData');
```

### Sound Effects (Optional)
Helper function included in `utils/helpers.js`:

```javascript
import { playSound, triggerHaptic } from '../utils/helpers';

// Play sound
playSound('success.mp3');

// Trigger vibration (mobile)
triggerHaptic(50);  // 50ms vibration
```

## 🔧 Extending the System

### Adding a New Game

1. **Add game data** to `utils/constants.js`:
```javascript
export const GAMES_DATA = {
  'new-game': {
    titleSinhala: 'නව ක්‍රීඩාව',
    descriptionSinhala: 'එය කি ගැන්නවාද?',
    icon: '🎮',
  }
};
```

2. **Add game card** to games array in `HomePage.jsx`:
```javascript
const games = [
  // ... existing games
  {
    id: 'new-game',
    titleSinhala: 'නව ක්‍රීඩාව',
    descriptionSinhala: 'එය කි ගැන්නවාද?',
    icon: '🎮',
    color: 'bg-indigo-200',
    maxLevels: 4,
  }
];
```

3. **Create game component**:
```javascript
// src/modules/working-memory/components/NewGame.jsx
const NewGame = ({ level, onComplete }) => {
  return (
    <div>
      {/* Your game logic */}
    </div>
  );
};

export default NewGame;
```

4. **Add game route** in `WorkingMemoryHome.jsx`:
```javascript
if (selectedGame === 'new-game') {
  return (
    <GameWrapper onBack={handleGameBack} title="නව ක්‍රීඩාව">
      <NewGame 
        level={selectedLevel} 
        onComplete={handleStepComplete}
      />
    </GameWrapper>
  );
}
```

### Styling New Components

Use Tailwind CSS classes:

```javascript
<div className="bg-gradient-to-r from-pink-400 to-yellow-400 rounded-xl p-6 shadow-card hover:shadow-card-hover">
  {/* Content */}
</div>
```

### Adding Animations

Use Framer Motion:

```javascript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Animated content
</motion.div>
```

## 📊 Usage Examples

### Complete a Level
```javascript
const { completeLevel } = useProgress();

// When the player completes level 1 of 'sequence-recall'
completeLevel('sequence-recall', 1);
// This automatically unlocks level 2
```

### Check Level Status
```javascript
const { isLevelUnlocked, isLevelCompleted } = useProgress();

if (isLevelUnlocked('sequence-recall', 2)) {
  // Show level 2 as playable
}

if (isLevelCompleted('sequence-recall', 1)) {
  // Show completion badge
}
```

### Reset Progress (Testing)
```javascript
const { resetProgress } = useProgress();

// Clear all saved progress
resetProgress();
```

## 🐛 Troubleshooting

### Progress not saving
- Check browser's localStorage is enabled
- Verify localStorage is not full
- Check browser console for errors

### Animations not smooth
- Ensure Framer Motion is installed
- Check if GPU acceleration is enabled
- Reduce animation complexity on low-end devices

### Tailwind styles not applied
- Verify `tailwind.config.js` content paths are correct
- Check `global.css` has Tailwind directives
- Run `npm run build` and check for errors

## 📝 Component API Reference

### HomePage Props
```typescript
interface HomePageProps {
  onGameSelect?: (gameId: string, level: number) => void
}
```

### GameCard Props
```typescript
interface GameCardProps {
  gameId: string
  titleSinhala: string
  descriptionSinhala: string
  icon: string
  color?: string
  maxLevels?: number
  onPlay: (gameId: string, level: number) => void
}
```

### StarButton Props
```typescript
interface StarButtonProps {
  onClick: () => void
  children?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'success' | 'warning'
  disabled?: boolean
  className?: string
}
```

### useProgress Hook
```typescript
interface UseProgressReturn {
  progress: Object
  isLevelUnlocked: (gameId: string, level: number) => boolean
  isLevelCompleted: (gameId: string, level: number) => boolean
  completeLevel: (gameId: string, level: number) => void
  getCurrentLevel: (gameId: string) => number
  getCompletedLevels: (gameId: string) => number[]
  getUnlockedLevels: (gameId: string) => number[]
  resetProgress: () => void
  initializeGame: (gameId: string) => void
  isLoading: boolean
}
```

## 🎓 Best Practices

1. **Always wrap components with `ProgressProvider`**
```javascript
<ProgressProvider>
  <App />
</ProgressProvider>
```

2. **Use semantic Sinhala text** for accessibility
3. **Test on mobile devices** for touch interactions
4. **Use accessibility attributes** (aria-labels, role)
5. **Minimize animations** on low-end devices
6. **Cache game data** to reduce API calls
7. **Implement error boundaries** for robustness

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Hooks Documentation](https://react.dev/reference/react/hooks)
- [React Context API](https://react.dev/reference/react/useContext)

## 👨‍💻 Development Tips

- Use React DevTools to inspect component tree
- Use Framer Motion DevTools for animation debugging
- Check localStorage in browser DevTools
- Test with throttled network/CPU for real-world conditions
- Use accessibility checker tools (axe, WAVE)

## 📄 License

This project is part of the Smart Learn Platform for learning disabilities.

---

**Last Updated:** May 2, 2026
**Version:** 1.0.0
