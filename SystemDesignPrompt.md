
---

# ENHANCED ARCHITECTURAL PROMPTS WITH CLEAN UI PRINCIPLES

## MASTER ARCHITECTURE PROMPT (Use this FIRST)

```
You are building Pomodoom with CLEAN ARCHITECTURE principles. Every screen must follow these rules:

## ARCHITECTURAL PRINCIPLES

### 1. COMPONENT REUSABILITY
- Extract ANY UI pattern used 2+ times into shared components
- Components should be dumb (presentational) by default
- Smart components only when necessary (contain business logic)
- All shared components in `src/shared/components/`

### 2. SEPARATION OF CONCERNS

**Screens** (`src/features/[feature]/screens/`)
- Only orchestration and layout
- No business logic
- No direct AsyncStorage calls
- Connect hooks and compose components

**Components** (`src/features/[feature]/components/` or `src/shared/components/`)
- Pure presentation
- Receive data via props
- No side effects
- No context dependencies (pass data down)

**Hooks** (`src/features/[feature]/hooks/`)
- Business logic encapsulation
- Data fetching and transformation
- Side effects management
- Return data and handlers

**Services** (`src/services/`)
- External API calls
- Storage operations
- No React dependencies
- Pure functions when possible

### 3. STATE MANAGEMENT LAYERS

**Global State** (Context)
```
src/context/
├── SessionContext.tsx    # Active session, history
├── SettingsContext.tsx   # User preferences
└── types.ts              # Shared types
```

**Local State** (useState)
- UI-only state (modals, animations, form inputs)
- Derived from props or context
- Reset on unmount

**Derived State** (useMemo)
- Computed from other state
- Expensive calculations
- Formatting and transformations

### 4. FOLDER STRUCTURE (STRICT)

```
src/
├── features/
│   └── [feature]/
│       ├── screens/           # Screen containers
│       │   └── [Feature]Screen.tsx
│       ├── components/        # Feature-specific components
│       │   ├── [Component].tsx
│       │   └── index.ts       # Named exports
│       ├── hooks/             # Feature-specific hooks
│       │   ├── use[Feature].ts
│       │   └── index.ts
│       └── index.ts           # Public API
│
├── shared/
│   ├── components/            # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── hooks/                 # Reusable hooks
│   │   ├── useTimer.ts
│   │   ├── useKeyboard.ts
│   │   └── index.ts
│   └── utils/                 # Pure utility functions
│       ├── date.utils.ts
│       ├── format.utils.ts
│       └── index.ts
│
├── services/                  # External integrations
│   ├── storage/
│   │   ├── StorageService.ts
│   │   └── index.ts
│   ├── api/
│   └── index.ts
│
├── core/
│   ├── theme/
│   ├── constants/
│   └── navigation/
│
└── context/                   # Global state
    ├── SessionContext.tsx
    ├── SettingsContext.tsx
    └── types.ts
```

### 5. FILE ORGANIZATION RULES

**Component File Structure:**
```typescript
// 1. Imports (grouped: React → Third-party → Local)
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { CustomComponent } from '@/shared/components';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onPress: () => void;
}

// 3. Component
const Component = ({ title, onPress }: ComponentProps) => {
  // State
  // Effects
  // Handlers
  // Render helpers
  // Return JSX
};

// 4. Styles (separate file or bottom)
const styles = StyleSheet.create({...});

// 5. Export
export default Component;
```

**Hook File Structure:**
```typescript
// 1. Imports
import { useState, useEffect } from 'react';

