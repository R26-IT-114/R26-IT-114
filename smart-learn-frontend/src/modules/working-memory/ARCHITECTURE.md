# Working Memory Training System - Architecture & Data Flow

## 🏗️ Component Hierarchy

```
WorkingMemoryHome (Page Wrapper)
│
├─ ProgressProvider (Context)
│  │
│  └─ WorkingMemoryHomeContent
│     │
│     ├─ HomePage (Homepage Screen)
│     │  │
│     │  └─ InfiniteScrollList
│     │     │
│     │     └─ GameCard (x9)
│     │        │
│     │        ├─ StarButton (Play Button)
│     │        ├─ Lock Icon (🔒)
│     │        ├─ Level Buttons (1, 2, 3, 4)
│     │        └─ Progress Bar
│     │
│     └─ GameWrapper (Game Screen)
│        │
│        ├─ Back Button
│        │
│        └─ Game Component
│           ├─ MemoryTask (for sequence-recall)
│           ├─ MemoryMatchGame (for matching-pairs)
│           └─ [Future Game Components]
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ProgressContext                             │
│                                                                  │
│  localStorage: "wmProgressData"                                 │
│  {                                                              │
│    "gameId": {                                                 │
│      "currentLevel": number,                                  │
│      "completedLevels": [1, 2, ...],                          │
│      "unlockedLevels": [1, 2, ...]                            │
│    }                                                           │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           │                          ↑
           │ Provides via useProgress │
           ▼                          │
    ┌────────────────┐           ┌───────────────┐
    │  GameCard.jsx  │──────────→ useProgress()  │
    └────────────────┘           └───────────────┘
           │
           ├─ isLevelUnlocked(gameId, level)
           ├─ isLevelCompleted(gameId, level)
           ├─ completeLevel(gameId, level)
           └─ getCompletedLevels(gameId)
           
    ┌────────────────────────────────────────┐
    │  Game Component                        │
    │  (MemoryTask, MemoryMatchGame, etc)    │
    │                                        │
    │  Calls on completion:                  │
    │  completeLevel(gameId, level)          │
    │         ↓                              │
    │  Marks level as complete              │
    │  Unlocks next level                   │
    │  Saves to localStorage                │
    │  Updates UI                           │
    └────────────────────────────────────────┘
```

## 🔄 Level Unlock Flow

```
START
  │
  ├─ Load Progress from localStorage
  │  (or initialize if first time)
  │
  ├─ Display Homepage with all games
  │
  ├─ For each game:
  │  ├─ Show Level 1 (UNLOCKED)
  │  ├─ Show Level 2-4 (LOCKED - 🔒)
  │  └─ Show Play Button (ENABLED)
  │
  └─ User clicks Play on Level 1
     │
     ├─ Navigate to Game Screen
     ├─ Load Game Component
     │
     └─ User completes game successfully
        │
        ├─ Call completeLevel('gameId', 1)
        │
        ├─ Mark Level 1 as COMPLETED (✓)
        ├─ Mark Level 2 as UNLOCKED (now playable)
        ├─ Save progress to localStorage
        ├─ Update UI (show new unlock)
        │
        └─ Return to Homepage
           │
           └─ Level 2 is now UNLOCKED
              └─ User can play Level 2
```

## 🎯 Feature Implementation Map

