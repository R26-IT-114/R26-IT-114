# Database & Data Flow Documentation

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                        │
│              http://localhost:5173                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ HomePage / Game Components (Sinhala UI)                    │  │
│  │ - Shows 6 implemented games                                │  │
│  │ - User plays games, triggers state changes                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ↓ (user interactions)                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ProgressContext (React Context API)                        │  │
│  │ - Manages game progress state locally                      │  │
│  │ - Optimistically updates UI immediately                    │  │
│  │ - Keeps backup in localStorage                             │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ↓ (async sync)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ API Service (workingMemoryApi.js)                          │  │
│  │ - Calls backend endpoints                                  │  │
│  │ - Generates persistent userId                             │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            ↕ HTTP/JSON (REST API)
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js)                         │
│              http://localhost:4000/api/v1                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Express Routes (/api/v1/working-memory)                    │  │
│  │ - GET /games                                               │  │
│  │ - GET/POST /progress endpoints                             │  │
│  │ - POST /progress/:gameId/initialize                        │  │
│  │ - POST /progress/:gameId/result                            │  │
│  │ - POST /progress/:gameId/complete-level                    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Controllers (Request Processing)                           │  │
│  │ - Validates userId                                         │  │
│  │ - Calls business logic services                            │  │
│  │ - Returns formatted JSON responses                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Services (Business Logic)                                  │  │
│  │ - workingMemoryService: CRUD operations                    │  │
│  │ - adaptiveDifficultyService: Scoring logic                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Mongoose Model (WorkingMemoryProgress)                     │  │
│  │ - Defines data schema                                      │  │
│  │ - Validates data types                                     │  │
│  │ - Handles database operations                              │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            ↕ MongoDB Query Language
┌─────────────────────────────────────────────────────────────────┐
│                       MONGODB ATLAS                              │
│                      (Cloud Database)                            │
│  Database: working-memory-backend                                │
│  Collection: workingmemoryprogresses                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ One document per (userId + gameId) combination             │  │
│  │ - Each user gets 13 game progress records                  │  │
│  │ - All adaptive scoring data persisted                      │  │
│  │ - Level completion tracked                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA

### Collection: `workingmemoryprogresses`

**One document example (sequence-recall game for test-user-001):**

```json
{
  "_id": "6a00db65989d3fa6e3e8a973",           // MongoDB Auto-generated ID
  "userId": "test-user-001",                    // Persistent user identifier
  "gameId": "sequence-recall",                  // Game name
  
  // ═══ LEVEL PROGRESSION ═══
  "currentLevel": 2,                            // Current level player is on
  "completedLevels": [1],                       // Array of completed level numbers
  "unlockedLevels": [1, 2],                     // Unlocked levels (auto-unlock next after completion)
  
  // ═══ LEVEL STATISTICS ═══
  "levelProgress": {
    "1": 100                                    // Level 1: 100% complete
  },
  
  "levelStats": {
    "1": {                                      // Stats for Level 1
      "timeSpent": 125,                         // Seconds spent
      "attemptsCount": 3,                       // Number of attempts
      "finalScore": 950                         // Final score earned
    }
  },
  
  // ═══ ADAPTIVE DIFFICULTY PROFILE ═══
  "adaptiveProfile": {
    "score": 62,                                // Current difficulty score (0-100)
    "tier": "balanced",                         // Difficulty tier: support/balanced/challenge
    "streak": 1,                                // Win streak (-3 to +3)
    "lastAccuracy": 95,                         // Last attempt accuracy %
    "updatedAt": "2026-05-10T19:24:32.395Z",   // Last update timestamp
    
    "recentResults": [
      {
        "accuracy": 95,                         // Accuracy percentage
        "mistakes": 1,                          // Number of mistakes
        "attempts": null,                       // Total attempts (if applicable)
        "averageResponseMs": 450,               // Average response time in milliseconds
        "timestamp": "2026-05-10T19:24:32.395Z" // When this result was recorded
      }
    ],
    
    "lastMetrics": {                            // Latest performance metrics
      "accuracy": 95,
      "mistakes": 1,
      "averageResponseMs": 450,
      "attempts": null
    }
  },
  
  // ═══ TIMESTAMPS ═══
  "createdAt": "2026-05-10T19:24:21.955Z",     // When record was created
  "updatedAt": "2026-05-10T19:26:32.597Z"      // When record was last updated
}
```