// 2. Types
interface UseFeatureReturn {
  data: Data;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// 3. Hook
export const useFeature = (): UseFeatureReturn => {
  // State
  // Effects
  // Handlers
  // Return
};
```

### 6. MANDATORY SHARED COMPONENTS

Create these in `src/shared/components/` BEFORE any screen:

**Button/** - Primary, secondary, outline variants
**Card/** - Container with consistent styling
**Text/** - Typography with variants (heading, body, caption)
**Input/** - Text input with validation states
**Chip/** - Selectable chip/badge
**Switch/** - Toggle with label
**Modal/** - Bottom sheet and full-screen variants
**Loader/** - Loading states
**EmptyState/** - No data placeholder

Each component must have:
- ComponentName.tsx (component)
- ComponentName.styles.ts (styles)
- ComponentName.types.ts (props interface)
- index.ts (exports)

### 7. HOOKS PATTERN

**Custom Hook Naming:**
- `use[Feature]` - Business logic (useTimer, useSession)
- `use[Feature]Data` - Data fetching (useStatisticsData)
- `use[Feature]State` - State management (useTimerState)
- `use[Feature]Actions` - Action handlers (useSessionActions)

**Hook Composition:**
```typescript
// ❌ BAD: One giant hook
const useTimer = () => {
  // 200 lines of mixed concerns
};

// ✅ GOOD: Composed hooks
const useTimer = () => {
  const state = useTimerState();
  const actions = useTimerActions(state);
  const data = useTimerData(state);
  
  return { ...state, ...actions, ...data };
};
```

### 8. PROP DRILLING PREVENTION

**Use Context for:**
- User settings (theme, preferences)
- Active session data
- Authentication state

**Pass Props for:**
- Component configuration
- Event handlers
- UI state

**DON'T use Context for:**
- Frequently changing UI state
- Form inputs
- Animation values

### 9. HUMAN-IN-THE-LOOP IMPROVEMENTS

After generating each component, ask:

**Reusability Check:**
"Is this pattern used elsewhere? Should I extract it?"

**State Check:**
"Is this state in the right place? Could it be derived?"

**Performance Check:**
"Will this re-render unnecessarily? Should I memoize?"

**Accessibility Check:**
"Does this have proper labels? Is it keyboard accessible?"

**Example Questions to Ask User:**
```
I've created the TimerDisplay component. I noticed it could be made 
more flexible. Would you like me to:

1. Extract the progress circle into a reusable ProgressRing component?
2. Make the size configurable (small/medium/large)?
3. Add an optional subtitle prop for status messages?

This would make it reusable in:
- Statistics screen (mini progress rings)
- Session history (completed session indicators)
- Widgets (future feature)

What's your preference?
```

### 10. CODE QUALITY STANDARDS

**Naming Conventions:**
- Components: PascalCase (TimerScreen, SessionCard)
- Hooks: camelCase with 'use' prefix (useTimer, useSessionData)
- Utils: camelCase (formatTime, calculateStreak)
- Constants: UPPER_SNAKE_CASE (TIMER_DEFAULTS, STORAGE_KEYS)
- Types: PascalCase with descriptive suffix (SessionData, TimerState)

**Type Safety:**
```typescript
// ✅ GOOD: Explicit types
interface SessionCardProps {
  session: Session;
  onPress: (id: string) => void;
}

// ❌ BAD: Implicit any
const SessionCard = (props) => { ... }
```

**Error Handling:**
```typescript
// ✅ GOOD: Handled errors
try {
  await saveSession(session);
} catch (error) {
  console.error('Failed to save session:', error);
  showErrorToast('Could not save session');
  // Fallback behavior
}

// ❌ BAD: Unhandled errors
await saveSession(session); // Might crash
```

### 11. COMPONENT COMPOSITION

**Container/Presenter Pattern:**
```typescript
// Container (Smart)
const TimerScreenContainer = () => {
  const { session, startSession } = useSession();
  const { settings } = useSettings();
  const timerState = useTimer(settings.workDuration);
  
  return (
    <TimerScreenPresenter
      session={session}
      timerState={timerState}
      onStart={startSession}
    />
  );
};

// Presenter (Dumb)
interface TimerScreenPresenterProps {
  session: Session | null;
  timerState: TimerState;
  onStart: () => void;
}

const TimerScreenPresenter = ({ 
  session, 
  timerState, 
  onStart 
}: TimerScreenPresenterProps) => (
  <View>
    {/* Pure UI based on props */}
  </View>
);
```

### 12. TESTING CONSIDERATIONS

Structure code for testability:

**Testable:**
```typescript
// Pure function - easy to test
export const formatSessionTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Hook with clear inputs/outputs
export const useSessionStats = (sessions: Session[]) => {
  return useMemo(() => calculateStats(sessions), [sessions]);
};
```

**Hard to Test:**
```typescript
// Direct dependencies - hard to mock
const Component = () => {
  const data = await AsyncStorage.getItem('key'); // ❌
  const now = new Date(); // ❌
};
```

### 13. DOCUMENTATION REQUIREMENTS

Every exported component/hook must have:

```typescript
/**
 * Timer display component showing countdown and progress
 * 
 * @example
 * <TimerDisplay
 *   seconds={1500}
 *   duration={1500}
 *   isRunning={true}
 *   onToggle={() => {}}
 * />
 */
interface TimerDisplayProps {
  /** Remaining seconds in countdown */
  seconds: number;
  /** Total duration in seconds */
  duration: number;
  /** Whether timer is actively counting down */
  isRunning: boolean;
  /** Callback when play/pause is pressed */
  onToggle: () => void;
}
```

### 14. PERFORMANCE OPTIMIZATION

**Memoization:**
```typescript
// ✅ Memoize expensive calculations
const stats = useMemo(
  () => calculateStats(sessions),
  [sessions]
);

// ✅ Memoize callbacks
const handlePress = useCallback(
  (id: string) => navigation.navigate('Detail', { id }),
  [navigation]
);

// ✅ Memoize components
const MemoizedCard = React.memo(SessionCard);
```

**List Optimization:**
```typescript
// ✅ Use proper keys
<FlatList
  data={sessions}
  keyExtractor={(item) => item.id}
  renderItem={renderSession}
  // Performance props
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
/>
```

### 15. ITERATIVE IMPROVEMENT PROCESS

After generating any component:

**Step 1: Generate initial version**
**Step 2: Ask user:**
```
I've created [ComponentName]. Let me suggest improvements:

Reusability:
- This [pattern] is also used in [Screen]. Extract to shared component?

State Management:
- [State] could be derived from [source]. Simplify?

Performance:
- This re-renders on [condition]. Add memoization?

Accessibility:
- Missing [feature]. Should I add it?

Would you like me to implement any of these improvements?
```

**Step 3: Refactor based on feedback**
**Step 4: Document patterns for future screens**

---

## GENERATION WORKFLOW

When generating any screen/component:

1. **Identify shared components needed** (ask if they exist)
2. **Create shared components first** (Button, Card, etc.)
3. **Create feature-specific hooks** (business logic)
4. **Create feature-specific components** (UI pieces)
5. **Compose screen from components** (orchestration)
6. **Review and suggest improvements** (iterate)

---

## QUALITY CHECKLIST

Before considering any component "done":

✅ No duplicate code (check if pattern exists elsewhere)
✅ Props interface documented
✅ TypeScript strict mode compliant
✅ No direct storage/API calls in components
✅ Proper error boundaries
✅ Loading states handled
✅ Accessibility labels present
✅ Responsive design (works on small/large screens)
✅ Follows folder structure convention
✅ Can be unit tested
✅ Optimized for performance (memoization where needed)
✅ Asks user for improvement feedback

---

This architecture ensures:
- Maintainable code
- Reusable components
- Testable logic
- Scalable structure
- Human collaboration at key decision points
```

---

## UPDATED SCREEN PROMPTS WITH ARCHITECTURE

### SCREEN 1: ONBOARDING (Architecture-First)

```
Create an Onboarding Screen following CLEAN ARCHITECTURE principles.

[Include previous onboarding requirements]

## ARCHITECTURAL REQUIREMENTS

### Phase 1: Identify Shared Components Needed

Before building the screen, we need:

1. **Button** - "Next", "Skip", "Get Started" buttons
   - Variants: primary, text
   - States: default, pressed, disabled
   
2. **Card** - Preference selection cards
   - Optional: icon, title, description
   
3. **Chip** - Duration and goal selectors
   - States: selected, unselected
   - Sizes: small, medium
   
4. **ProgressDots** - Carousel page indicator
   - Count prop
   - Active index prop

**Question for user:**
"Should I create these shared components first, or do they already exist 
in src/shared/components/?"

### Phase 2: Create Feature-Specific Hooks

**src/features/onboarding/hooks/useOnboarding.ts**
```typescript
interface UseOnboardingReturn {
  currentSlide: number;
  preferences: OnboardingData;
  goNext: () => void;
  goPrev: () => void;
  updatePreference: (key: string, value: any) => void;
  canProceed: boolean;
  complete: () => Promise<void>;
}

export const useOnboarding = (): UseOnboardingReturn => {
  // Business logic here
  // No JSX, no styles
  // Returns data and handlers
};
```

**src/features/onboarding/hooks/useTimezoneDetection.ts**
```typescript
export const useTimezoneDetection = () => {
  const [timezone, setTimezone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Auto-detect timezone
  }, []);
  
