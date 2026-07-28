# 📊 Live Database Data Summary

## Current Test User: test-user-001

### What's Stored Right Now

**Total Documents:** 13 (one per game - 6 implemented + 7 unimplemented)

---

## Game: sequence-recall (ACTIVE - Has Progress)

```json
{
  "_id": "6a00db65989d3fa6e3e8a973",
  "userId": "test-user-001",
  "gameId": "sequence-recall",
  
  // LEVEL PROGRESS
  "currentLevel": 2,                    ← Currently on Level 2
  "completedLevels": [1],               ← Completed Level 1
  "unlockedLevels": [1, 2],             ← Levels 1 & 2 unlocked (Level 3 still locked)
  
  // LEVEL PERFORMANCE DATA
  "levelProgress": {
    "1": 100                            ← Level 1: 100% complete
  },
  "levelStats": {
    "1": {
      "timeSpent": 125,                 ← 125 seconds spent on Level 1
      "attemptsCount": 3,               ← 3 attempts to complete
      "finalScore": 950                 ← Final score: 950 points
    }
  },
  
  // ADAPTIVE DIFFICULTY
  "adaptiveProfile": {
    "score": 62,                        ← Difficulty Score: 62/100
    "tier": "balanced",                 ← Tier: BALANCED (medium difficulty)
    "streak": 1,                        ← 1 win streak
    "lastAccuracy": 95,                 ← Last attempt: 95% accurate
    
    "recentResults": [
      {
        "accuracy": 95,                 ← Very accurate
        "mistakes": 1,                  ← Very few mistakes
        "averageResponseMs": 450,       ← Response time: 450ms (fast)
        "timestamp": "2026-05-10T19:24:32.395Z"
      }
    ],
    
    "lastMetrics": {
      "accuracy": 95,
      "mistakes": 1,
      "averageResponseMs": 450
    }
  },
  
  "createdAt": "2026-05-10T19:24:21.955Z",
  "updatedAt": "2026-05-10T19:26:32.597Z"
}
```

---

## Other Games (Default State - No Progress Yet)

```json
{
  "_id": "xxx...",
  "userId": "test-user-001",
  "gameId": "sea-odd-one-out",          // or any other unplayed game
  
  "currentLevel": 1,                    ← Always starts at Level 1
  "completedLevels": [],                ← No levels completed
  "unlockedLevels": [1],                ← Only Level 1 unlocked
  
  "levelProgress": {},                  ← No progress data
  "levelStats": {},                     ← No stats data
  
  "adaptiveProfile": {
    "score": 50,                        ← Default score
    "tier": "balanced",                 ← Default tier
    "streak": 0,                        ← No streak
    "lastAccuracy": null,               ← No attempts yet
    "recentResults": [],                ← Empty
    "lastMetrics": null
  }
}
```

---

## Data Storage Breakdown

### By Game Status

```
IMPLEMENTED (6 games):
├─ sea-odd-one-out        → 1 document (default state)
├─ puzzle-game            → 1 document (default state)
├─ sequence-recall        → 1 document (WITH PROGRESS DATA ⭐)
├─ n-back                 → 1 document (default state)
├─ color-memory           → 1 document (default state)
└─ video-story            → 1 document (default state)

UNIMPLEMENTED (7 games - Still tracked):
├─ memory-match           → 1 document (default state)
├─ instruction-follow     → 1 document (default state)
├─ missing-item           → 1 document (default state)
├─ timed-recall           → 1 document (default state)
├─ sorting-memory         → 1 document (default state)
├─ sound-sequence         → 1 document (default state)
└─ adaptive-puzzle        → 1 document (default state)

TOTAL: 13 documents for user "test-user-001"
```

### Data Sizes

```
Per User:
├─ Unplayed Game    → ~300 bytes
├─ Active Game      → ~600 bytes (with stats/adaptive data)
└─ Total per user   → ~4-5 KB

Database (All Users):
├─ 100 users       → ~400-500 KB
├─ 1000 users      → ~4-5 MB
└─ 10000 users     → ~40-50 MB
```

---

## 🔄 Data Flow Timeline (sequence-recall Game)

```
TIME          EVENT                    DATABASE UPDATE
──────────────────────────────────────────────────────────

T0    User opens "sequence-recall"
      → initializeGame() called         CREATE:
                                        {
                                          userId: "test-user-001",
                                          gameId: "sequence-recall",
                                          currentLevel: 1,
                                          adaptiveProfile: { score: 50, ... }
                                        }

T1    User plays Level 1
      → recordAdaptiveResult(
          { accuracy: 95, mistakes: 1, ... }
        )                               UPDATE:
                                        adaptiveProfile.score: 50 → 62
                                        adaptiveProfile.tier: balanced
                                        adaptiveProfile.streak: 0 → 1
                                        Add to recentResults

T2    User completes Level 1
      → completeLevel(1, stats)        UPDATE:
                                        completedLevels: [] → [1]
                                        unlockedLevels: [1] → [1, 2]
                                        currentLevel: 1 → 2
                                        levelProgress["1"]: 100
                                        levelStats["1"]: { ... }

T3    User opens Level 2
      → Shows easier options because
        adaptive score is still in
        "balanced" tier (36-64)
```