---

## 📈 Adaptive Scoring System

### How Score Changes

**Score Range:** 0-100 (Default start: 50 = "balanced")

**Difficulty Tiers:**
- **0-35**: 🟢 Support (Easier - fewer options, more time, hints)
- **36-64**: 🟡 Balanced (Medium difficulty)
- **65-100**: 🔴 Challenge (Harder - more options, faster pace, no hints)

### Scoring Rules

**Accuracy-Based Deltas:**
```
Accuracy ≥ 92% → +12 points
Accuracy ≥ 80% → +7 points
Accuracy ≥ 65% → +2 points
Accuracy ≤ 55% → -7 points
Accuracy ≤ 40% → -12 points
```

**Mistake Rate Penalties:**
```
Mistake Rate ≥ 45% → -4 points
Mistake Rate ≤ 15% → +3 points
```

**Response Time Adjustments:**
```
Response ≤ 0.75 × target → +3 points (Very fast)
Response ≥ 1.35 × target → -3 points (Very slow)
```

**Streak Bonus/Penalty:**
```
Streak = -3 or -2 → -2 points (losing streak)
Streak = +2 or +3 → +2 points (winning streak)
```

**Final Score:** Clamped to 0-100 range, then tier recalculated

---

## 🔄 Data Flow Examples

### Scenario 1: User Plays First Time

```
1. FRONTEND: User opens game "sequence-recall"
   └─> ProgressContext calls wmApi.initializeGame("sequence-recall")

2. BACKEND: 
   POST /api/v1/working-memory/progress/sequence-recall/initialize
   Request body: { userId: "user-xxx", ... }
   └─> Creates MongoDB document with:
       - currentLevel: 1
       - unlockedLevels: [1]
       - adaptiveProfile: { score: 50, tier: "balanced", ... }
       - completedLevels: []

3. DATABASE SAVED:
   workingmemoryprogresses.insertOne({
     userId: "user-xxx",
     gameId: "sequence-recall",
     currentLevel: 1,
     adaptiveProfile: { score: 50, tier: "balanced", ... }
   })

4. FRONTEND: UI updates, shows Level 1 available
```

### Scenario 2: User Completes a Level

```
1. FRONTEND: User completes Level 1 with 95% accuracy
   └─> ProgressContext calls wmApi.completeLevel("sequence-recall", 1, stats)

2. BACKEND:
   POST /api/v1/working-memory/progress/sequence-recall/complete-level
   Request body: {
     userId: "user-xxx",
     level: 1,
     stats: { timeSpent: 125, attemptsCount: 3, finalScore: 950 }
   }

3. DATABASE UPDATED:
   workingmemoryprogresses.updateOne(
     { userId: "user-xxx", gameId: "sequence-recall" },
     {
       $push: { completedLevels: 1 },
       $set: { 
         currentLevel: 2,
         unlockedLevels: [1, 2],
         "levelProgress.1": 100,
         "levelStats.1": { timeSpent: 125, ... }
       }
     }
   )

4. FRONTEND: 
   ✅ Level 1 marked complete
   🔓 Level 2 unlocked
   Current level advanced to 2
```

### Scenario 3: Adaptive Difficulty Updates

```
1. FRONTEND: User submits game result
   └─> ProgressContext calls wmApi.recordAdaptiveResult(
     "sequence-recall",
     { accuracy: 95, mistakes: 1, averageResponseMs: 450 }
   )

2. BACKEND: adaptiveDifficultyService calculates:
   - Accuracy 95% → +12 points
   - Mistake rate low → +3 points
   - Response time good → +3 points
   - Streak: +1 (winning)
   - Total delta: +12 points
   - New score: 50 + 12 = 62
   - New tier: "balanced" (still in 36-64 range)

3. DATABASE UPDATED:
   workingmemoryprogresses.updateOne(
     { userId: "user-xxx", gameId: "sequence-recall" },
     {
       $set: {
         "adaptiveProfile.score": 62,
         "adaptiveProfile.tier": "balanced",
         "adaptiveProfile.streak": 1,
         "adaptiveProfile.lastAccuracy": 95,
         "adaptiveProfile.updatedAt": Date.now()
       },
       $push: {
         "adaptiveProfile.recentResults": {
           accuracy: 95,
           mistakes: 1,
           averageResponseMs: 450,
           timestamp: Date.now()
         }
       }
     }
   )

4. FRONTEND: 
   📊 Difficulty badge updates (if shown)
   🎯 Next game automatically adjusted based on new tier
```

