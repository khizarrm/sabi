## Sabi Mobile – Home Screen UX Spec

### Purpose
Design a fast, minimal, high-polish Home experience centered on starting a new task quickly (Uber/Airbnb feel). The UI is light-themed, uses Jost typography, green accent, and smooth interactions.

### Principles
- **Action-first**: Primary CTA always in view; 3-tap flow to post a task.
- **Progressive disclosure**: Only the next necessary input is shown.
- **State-aware**: Active tasks replace the CTA with live status.
- **Delightfully fast**: 60fps animations, gentle haptics, no layout jumps.
- **Minimal**: Icon-only tabs, clean surfaces, generous whitespace.

### Visual System
- **Typography**: Jost default; headings use `Jost_700Bold`.
- **Colors**: Light background (`#FFF`), text (`#111827`), accent green (`#065f46`).
- **Surfaces**: Subtle borders (`#E5E7EB`), soft shadows, rounded corners.
- **Tabs**: Icon-only, curved top edges on the anchored tab bar.

### Home Layout
1) Header
- **Greeting**: “Good afternoon, {firstName}” in Jost 700.
- **Location chip**: Current neighborhood/address; tap to open location selector.
- **Availability toggle**: “I’m available” micro-animated switch; shows a subtle pulse when on.

2) Primary CTA (Floating Pill)
- **Placement**: Centered just above the tab bar.
- **Default**: Icon-only; expands to show “New Task” label when scrolling stops.
- **Interaction**: Haptic light impact on press; soft scale-in animation; thin green outline.
- **Purpose**: Opens 3-step bottom sheet.

3) Quick-start Chips
- **Chips**: “Delivery”, “Clean”, “Fix”, “Assemble”, “Other”, plus a “+ Custom” chip.
- **Behavior**: Horizontal snap scrolling; single tap opens the sheet pre-filled.

4) Context Cards (conditional)
- **Active Task Card**: If there’s an ongoing task, a sticky card replaces the CTA (see Active Task).
- **Education/Empty**: First-use delight card with 3 example tiles and “Try a demo task”.

### New Task Flow (Bottom Sheet)
Polished, rounded, keyboard-safe, with step progress that feels instant. Each step validates inline.

- **Step 1 – What**
  - Single-line input with ghost text: “Describe what you need (e.g., Assemble IKEA shelf)”
  - Inline suggestions from recent tasks; category chips appear inline when a known keyword is typed.
  - Next button enabled when description is non-empty.

- **Step 2 – When & Where**
  - Toggle: “Now” / “Schedule”; date-time picker appears only if “Schedule”.
  - Address chip: defaults to current GPS address; tap to edit or choose on mini map.
  - Inline distance estimate: “~1.2 km from you”.

- **Step 3 – Budget**
  - Dual-range slider (min–max) with sensible defaults per category.
  - Helper text: “Most tasks like this cost $45–$70”.
  - Primary button: “Post Task” (accent green). Secondary: “Save as draft”.

Sheet polish: rounded top corners, `Jost_700Bold` headings, perfect keyboard behavior (no jump), haptics on slider end and post.

### Matching State (Uber-like)
- **Overlay**: Full-screen after posting; concentric pulses from the user’s location.
- **Live activity**: “Notified 8 nearby taskers…” with avatar bubbles appearing near the pulse.
- **Timing**: ETA chip “~2–5 min”.
- **Controls**: “Cancel”, “View details” (opens summary sheet).
- **Trust**: Micro copy: “Secured by Stripe escrow”.

### Active Task
- **Sticky card**: Replaces the primary CTA while a task is active.
- **Info**: Task name, assigned tasker, ETA/status chip; tap to expand.
- **Expanded sheet**: Chat/Call, live location, reschedule/cancel, “Complete + Release payment”.
- **Completion**: Success animation; rating sheet (stars + short comment) with Jost 700 heading.

### Micro-interactions
- **Haptics**: Press, slider end, successful post, match found, payment released.
- **Animations**: CTA scale/opacity, chips ripple, sheet step transitions (slide + fade), skeleton loaders.
- **No jank**: Keyboard-safe inputs; bottom sheet uses `fillParent` on iOS and `adjustResize` on Android.

### Accessibility & Performance
- **Touch targets**: ≥44px; `hitSlop` on pill and chips.
- **Contrast**: Legible text in bright light; focus clarity with green accent.
- **Dynamic Type**: Headings and inputs scale; sheet remains usable.
- **Performance**: Avoid layout thrash; recycle lists; prefetch assets where possible.

### Edge Cases
- **Poor GPS**: Fall back to last known/typed address; show inline warning.
- **No network**: Allow drafting; retry on reconnect.
- **No taskers available**: Offer to schedule or broaden budget/category.
- **Payment failure**: Inline resolution, editable budget, retry.

### Component Sketch (by responsibility)
- `HomeHeader`: greeting, location chip, availability toggle.
- `PrimaryCtaPill`: floating pill CTA with expand-on-idle.
- `QuickChipsRow`: horizontal categories.
- `NewTaskSheet`: orchestrates steps 1–3.
- `MatchingOverlay`: pulse animation + live avatars + ETA.
- `ActiveTaskCard` / `ActiveTaskSheet`: live status and actions.

### Telemetry (MVP)
- Tap rates on CTA and chips, sheet step drop-off, match ETA distribution, cancel reasons, budget ranges posted.

### Future Enhancements
- **Smart defaults**: Pre-fill budget from historical data per category and region.
- **Voice input**: Quick speech-to-text for “What do you need?”
- **Proximity tuning**: Let users bias for faster vs. cheaper.
- **Saved templates**: One-tap recurring tasks.


