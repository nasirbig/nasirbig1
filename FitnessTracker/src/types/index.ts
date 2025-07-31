export interface Exercise {
  id: string;
  name: string;
  defaultSets: number;
  defaultReps: number;
  muscleGroup?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise: Exercise;
  sets: number;
  reps: number;
  completed: boolean;
  weight?: number;
}

export interface Workout {
  id: string;
  date: string;
  dayName: string;
  exercises: WorkoutExercise[];
  completed: boolean;
  muscleGroups: string[];
}

export interface BodyWeightEntry {
  id: string;
  date: string;
  weight: number;
  unit: 'lbs' | 'kg';
}

export interface StepEntry {
  id: string;
  date: string;
  steps: number;
  target: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: number;
  }>;
  assignedDays: string[]; // ['Monday', 'Wednesday', 'Friday']
}

export interface UserSettings {
  weightUnit: 'lbs' | 'kg';
  theme: 'light' | 'dark';
  stepTarget: number;
  username?: string;
}

export interface AppData {
  exercises: Exercise[];
  workouts: Workout[];
  bodyWeights: BodyWeightEntry[];
  steps: StepEntry[];
  workoutDays: WorkoutDay[];
  settings: UserSettings;
}