---

## 📱 Frontend ↔ Database Data Sync

```
┌─────────────────────────────────────┐
│ FRONTEND ProgressContext State      │
│ {                                   │
│   "sequence-recall": {              │
│     currentLevel: 2,                │
│     completedLevels: [1],           │
│     adaptiveProfile: {...}          │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
           ⬇ (optimistic update)
        User clicks button
           ⬇ (async sync)
┌─────────────────────────────────────┐
│ API SERVICE (workingMemoryApi.js)   │
│ Makes HTTP POST/GET requests        │
│ userId = persistent ID from         │
│ localStorage                         │
└─────────────────────────────────────┘
           ⬇ (HTTP/JSON)
┌─────────────────────────────────────┐
│ BACKEND Express Server              │
│ Routes & Controllers process data   │
│ Services calculate new values       │
└─────────────────────────────────────┘
           ⬇ (Mongoose operations)
┌─────────────────────────────────────┐
│ MONGODB ATLAS CLOUD                 │
│ Persists updated document           │
│ (Permanent storage)                 │
└─────────────────────────────────────┘
           ⬇ (HTTP response)
┌─────────────────────────────────────┐
│ FRONTEND receives response          │
│ Validates & updates state           │
│ UI re-renders with new data         │
└─────────────────────────────────────┘
           ⬇ (localStorage backup)
┌─────────────────────────────────────┐
│ BROWSER localStorage                │
│ { wmProgressData: {...} }           │
│ (Offline backup, browser-specific)  │
└─────────────────────────────────────┘
```

---

## 🔍 How to Check Database Data

### Option 1: Terminal (Recommended)

```bash
# View all games for a user
curl "http://localhost:4000/api/v1/working-memory/progress?userId=test-user-001"

# View specific game
curl "http://localhost:4000/api/v1/working-memory/progress/sequence-recall?userId=test-user-001"

# View available games
curl "http://localhost:4000/api/v1/working-memory/games"
```

### Option 2: MongoDB Compass (GUI)

1. Connect to: `mongodb+srv://praweenanuwangi_db_user:Praweena@2001@cluster0.nlp0v5g.mongodb.net`
2. Database: `working-memory-backend`
3. Collection: `workingmemoryprogresses`
4. Search: `{ "userId": "test-user-001" }`

### Option 3: Browser DevTools

1. Open your app at http://localhost:5173
2. Open DevTools → Network tab
3. Play a game
4. Watch API requests to `localhost:4000`
5. View response in DevTools showing saved data

---

## 📊 What Data Is Saved?

### For Each Game Record:

```
IDENTITY:
├─ _id              (MongoDB auto-generated)
├─ userId           (Unique user identifier)
└─ gameId           (Which game)

LEVEL PROGRESSION:
├─ currentLevel     (What level is player on)
├─ completedLevels  (Array of finished levels)
└─ unlockedLevels   (Array of available levels)

PERFORMANCE STATS:
├─ levelProgress    (Percentage complete per level)
└─ levelStats       (Time, attempts, score per level)

DIFFICULTY ADAPTATION:
├─ score            (0-100 difficulty score)
├─ tier             (support/balanced/challenge)
├─ streak           (Win/loss streak)
├─ lastAccuracy     (Last attempt accuracy %)
├─ recentResults    (Last 6 game attempts with details)
└─ lastMetrics      (Latest performance metrics)

TIMESTAMPS:
├─ createdAt        (When first played)
└─ updatedAt        (When last updated)
```

---

## ✨ Example Query Results

**Current data for test-user-001:**

```
Games with Data:
1. sequence-recall
   └─ Level 2 (1 completed, 2 unlocked)
   └─ Score: 62 (Balanced tier)
   └─ 1 win streak
   └─ 95% accuracy

Games with Default Data (no progress):
2. sea-odd-one-out         → Level 1, Score 50
3. puzzle-game             → Level 1, Score 50
4. n-back                  → Level 1, Score 50
5. color-memory            → Level 1, Score 50
6. video-story             → Level 1, Score 50
... (7 more unimplemented games same as above)
```

---

## 🎯 Key Insights

1. **User Persistence**: Same userId = same progress across sessions
2. **Per-Game Tracking**: Each game has independent progression
3. **Adaptive Scoring**: Score adjusts based on performance
4. **Tier-Based Difficulty**: UI should show different game options based on tier
5. **Performance History**: Last 6 results stored for analysis
6. **Offline Support**: localStorage keeps local backup
7. **Complete Records**: Every data point timestamped
8. **No Data Loss**: MongoDB persists everything permanently