```
┌────────────────────────────────────────────────────────────┐
│              Working Memory Training System                │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  UI LAYER (User Facing)                                    │
│  ├─ HomePage ........................ Homepage Screen      │
│  │  ├─ Header & Title .............. Gradient text      │
│  │  ├─ Decorative Elements ......... Stars, emojis     │
│  │  ├─ Game Cards Grid ............. InfiniteScrollList│
│  │  └─ Footer Message .............. Encouragement     │
│  │                                                       │
│  ├─ GameCard ........................ Individual Game   │
│  │  ├─ Game Icon & Title ........... Sinhala text     │
│  │  ├─ Level Display ............... Lock/Check/Play  │
│  │  ├─ Play Button ................. Primary CTA      │
│  │  └─ Progress Bar ................ Visual feedback  │
│  │                                                       │
│  ├─ StarButton ...................... Animated Stars   │
│  │  ├─ Glow Effect ................. Infinite pulse   │
│  │  ├─ Hover Animation ............. Scale + rotate   │
│  │  └─ Tap Animation ............... Bounce effect    │
│  │                                                       │
│  ├─ InfiniteScrollList ............. Scroll Management │
│  │  ├─ Load More Detection ......... Intersection API │
│  │  ├─ Loading Indicator ........... Animated dots    │
│  │  └─ Lazy Rendering .............. Performance opt  │
│  │                                                       │
│  └─ GameWrapper ..................... Game Screen      │
│     ├─ Back Button ................. Navigation       │
│     ├─ Game Title .................. Sinhala text     │
│     └─ Game Component .............. Content area     │
│                                                       │
│  LOGIC LAYER (Business Logic)                          │
│  ├─ ProgressContext ................ State Management │
│  │  ├─ Load Progress .............. localStorage     │
│  │  ├─ Manage Unlocks ............. Level system     │
│  │  ├─ Track Completion ........... Save progress    │
│  │  └─ Persist Data ............... Auto-save        │
│  │                                                     │
│  ├─ WorkingMemoryHome .............. Navigation Logic │
│  │  ├─ Route to HomePage ........... Show all games  │
│  │  ├─ Route to Game Screen ........ Show selected   │
│  │  ├─ Handle Completion ........... Unlock next     │
│  │  └─ Handle Navigation ........... Back button     │
│  │                                                     │
│  └─ Game Components ................ Game Logic      │
│     ├─ MemoryTask ................. Existing game    │
│     ├─ MemoryMatchGame ............ Existing game    │
│     └─ [New Games] ................ To be created   │
│                                                       │
│  UTILITIES & CONFIG (Support)                         │
│  ├─ constants.js .................. Configuration   │
│  │  ├─ GAMES_DATA ................. Game list       │
│  │  ├─ SINHALA_UI ................. UI text        │
│  │  ├─ PASTEL_COLORS .............. Color palette  │
│  │  └─ ANIMATION_DURATIONS ........ Timing config  │
│  │                                                   │
│  ├─ helpers.js .................... Utilities      │
│  │  ├─ shuffleArray ............... Shuffle logic  │
│  │  ├─ generateRandom* ............ Generation     │
│  │  ├─ calculateScore ............. Scoring       │
│  │  ├─ playSound .................. Audio (future) │
│  │  └─ triggerHaptic .............. Vibration     │
│  │                                                   │
│  └─ tailwind.config.js ............ Styling Config │
│     ├─ Colors ..................... Pastel palette │
│     ├─ Animations ................. Keyframes     │
│     ├─ Shadows .................... Effects       │
│     └─ BorderRadius ............... Rounded corners│
│                                                    │
└────────────────────────────────────────────────────────────┘
```

## 📱 State Management Flow

```
┌──────────────────┐
│  ProgressContext │
│  (Global State)  │
└────────┬─────────┘
         │
         │ Provides: useProgress()
         │
    ┌────┴─────────────────────────────┬──────────────────┐
    │                                   │                  │
    ▼                                   ▼                  ▼
┌─────────────────┐          ┌──────────────────┐   ┌────────────┐
│  GameCard       │          │  Game Component  │   │ HomePage   │
│  - Read state   │          │  - Read state    │   │ - Read all │
│  - Show levels  │          │  - Check unlock  │   │   games    │
│  - Disable/     │          │  - Call complete │   │ - Show     │
│    Enable btns  │          │  - Update state  │   │   progress │
└─────────────────┘          └──────────────────┘   └────────────┘
```

## 🎮 Game Flow Sequence

```
1. User Opens App
   └─ ProgressProvider loads from localStorage
      └─ Sets initial state (all games unlocked at level 1)

2. User Sees Homepage
   └─ HomePage displays all 9 games
      └─ Each game shows levels (1=unlocked, 2-4=locked)

3. User Clicks Play on Level 1
   └─ WorkingMemoryHome calls onGameSelect
      └─ Game component mounts
         └─ Game displays with level 1 content

4. User Completes Game
   └─ Game calls onComplete callback
      └─ WorkingMemoryHome calls completeLevel('gameId', 1)
         └─ ProgressContext updates state
            ├─ Marks Level 1 as completed
            ├─ Unlocks Level 2
            └─ Saves to localStorage

5. User Returns to Homepage
   └─ HomePage re-renders
      └─ GameCard now shows Level 2 as unlocked (playable)
         └─ Level 1 shows ✓ (completed)

6. Cycle repeats for next levels (2→3, 3→4)
```

## 🔐 Lock System Logic

