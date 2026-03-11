// Exercise Type System — Go Course
// Data-driven exercise definitions for all 12 modules

export type ExerciseTier =
  | 'completion'      // Tier 1: 70% code given, student completes 30%
  | 'fill-in-blank'   // Tier 2: Strategic blanks in types, calls, conditionals
  | 'debugging'       // Tier 3: Code with 2-3 deliberate bugs + metacognitive prompt
  | 'mini-project'    // Tier 4: Integrates 2-3 concepts, 30-60 min
  | 'open-challenge'; // Tier 5: "Build your own X", capstone-level

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  /** Unique ID, e.g. "m1-ex-001" */
  id: string;
  /** Module this exercise belongs to */
  moduleId: number;
  /** Exercise tier determines UI and pedagogical approach */
  tier: ExerciseTier;
  /** Difficulty level for progressive ordering */
  difficulty: ExerciseDifficulty;
  /** Short title shown in exercise header */
  title: string;
  /** Instructions/description in markdown-like text */
  description: string;
  /** Template code the student starts with */
  baseCode: string;
  /** Complete solution code (revealed on request) */
  solution: string;
  /** Expected output for visual comparison (optional) */
  expectedOutput?: string;
  /** Progressive hints — hint[0] is free, hint[1] penalizes -1 point */
  hints: string[];
  /** For debugging exercises: metacognitive prompt before revealing solution */
  metacognitivePrompt?: string;
  /** Maximum score without penalties */
  points: number;
  /** Concepts this exercise covers (for cross-referencing) */
  concepts: string[];
}

export interface WorkedExampleStep {
  /** Code snippet for this step */
  code: string;
  /** Explanation of what this code does and WHY */
  explanation: string;
  /** Optional highlight — line numbers to emphasize (1-based) */
  highlightLines?: number[];
}

export interface WorkedExample {
  /** Unique ID, e.g. "m1-we-001" */
  id: string;
  /** Module this example belongs to */
  moduleId: number;
  /** Title shown in example header */
  title: string;
  /** Brief description of what we're building/learning */
  description: string;
  /** Step-by-step code reveal with explanations */
  steps: WorkedExampleStep[];
  /** Include a playground at the end for experimentation? */
  playground?: boolean;
  /** If playground is true, the full runnable code */
  playgroundCode?: string;
}

export interface ReviewCard {
  /** Unique ID, e.g. "rc-001" */
  id: string;
  /** Module this concept originates from */
  sourceModuleId: number;
  /** The review question */
  question: string;
  /** Multiple choice options */
  options: ReviewCardOption[];
  /** Difficulty affects Leitner box progression */
  difficulty: 'easy' | 'medium' | 'hard';
  /** Concept being reviewed (for filtering) */
  concept: string;
}

export interface ReviewCardOption {
  text: string;
  correct: boolean;
  explanation: string;
}

// --- State tracking types (used in courseStore) ---

export interface ExerciseProgress {
  /** Whether the exercise was completed */
  completed: boolean;
  /** Number of attempts */
  attempts: number;
  /** Number of hints used (0, 1, or 2) */
  hintsUsed: number;
  /** Score earned (max = exercise.points, penalized by hints/solution reveal) */
  score: number;
  /** ISO timestamp of completion */
  completedAt?: string;
}

/** Leitner box system for spaced repetition */
export type LeitnerBox = 1 | 2 | 3;

export interface LeitnerCardState {
  /** Review card ID */
  cardId: string;
  /** Current Leitner box: 1 (review every module), 2 (every 3), 3 (every 6) */
  box: LeitnerBox;
  /** ISO timestamp of last review */
  lastReviewed?: string;
  /** Module ID where last reviewed */
  lastReviewedAtModule?: number;
  /** Consecutive correct answers */
  correctStreak: number;
}