---

## 📚 Complete Data for One User

When user "test-user-001" plays all 6 games, MongoDB stores:

```
Database: working-memory-backend
Collection: workingmemoryprogresses

Documents (one per game):
├─ { userId: "test-user-001", gameId: "sea-odd-one-out", ... }
├─ { userId: "test-user-001", gameId: "puzzle-game", ... }
├─ { userId: "test-user-001", gameId: "sequence-recall", ... }
├─ { userId: "test-user-001", gameId: "n-back", ... }
├─ { userId: "test-user-001", gameId: "color-memory", ... }
└─ { userId: "test-user-001", gameId: "video-story", ... }
```

**Total Documents per User:** 13 (6 implemented + 7 unimplemented placeholders)

---

## 🔐 Data Uniqueness Constraints

**Compound Index:** `{ userId: 1, gameId: 1 }` (UNIQUE)

Meaning: Each user can have ONLY ONE progress record per game.

```
✅ ALLOWED:
- User A playing "sequence-recall" → Document 1
- User A playing "puzzle-game" → Document 2
- User B playing "sequence-recall" → Document 3

❌ BLOCKED:
- User A trying to create second "sequence-recall" record
  → Database rejects, updates existing instead
```

---

## 🔄 API Endpoints & Data Flow

| Endpoint | Method | Request | Response | Database Action |
|----------|--------|---------|----------|-----------------|
| `/progress/:gameId/initialize` | POST | `{userId, gameId}` | Full progress doc | INSERT or UPDATE |
| `/progress/:gameId` | GET | `?userId=xxx` | Full progress doc | READ |
| `/progress` | GET | `?userId=xxx` | Array of 13 games | READ ALL |
| `/progress/:gameId/complete-level` | POST | `{userId, level, stats}` | Updated doc | UPDATE levels/unlocks |
| `/progress/:gameId/level-progress` | POST | `{userId, level, percent, stats}` | Updated doc | UPDATE levelProgress |
| `/progress/:gameId/result` | POST | `{userId, metrics}` | Updated doc + new tier | UPDATE adaptiveProfile |
| `/progress/:gameId/reset-adaptive` | POST | `{userId}` | Reset doc | RESET score to 50 |
| `/progress/reset-all-adaptive` | POST | `{userId}` | All docs reset | RESET all scores |

---

## 💾 Local Backup (localStorage)

Frontend also saves to browser localStorage:

```javascript
localStorage.getItem('wmProgressData')
// Returns: {
//   "sequence-recall": { currentLevel: 2, ... },
//   "puzzle-game": { currentLevel: 1, ... },
//   ...
// }
```

**Purpose:** Offline support - if backend is down, uses localStorage data

---

## ✅ Summary

| Aspect | Details |
|--------|---------|
| **Database** | MongoDB Atlas (Cloud) |
| **Collection** | workingmemoryprogresses |
| **Docs per user** | 13 (one per game) |
| **Total data types** | 7 (userId, gameId, levels, stats, adaptive profile, timestamps) |
| **User identifier** | Generated on first visit, stored in localStorage (userId key) |
| **Data persistence** | Permanent (until manually reset) |
| **Update frequency** | Real-time (after each game event) |
| **Backup location** | Browser localStorage (browser-specific, local-only) |

---

## 🧪 Test Current Data

Run this in your terminal to see your test user data:

```bash
# View all games for user
curl "http://localhost:4000/api/v1/working-memory/progress?userId=test-user-001"

# View specific game
curl "http://localhost:4000/api/v1/working-memory/progress/sequence-recall?userId=test-user-001"
```