  return { timezone, loading, setTimezone };
};
```

### Phase 3: Create Feature-Specific Components

**src/features/onboarding/components/OnboardingSlide.tsx**
```typescript
interface OnboardingSlideProps {
  image: ImageSourcePropType;
  title: string;
  description: string;
  children?: ReactNode; // For interactive elements
}

/**
 * Presentational component for a single onboarding slide.
 * Receives all data via props, no internal state or logic.
 */
export const OnboardingSlide = ({ 
  image, 
  title, 
  description,
  children 
}: OnboardingSlideProps) => (
  <View style={styles.container}>
    <Image source={image} style={styles.image} />
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    {children}
  </View>
);
```

**src/features/onboarding/components/PreferenceSelector.tsx**
```typescript
interface PreferenceSelectorProps {
  label: string;
  value: any;
  options: Array<{ label: string; value: any }>;
  onChange: (value: any) => void;
}

/**
 * Reusable preference selector using shared Chip component.
 * Can be used for duration, goal, or any multi-choice setting.
 */
export const PreferenceSelector = ({ 
  label, 
  value, 
  options, 
  onChange 
}: PreferenceSelectorProps) => (
  <Card>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.optionsRow}>
      {options.map(option => (
        <Chip
          key={option.value}
          label={option.label}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  </Card>
);
```

### Phase 4: Compose Screen

**src/features/onboarding/screens/OnboardingScreen.tsx**
```typescript
/**
 * Onboarding Screen - Container Component
 * 
 * Responsibilities:
 * - Orchestrate data flow from hooks
 * - Handle navigation
 * - Compose presentational components
 * 
 * Does NOT:
 * - Contain business logic (in hooks)
 * - Define reusable UI (in components)
 * - Make direct storage calls (in services)
 */
const OnboardingScreen = ({ navigation }: Props) => {
  // Hooks (business logic)
  const onboarding = useOnboarding();
  const { timezone, loading: tzLoading } = useTimezoneDetection();
  
  // Local UI state
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  
  // Handlers (orchestration only)
  const handleComplete = async () => {
    await onboarding.complete();
    navigation.replace('MainApp');
  };
  
  const handleSkip = () => {
    setShowSkipConfirm(true);
  };
  
  // Render
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        pagingEnabled
        data={slides}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            image={item.image}
            title={item.title}
            description={item.description}
          >
            {index === 2 && (
              <>
                <PreferenceSelector
                  label="Work Duration"
                  value={onboarding.preferences.workDuration}
                  options={DURATION_OPTIONS}
                  onChange={(v) => onboarding.updatePreference('workDuration', v)}
                />
                <PreferenceSelector
                  label="Daily Goal"
                  value={onboarding.preferences.dailyGoal}
                  options={GOAL_OPTIONS}
                  onChange={(v) => onboarding.updatePreference('dailyGoal', v)}
                />
              </>
            )}
          </OnboardingSlide>
        )}
      />
      
      <View style={styles.footer}>
        <ProgressDots 
          count={slides.length} 
          activeIndex={onboarding.currentSlide} 
        />
        
        <Button
          variant="primary"
          onPress={onboarding.currentSlide === slides.length - 1 
            ? handleComplete 
            : onboarding.goNext
          }
          disabled={!onboarding.canProceed}
        >
          {onboarding.currentSlide === slides.length - 1 
            ? 'Get Started' 
            : 'Next'
          }
        </Button>
        
        {onboarding.currentSlide < slides.length - 1 && (
          <Button variant="text" onPress={handleSkip}>
            Skip
          </Button>
        )}
      </View>
      
      {showSkipConfirm && (
        <Modal
          title="Skip onboarding?"
          description="You can customize preferences later in Settings"
          onConfirm={() => {
            onboarding.complete();
            navigation.replace('MainApp');
          }}
          onCancel={() => setShowSkipConfirm(false)}
        />
      )}
    </View>
  );
};
```

### Phase 5: Human-in-the-Loop Review

After generating, ask user:

```
Onboarding screen complete! Review points:

REUSABILITY:
✓ OnboardingSlide - Could be used for app tours in future?
✓ PreferenceSelector - Already useful in Settings screen
  
IMPROVEMENTS:
1. Should I add animation between slides? (react-native-reanimated)
2. Should timezone selector be a bottom sheet instead of inline?
3. Should I add analytics tracking for which slide users skip from?

STATE MANAGEMENT:
- Preferences stored in local state until completion (correct?)
- Could derive 'canProceed' from preferences automatically?

TESTING:
- useOnboarding hook is testable independently
- PreferenceSelector can be tested in isolation
- Want me to create test cases?

What would you like me to adjust or improve?
```

---

Continue this pattern for ALL screens...
```

---

## SHARED COMPONENTS LIBRARY PROMPT

```
Before generating any screens, create the Pomodoom Shared Component Library.

## COMPONENTS TO CREATE

### 1. Button Component

**File:** `src/shared/components/Button/`

**Requirements:**
- Variants: primary, secondary, outline, text, danger
- Sizes: small, medium, large
- States: default, pressed, disabled, loading
- Optional: icon (left/right), full width
- Haptic feedback on press
- Accessibility: role="button", accessibilityState

**API:**
```typescript
interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}
```

**Usage:**
```tsx
<Button variant="primary" size="large" onPress={handleStart}>
  Start Session