```
┌─────────────────────────────────────────────┐
│ Level State Possibilities                   │
├─────────────────────────────────────────────┤
│                                             │
│ LOCKED 🔒                                  │
│ ├─ Not in unlockedLevels array             │
│ ├─ Show locked icon                        │
│ ├─ Disable level button                    │
│ └─ Show greyed out                         │
│                                             │
│ UNLOCKED (Playable)                        │
│ ├─ In unlockedLevels array                 │
│ ├─ NOT in completedLevels array            │
│ ├─ Show playable level button              │
│ ├─ Active color (yellow)                   │
│ ├─ Show level number                       │
│ └─ Enable on click                         │
│                                             │
│ COMPLETED ✓                                │
│ ├─ In completedLevels array                │
│ ├─ Show checkmark ✓                        │
│ ├─ Active color (green)                    │
│ ├─ Still clickable (replay)                │
│ └─ Show completion badge                   │
│                                             │
└─────────────────────────────────────────────┘
```

## 🎨 Animation Pipeline

```
User Interaction
     │
     ├─ HOVER OVER CARD
     │  └─ CardHover animation
     │     └─ scale: 1 → 1.1, y: 0 → -8px
     │        └─ duration: 300ms
     │
     ├─ CLICK BUTTON
     │  └─ TapAnimation
     │     └─ scale: 1 → 0.95 → 1
     │        └─ duration: 200ms
     │
     ├─ STAR BUTTON
     │  └─ GlowAnimation
     │     └─ textShadow: pulse effect
     │     └─ duration: 2s infinite
     │
     ├─ PAGE LOAD
     │  └─ FadeInUp animation
     │     └─ opacity: 0→1, y: 20→0
     │        └─ duration: 500ms
     │
     └─ SCROLL LIST
        └─ StaggerChildren
           └─ Each child: delay += 100ms
              └─ Total: smooth reveal effect
```

## 🗂️ File Organization Benefits

```
src/modules/working-memory/
│
├─ components/      └─ UI Components (dumb components)
│  ├─ Can be reused
│  ├─ Easy to test
│  ├─ Props-driven
│  └─ No business logic
│
├─ context/         └─ Global State (business logic)
│  ├─ Centralized state
│  ├─ Easy to update
│  ├─ Persistent storage
│  └─ Accessed via hooks
│
├─ pages/          └─ Page Wrappers (smart components)
│  ├─ Page-level logic
│  ├─ Navigation
│  ├─ State orchestration
│  └─ Provider wrapping
│
└─ utils/          └─ Helpers & Config
   ├─ Reusable functions
   ├─ Constants
   ├─ Configuration
   └─ No React dependencies
```

## 🔗 Integration Points

```
From HomePage:
└─ onGameSelect(gameId, level)
   └─ Passed to WorkingMemoryHome
      └─ Updates selectedGame state
         └─ Triggers game component render
            └─ Game receives level prop
               └─ Game uses useProgress() for state

From Game Component:
└─ onComplete() callback
   └─ Passed from WorkingMemoryHome
      └─ Calls completeLevel(gameId, level)
         └─ Updates ProgressContext
            └─ Triggers localStorage save
               └─ Homepage re-renders
                  └─ Next level now unlocked
```

## 💾 Data Persistence Strategy

```
App Start
   │
   ├─ ProgressProvider mounts
   │  ├─ Read localStorage('wmProgressData')
   │  ├─ Parse JSON
   │  └─ Set initial state
   │
   └─ User interactions
      │
      └─ completeLevel(gameId, level)
         │
         ├─ Update state
         │
         └─ useEffect dependency
            │
            ├─ Trigger JSON.stringify()
            ├─ Write to localStorage
            └─ Confirm save
                │
                └─ App Close / Reload
                   │
                   └─ Next time:
                      └─ Reload from localStorage ✓
```

---

## 🎓 Key Architectural Decisions

| Decision | Rationale | Benefit |
|----------|-----------|---------|
| Context API for state | Simple, built-in | No external dependencies |
| localStorage for persistence | Browser standard | Works offline |
| Functional components | Modern React | Hooks support |
| Tailwind CSS | Utility-first | Fast development |
| Framer Motion | Simple animations | Smooth, performant |
| Barrel exports | Cleaner imports | Less verbose code |
| Constants file | Single source of truth | Easy maintenance |
| Helper utils | DRY principle | Reusable functions |
| ProgressProvider wrapper | Separation of concerns | Clean architecture |

---

This architecture ensures:
✅ Clean code organization
✅ Easy to extend
✅ Maintainable structure
✅ Reusable components
✅ Persistent state
✅ Smooth user experience
✅ Performance optimized
✅ Sinhala-first design
