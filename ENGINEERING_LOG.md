# Engineering Log

### 🛑 SWC Compiler Issue (SWC vs Babel)
**Issue:** Next.js failed to load the SWC binary on macOS (`code signature invalid`).
**Fix:** Bypassed the default compiler by forcing a `.babelrc` fallback configuration.
**Takeaway:** Bleeding-edge tooling often breaks locally; stability > speed.

### 🔐 The Auth Pivot
**Initial State:** Login wall immediately upon landing.
**The Pivot:** Refactored `CreateStudyForm` to allow anonymous generation.
**Why:** Friction kills user activation. Authenticated only for "Save to Library" actions (Write operations).

### 🎮 Gamification Logic (Millionaire Mode)
**Challenge:** Standard quizzes are boring.
**Solution:** Implemented a progressive "Money Ladder" UI.
**Logic:** 
*   Used a strict JSON system prompt for Gemini to output `difficulty` keys.
*   Built a `filter()` algorithm for the "50/50 Lifeline" to remove 2 random wrong answers.

### 🔄 Active Recall State Management
**Bug:** Flashcards displayed Front/Back simultaneously (Passive reading).
**Fix:** Refactored to use `useState` for binary flip tracking.
**UX Rule:** Added a `resetOnNext` pattern to ensure cards always default to "Front" when navigating.

### [2026-04-05] 🔗 The URL Input Rollback
**Issue:** Passing a raw URL directly to Gemini produced convincing but unrelated outputs, because the model was not actually reading the linked content.

**Decision:** Removed URL mode from the product for now rather than exposing a misleading feature.

**Why:** Reliability matters more than surface-level feature breadth.

**Future Direction:** Reintroduce URL support later with proper transcript extraction or page scraping.

### 🤖 Gemini Model Mismatch
**Issue:** Initial API calls produced inconsistent or fallback outputs due to using an incorrect or outdated Gemini model version.

**Fix:** Updated to the correct model (`gemini-flash-latest`) and verified structured JSON output.

**Takeaway:** Model versioning matters — incorrect models can silently degrade output quality even when API calls succeed.
