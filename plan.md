# Sapling - Phased Implementation Plan

## Overview

Build an emotional journal app that visualizes emotions as a growing 3D tree using Claude AI for sentiment analysis. Implementation will proceed in phases with commits after each major feature completion.

## Phase Breakdown

### Phase 0: Prerequisites Setup ⚙️

**What we'll do:**

- Guide you through creating a Supabase project (free tier)
- Get your Anthropic API key from console.anthropic.com
- Set up API keys and test connectivity

**Deliverable:** Working credentials, ready to start development

---

### Phase 1: Project Foundation 🏗️

**What we'll build:**

- Initialize Next.js 14 project with TypeScript, Tailwind CSS
- Install all core dependencies (Supabase, Anthropic SDK, Three.js, etc.)
- Set up environment variables
- Create basic app structure and routing

**Files created:** ~5-8 files (Next.js config, layout, basic pages)

**Commit checkpoint:** "Initial project setup with dependencies"

---

### Phase 2: Authentication System 🔐

**What we'll build:**

- Supabase auth integration
- Login and signup pages
- Protected routes middleware
- Auth context provider

**Files created:** `app/auth/login/page.tsx`, `app/auth/signup/page.tsx`, `lib/supabase/client.ts`, `middleware.ts`

**Commit checkpoint:** "Complete authentication flow"

---

### Phase 3: Database Schema 🗄️

**What we'll build:**

- Create Supabase tables (journal_entries, sentiment_analysis, tree_state)
- Set up Row Level Security policies
- Create database type definitions

**Files created:** SQL migration file, `types/database.types.ts`

**Commit checkpoint:** "Database schema and RLS policies"

---

### Phase 4: Claude Integration 🤖

**What we'll build:**

- API route `/api/analyze-entry` for sentiment analysis
- Claude API client with structured prompts
- Emotion extraction logic
- Test endpoint functionality

**Files created:** `app/api/analyze-entry/route.ts`, `lib/claude/analyze.ts`

**Commit checkpoint:** "Claude sentiment analysis API"

---

### Phase 5: Journal Interface ✍️

**What we'll build:**

- Journal entry form with word count
- Submit entry → trigger Claude analysis
- Display sentiment results
- Entry list with filters

**Files created:** `app/journal/page.tsx`, `components/journal/EntryForm.tsx`, `components/journal/EntryList.tsx`

**Commit checkpoint:** "Journal entry interface with Claude analysis"

---

### Phase 6: Basic 3D Tree Visualization 🌳

**What we'll build:**

- React Three Fiber scene setup
- Procedural tree generator (trunk + branches)
- Basic tree rendering with camera controls
- Connect to tree_state from database

**Files created:** `components/3d/TreeScene.tsx`, `components/3d/Tree.tsx`, `lib/tree/generator.ts`

**Commit checkpoint:** "3D tree visualization foundation"

---

### Phase 7: Tree Growth & Emotion Mapping 🎨

**What we'll build:**

- Map emotions to tree visual changes (colors, branches, leaves)
- Animated transitions between states
- Particle effects for different emotions
- Update tree based on new journal entries

**Files created:** `lib/tree/mutations.ts`, `components/3d/Effects.tsx`, `components/3d/Leaf.tsx`

**Commit checkpoint:** "Emotion-driven tree mutations"

---

### Phase 8: Dashboard & Analytics 📊

**What we'll build:**

- Main dashboard with tree centerpiece
- Emotion analytics charts
- Streak counter
- Entry filtering (by emotion, sentiment, date)

**Files created:** `app/dashboard/page.tsx`, `components/analytics/*`

**Commit checkpoint:** "User dashboard and analytics"

---

### Phase 9: "Your Story" Feature 📖

**What we'll build:**

- AI-generated personal narrative from journal entries
- Claude analyzes patterns and generates cohesive story
- Beautiful presentation of insights

**Files created:** `app/api/generate-story/route.ts`, `app/profile/page.tsx`

**Commit checkpoint:** "AI-generated personal story feature"

---

### Phase 10: Polish & Optimization ✨

**What we'll build:**

- Responsive mobile design
- Loading states and error handling
- Performance optimization (tree LOD, instancing)
- Onboarding tutorial

**Commit checkpoint:** "Polish and optimization"

---

## Tree Personalization & Emotion System 🌳

### Core Principle: Unique Trees for Every User

Each user's tree is **completely unique** based on their personal journal history. The tree is generated procedurally using:

- **User ID as seed**: Ensures consistent tree shape for same user
- **Journal entry data**: Each entry modifies the tree state permanently
- **Emotion history**: Different emotional patterns create different tree structures
- **Temporal data**: Time of day, day of week affects branch placement

**Example:**

- User A journals daily about gratitude → tall tree with pink blossoms
- User B journals sporadically about stress → shorter tree with darker leaves, some falling
- User C has mixed emotions → asymmetric tree with varied branch colors

### How Emotions Affect the Tree (Detailed)

#### 1. **Joy/Happiness** 😊

