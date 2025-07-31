import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, Exercise, Workout, BodyWeightEntry, StepEntry, WorkoutDay, UserSettings } from '../types';

interface DataContextType {
  data: AppData;
  addExercise: (exercise: Omit<Exercise, 'id'>) => void;
  updateExercise: (id: string, exercise: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  addBodyWeight: (weight: Omit<BodyWeightEntry, 'id'>) => void;
  updateBodyWeight: (id: string, weight: Partial<BodyWeightEntry>) => void;
  addSteps: (steps: Omit<StepEntry, 'id'>) => void;
  updateSteps: (id: string, steps: Partial<StepEntry>) => void;
  addWorkoutDay: (day: Omit<WorkoutDay, 'id'>) => void;
  updateWorkoutDay: (id: string, day: Partial<WorkoutDay>) => void;
  deleteWorkoutDay: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  getTodaysWorkout: () => Workout | null;
  getTodaysSteps: () => StepEntry | null;
  getTodaysWeight: () => BodyWeightEntry | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialData: AppData = {
  exercises: [
    { id: '1', name: 'Push-ups', defaultSets: 3, defaultReps: 15, muscleGroup: 'Chest' },
    { id: '2', name: 'Pull-ups', defaultSets: 3, defaultReps: 8, muscleGroup: 'Back' },
    { id: '3', name: 'Squats', defaultSets: 4, defaultReps: 12, muscleGroup: 'Legs' },
    { id: '4', name: 'Bench Press', defaultSets: 4, defaultReps: 10, muscleGroup: 'Chest' },
    { id: '5', name: 'Deadlift', defaultSets: 3, defaultReps: 8, muscleGroup: 'Back' },
  ],
  workouts: [],
  bodyWeights: [
    { id: '1', date: new Date().toISOString().split('T')[0], weight: 192, unit: 'lbs' }
  ],
  steps: [
    { id: '1', date: new Date().toISOString().split('T')[0], steps: 3200, target: 10000 }
  ],
  workoutDays: [
    {
      id: '1',
      name: 'Push Day',
      exercises: [
        { exerciseId: '1', sets: 3, reps: 15 },
        { exerciseId: '4', sets: 4, reps: 10 }
      ],
      assignedDays: ['Monday', 'Thursday']
    },
    {
      id: '2',
      name: 'Pull Day',
      exercises: [
        { exerciseId: '2', sets: 3, reps: 8 },
        { exerciseId: '5', sets: 3, reps: 8 }
      ],
      assignedDays: ['Tuesday', 'Friday']
    },
    {
      id: '3',
      name: 'Leg Day',
      exercises: [
        { exerciseId: '3', sets: 4, reps: 12 }
      ],
      assignedDays: ['Wednesday', 'Saturday']
    }
  ],
  settings: {
    weightUnit: 'lbs',
    theme: 'dark',
    stepTarget: 10000,
    username: 'Fitness Enthusiast'
  }
};

type DataAction = 
  | { type: 'SET_DATA'; payload: AppData }
  | { type: 'ADD_EXERCISE'; payload: Exercise }
  | { type: 'UPDATE_EXERCISE'; payload: { id: string; exercise: Partial<Exercise> } }
  | { type: 'DELETE_EXERCISE'; payload: string }
  | { type: 'ADD_WORKOUT'; payload: Workout }
  | { type: 'UPDATE_WORKOUT'; payload: { id: string; workout: Partial<Workout> } }
  | { type: 'ADD_BODY_WEIGHT'; payload: BodyWeightEntry }
  | { type: 'UPDATE_BODY_WEIGHT'; payload: { id: string; weight: Partial<BodyWeightEntry> } }
  | { type: 'ADD_STEPS'; payload: StepEntry }
  | { type: 'UPDATE_STEPS'; payload: { id: string; steps: Partial<StepEntry> } }
  | { type: 'ADD_WORKOUT_DAY'; payload: WorkoutDay }
  | { type: 'UPDATE_WORKOUT_DAY'; payload: { id: string; day: Partial<WorkoutDay> } }
  | { type: 'DELETE_WORKOUT_DAY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> };

function dataReducer(state: AppData, action: DataAction): AppData {
  switch (action.type) {
    case 'SET_DATA':
      return action.payload;
    case 'ADD_EXERCISE':
      return { ...state, exercises: [...state.exercises, action.payload] };
    case 'UPDATE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.map(ex => 
          ex.id === action.payload.id ? { ...ex, ...action.payload.exercise } : ex
        )
      };
    case 'DELETE_EXERCISE':
      return {
        ...state,
        exercises: state.exercises.filter(ex => ex.id !== action.payload)
      };
    case 'ADD_WORKOUT':
      return { ...state, workouts: [...state.workouts, action.payload] };
    case 'UPDATE_WORKOUT':
      return {
        ...state,
        workouts: state.workouts.map(w => 
          w.id === action.payload.id ? { ...w, ...action.payload.workout } : w
        )
      };
    case 'ADD_BODY_WEIGHT':
      return { ...state, bodyWeights: [...state.bodyWeights, action.payload] };
    case 'UPDATE_BODY_WEIGHT':
      return {
        ...state,
        bodyWeights: state.bodyWeights.map(w => 
          w.id === action.payload.id ? { ...w, ...action.payload.weight } : w
        )
      };
    case 'ADD_STEPS':
      return { ...state, steps: [...state.steps, action.payload] };
    case 'UPDATE_STEPS':
      return {
        ...state,
        steps: state.steps.map(s => 
          s.id === action.payload.id ? { ...s, ...action.payload.steps } : s
        )
      };
    case 'ADD_WORKOUT_DAY':
      return { ...state, workoutDays: [...state.workoutDays, action.payload] };
    case 'UPDATE_WORKOUT_DAY':
      return {
        ...state,
        workoutDays: state.workoutDays.map(d => 
          d.id === action.payload.id ? { ...d, ...action.payload.day } : d
        )
      };
    case 'DELETE_WORKOUT_DAY':
      return {
        ...state,
        workoutDays: state.workoutDays.filter(d => d.id !== action.payload)
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(dataReducer, initialData);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [data]);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('fitnessAppData');
      if (savedData) {
        dispatch({ type: 'SET_DATA', payload: JSON.parse(savedData) });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('fitnessAppData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addExercise = (exercise: Omit<Exercise, 'id'>) => {
    dispatch({ type: 'ADD_EXERCISE', payload: { ...exercise, id: generateId() } });
  };

  const updateExercise = (id: string, exercise: Partial<Exercise>) => {
    dispatch({ type: 'UPDATE_EXERCISE', payload: { id, exercise } });
  };

  const deleteExercise = (id: string) => {
    dispatch({ type: 'DELETE_EXERCISE', payload: id });
  };

  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    dispatch({ type: 'ADD_WORKOUT', payload: { ...workout, id: generateId() } });
  };

  const updateWorkout = (id: string, workout: Partial<Workout>) => {
    dispatch({ type: 'UPDATE_WORKOUT', payload: { id, workout } });
  };

  const addBodyWeight = (weight: Omit<BodyWeightEntry, 'id'>) => {
    const existingEntry = data.bodyWeights.find(w => w.date === weight.date);
    if (existingEntry) {
      updateBodyWeight(existingEntry.id, weight);
    } else {
      dispatch({ type: 'ADD_BODY_WEIGHT', payload: { ...weight, id: generateId() } });
    }
  };

  const updateBodyWeight = (id: string, weight: Partial<BodyWeightEntry>) => {
    dispatch({ type: 'UPDATE_BODY_WEIGHT', payload: { id, weight } });
  };

  const addSteps = (steps: Omit<StepEntry, 'id'>) => {
    const existingEntry = data.steps.find(s => s.date === steps.date);
    if (existingEntry) {
      updateSteps(existingEntry.id, steps);
    } else {
      dispatch({ type: 'ADD_STEPS', payload: { ...steps, id: generateId() } });
    }
  };

  const updateSteps = (id: string, steps: Partial<StepEntry>) => {
    dispatch({ type: 'UPDATE_STEPS', payload: { id, steps } });
  };

  const addWorkoutDay = (day: Omit<WorkoutDay, 'id'>) => {
    dispatch({ type: 'ADD_WORKOUT_DAY', payload: { ...day, id: generateId() } });
  };

  const updateWorkoutDay = (id: string, day: Partial<WorkoutDay>) => {
    dispatch({ type: 'UPDATE_WORKOUT_DAY', payload: { id, day } });
  };

  const deleteWorkoutDay = (id: string) => {
    dispatch({ type: 'DELETE_WORKOUT_DAY', payload: id });
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const getTodaysWorkout = (): Workout | null => {
    const today = new Date().toISOString().split('T')[0];
    return data.workouts.find(w => w.date === today) || null;
  };

  const getTodaysSteps = (): StepEntry | null => {
    const today = new Date().toISOString().split('T')[0];
    return data.steps.find(s => s.date === today) || null;
  };

  const getTodaysWeight = (): BodyWeightEntry | null => {
    const today = new Date().toISOString().split('T')[0];
    return data.bodyWeights.find(w => w.date === today) || null;
  };

  return (
    <DataContext.Provider value={{
      data,
      addExercise,
      updateExercise,
      deleteExercise,
      addWorkout,
      updateWorkout,
      addBodyWeight,
      updateBodyWeight,
      addSteps,
      updateSteps,
      addWorkoutDay,
      updateWorkoutDay,
      deleteWorkoutDay,
      updateSettings,
      getTodaysWorkout,
      getTodaysSteps,
      getTodaysWeight,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}