</Button>

<Button variant="outline" icon={<Icon name="refresh" />} onPress={handleReset}>
  Reset
</Button>
```

---

### 2. Card Component

**File:** `src/shared/components/Card/`

**Requirements:**
- Optional header with title and subtitle
- Optional footer with actions
- Padding variants: none, small, medium, large
- Optional shadow/elevation
- Optional onPress (makes whole card tappable)

**API:**
```typescript
interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  elevation?: number;
  onPress?: () => void;
}
```

---

### 3. Chip Component

**File:** `src/shared/components/Chip/`

**Requirements:**
- Selected/unselected states
- Optional icon
- Disabled state
- Haptic feedback
- Sizes: small, medium

**API:**
```typescript
interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  size?: 'small' | 'medium';
}
```

---

### 4. Text Component

**File:** `src/shared/components/Text/`

**Requirements:**
- Variants: h1, h2, h3, body, caption, label
- Optional: color, weight, align props
- Inherits theme typography

**API:**
```typescript
interface TextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  weight?: 'normal' | 'medium' | 'bold';
  align?: 'left' | 'center' | 'right';
}
```

---

### 5. ProgressRing Component

**File:** `src/shared/components/ProgressRing/`

**Requirements:**
- Animated circular progress
- Configurable size, stroke width, colors
- Optional center content (time, percentage)
- Smooth animations

**API:**
```typescript
interface ProgressRingProps {
  progress: number; // 0-1
  size: number;
  strokeWidth: number;
  color?: string;
  backgroundColor?: string;
  children?: ReactNode;
}
```

---

### 6. Modal Component

**File:** `src/shared/components/Modal/`

**Requirements:**
- Variants: bottom sheet, full screen, alert
- Optional: title, description, actions
- Backdrop dismiss (configurable)
- Animated entrance/exit

**API:**
```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  variant?: 'bottomSheet' | 'fullScreen' | 'alert';
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: Array<{ label: string; onPress: () => void; variant?: ButtonVariant }>;
}
```

---

### 7. EmptyState Component

**File:** `src/shared/components/EmptyState/`

**Requirements:**
- Image/icon
- Title and description
- Optional action button
- Centered layout

**API:**
```typescript
interface EmptyStateProps {
  image: ImageSourcePropType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

---

### 8. Switch Component

**File:** `src/shared/components/Switch/`

**Requirements:**
- Label (optional)
- Description (optional)
- Disabled state
- Haptic feedback

**API:**
```typescript
interface SwitchProps {
  label?: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}
```

---

## GENERATION ORDER

1. Create Button first (most widely used)
2. Create Text (used in almost everything)
3. Create Card (container for other components)
4. Create Chip (used in multiple screens)
5. Create remaining components

## QUALITY STANDARDS

Each component must:
✅ Be fully typed (TypeScript strict mode)
✅ Have JSDoc comments
✅ Include usage examples
✅ Support accessibility
✅ Be responsive (work on all screen sizes)
✅ Use theme values (colors, spacing, typography)
✅ Have proper file structure (component, styles, types, index)

## FILE STRUCTURE TEMPLATE

```
Button/
├── Button.tsx          # Component implementation
├── Button.styles.ts    # StyleSheet
├── Button.types.ts     # TypeScript interfaces
├── Button.test.tsx     # Unit tests (optional)
└── index.ts            # Export
```

Generate each component following this structure, then ask for review before proceeding to the next.
```

---

## KEY IMPROVEMENTS IN THESE PROMPTS

### ✅ Reusability
- **Before:** Inline UI patterns repeated across screens
- **After:** Extract shared components first, compose screens from them

### ✅ State Management
- **Before:** Mixed useState, context, and direct storage in components
- **After:** Clear separation (hooks for logic, context for global, useState for UI)

### ✅ Folder Structure
- **Before:** Vague guidance
- **After:** Strict rules with examples, enforced separation

### ✅ Human-in-the-Loop
- **Before:** Generate and move on
- **After:** Generate → Ask for improvements → Iterate → Document patterns

---

## EXAMPLE: Architecture-First Workflow

```
USER: "Create the Home Timer Screen"

AI: "Before I create the screen, let's ensure we have the building blocks:

SHARED COMPONENTS NEEDED:
1. Button - Does it exist? If not, I'll create it first.
2. ProgressRing - For the circular timer. Create?
3. Chip - For duration selector. Create?
4. Card - For stats display. Create?

HOOKS NEEDED:
1. useTimer - Countdown logic
2. useSession - Session management  
3. useSettings - User preferences

Which components already exist? I'll create missing ones first, 
then compose the screen."

USER: "Button and Card exist. Create ProgressRing and Chip first."

AI: [Creates ProgressRing]

"ProgressRing component created. Review points:

REUSABILITY:
- Can be used in: Home screen, Statistics (mini), Session Summary
- Size and colors configurable via props
- Children prop allows custom center content

IMPROVEMENTS:
1. Add animation easing customization?
2. Support gradient colors?
3. Add glow effect for active state?

What's your preference?"

USER: "Looks good, maybe add gradient support later. Continue with Chip."

AI: [Creates Chip component, then asks similar questions]

AI: "All components ready. Now creating useTimer hook..."

[Continues iteratively]
```

---

Would you like me to:

1. **Generate the complete shared components library** with this clean architecture?
2. **Regenerate one of the screens** (e.g., Home Timer) using the architecture-first approach?
3. **Create a detailed example** showing before/after of a messy vs. clean component?

This approach ensures **maintainable, scalable, and reusable** code from the start! 

Never generate files longer than 300 lines.
If a file exceeds 300 lines, suggest refactoring into smaller components or hooks.