- **Visual Effects:**
  - Bright yellow/golden flowers bloom at branch tips
  - Tree emits subtle golden glow (point light)
  - Leaves become vibrant green (#3fb544)
  - Particle system: sparkles rising upward
- **Growth Impact:**
  - +1 new branch added
  - Overall health increases by 0.1
  - Trunk thickness +0.05

#### 2. **Creativity/Inspiration** 💡

- **Visual Effects:**
  - New branches sprout in unexpected directions
  - Rainbow-colored leaves (gradient: purple, orange, teal)
  - Branches twist and curve artistically
  - Particle system: swirling colors around tree
- **Growth Impact:**
  - +2-3 new branches (more than joy)
  - Branches have higher curvature (non-uniform)
  - New leaf types with varied shapes

#### 3. **Peace/Calm** 🕊️

- **Visual Effects:**
  - Soft pastel colors (light blue #87ceeb, soft green #98fb98)
  - Gentle swaying animation (sine wave motion)
  - Smooth, rounded branch shapes
  - Ambient fog effect around tree
- **Growth Impact:**
  - Stable growth (no dramatic changes)
  - Increased trunk stability
  - Balanced, symmetric branch distribution

#### 4. **Love/Gratitude** ❤️

- **Visual Effects:**
  - Pink and warm-toned blossoms (#ff69b4, #ffb6c1)
  - Heart-shaped leaves (custom geometry)
  - Warm ambient lighting (orange/pink tint)
  - Floating heart particles
- **Growth Impact:**
  - New flowering nodes at branch ends
  - Increased overall vitality
  - Branches reach outward (welcoming posture)

#### 5. **Excitement/Energy** ⚡

- **Visual Effects:**
  - Vibrant, saturated colors (neon greens, bright yellows)
  - Rapid pulsing animation
  - Leaves flutter quickly
  - Electric particle effects (lightning-like)
- **Growth Impact:**
  - Rapid growth burst (+3 branches in one entry)
  - Increased leaf density
  - Upward-reaching branches

#### 6. **Sadness** 😢

- **Visual Effects:**
  - Blue tint on leaves (#4682b4, #1e3a5f)
  - Drooping branches (negative Y rotation)
  - Slower animation speed
  - Rain particle effect (downward droplets)
- **Growth Impact:**
  - No new branches added
  - Some leaves fall off (-5 leaves)
  - Overall health decreases by 0.05
  - Branches sag downward

#### 7. **Stress/Anxiety** 😰

- **Visual Effects:**
  - Desaturated colors (grays, muted greens)
  - Leaves fall rapidly (animated detachment)
  - Branches shake/tremble (noise-based animation)
  - Darker ambient lighting
- **Growth Impact:**
  - Leaf count decreases (-10 leaves)
  - Branch health deteriorates
  - Some branches become brittle (thinner)
  - Overall health -0.1

#### 8. **Anger/Frustration** 😠

- **Visual Effects:**
  - Red and orange leaves (#ff4500, #8b0000)
  - Sharp thorns appear on branches
  - Aggressive, jagged branch shapes
  - Fire/ember particle effects
- **Growth Impact:**
  - Thorns added to branch geometry
  - Harsh, angular branch growth
  - Leaves become pointed
  - Tree becomes more compact/defensive

#### 9. **Fear/Worry** 😨

- **Visual Effects:**
  - Muted, washed-out colors
  - Tree shrinks slightly (scale down 5%)
  - Leaves curl inward
  - Dark shadows increase
- **Growth Impact:**
  - Overall scale reduction
  - Branches pull inward
  - New growth is stunted
  - Health decreases by 0.08

#### 10. **Exhaustion** 😴

- **Visual Effects:**
  - Gray and brown tones (#808080, #654321)
  - Wilting animation (drooping everywhere)
  - Minimal movement (low animation speed)
  - Dust particles instead of vibrant effects
- **Growth Impact:**
  - No new growth
  - Existing leaves lose color
  - Branch vitality decreases
  - Overall health -0.12

### Tree State Persistence

Each journal entry permanently affects the tree:

```javascript
// Example tree state after 5 entries:
{
  branches: [
    { id: 1, emotion: "joy", color: "#3fb544", angle: 45, length: 2.5 },
    { id: 2, emotion: "stress", color: "#808080", angle: -20, length: 1.8 },
    { id: 3, emotion: "creativity", color: "#9b59b6", angle: 120, length: 3.0 },
    // ... more branches
  ],
  leaves: [...], // Each leaf tied to an emotion
  effects: ["sparkles", "rain"], // Active particle systems
  overallHealth: 0.65, // Average of all emotions
  trunkThickness: 1.25 // Grows with consistency
}
```

### Additional Personalization Factors

1. **Streak System**

   - 7-day streak: Trunk becomes thicker, more stable
   - 30-day streak: Tree grows taller, golden aura
   - Missed day: Small cracks appear in bark

2. **Word Count Impact**

   - Short entries (<100 words): Small branch
   - Medium entries (100-500 words): Normal branch
   - Long entries (>500 words): Thick, substantial branch with more leaves

3. **Time of Day**

   - Morning entries: Branches grow eastward (sunrise direction)
   - Evening entries: Branches grow westward (sunset direction)
   - Night entries: Darker leaves, moon-influenced colors

4. **Emotion Diversity**

   - Varied emotions → interesting, asymmetric tree
   - Same emotion repeatedly → uniform but potentially monotonous
   - Balance of positive/negative → realistic, healthy tree

---

## Which Phases to Implement?

**Recommended MVP** (Phases 0-6): Core functionality with working tree visualization

**Full Featured** (Phases 0-9): Complete app with AI story feature

**Demo Ready** (Phases 0-10): Production-ready with polish

**Next Step:** Let me know which phases you'd like to implement, and I'll start with Phase 0 (prerequisites setup).