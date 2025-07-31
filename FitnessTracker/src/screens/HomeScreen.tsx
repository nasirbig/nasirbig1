import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import Card from '../components/Card';
import EditButton from '../components/EditButton';
import ProgressCircle from '../components/ProgressCircle';
import Calendar from '../components/Calendar';
import { Exercise, WorkoutExercise } from '../types';

export default function HomeScreen({ navigation }: any) {
  const {
    data,
    getTodaysWorkout,
    getTodaysSteps,
    getTodaysWeight,
    addWorkout,
    updateWorkout,
    addBodyWeight,
    addSteps,
    updateSettings,
  } = useData();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [showPreviousWorkoutModal, setShowPreviousWorkoutModal] = useState(false);
  
  const [tempWeight, setTempWeight] = useState('');
  const [tempSteps, setTempSteps] = useState('');
  const [tempTarget, setTempTarget] = useState('');

  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
  const fullDate = today.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const todaysWorkout = getTodaysWorkout();
  const todaysSteps = getTodaysSteps();
  const todaysWeight = getTodaysWeight();

  // Get today's workout plan based on day
  const getTodaysWorkoutPlan = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = dayNames[today.getDay()];
    
    return data.workoutDays.find(day => 
      day.assignedDays.includes(todayDayName)
    );
  };

  const workoutPlan = getTodaysWorkoutPlan();

  // Calculate progress
  const calculateProgress = () => {
    if (!todaysWorkout || !todaysWorkout.exercises.length) return 0;
    const completed = todaysWorkout.exercises.filter(ex => ex.completed).length;
    return (completed / todaysWorkout.exercises.length) * 100;
  };

  const progress = calculateProgress();

  // Create today's workout if it doesn't exist
  const createTodaysWorkout = () => {
    if (workoutPlan && !todaysWorkout) {
      const exercises: WorkoutExercise[] = workoutPlan.exercises.map(ex => {
        const exercise = data.exercises.find(e => e.id === ex.exerciseId);
        return {
          exerciseId: ex.exerciseId,
          exercise: exercise!,
          sets: ex.sets,
          reps: ex.reps,
          completed: false,
        };
      });

      addWorkout({
        date: todayString,
        dayName: workoutPlan.name,
        exercises,
        completed: false,
        muscleGroups: [...new Set(exercises.map(ex => ex.exercise.muscleGroup).filter(Boolean))],
      });
    }
  };

  // Get calendar data for workouts
  const getCalendarData = () => {
    const calendarData: { [date: string]: boolean } = {};
    data.workouts.forEach(workout => {
      calendarData[workout.date] = workout.completed;
    });
    return calendarData;
  };

  // Get previous day's workout
  const getPreviousWorkout = () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    return data.workouts.find(w => w.date === yesterdayString);
  };

  const previousWorkout = getPreviousWorkout();

  React.useEffect(() => {
    createTodaysWorkout();
  }, []);

  const handleWorkoutExerciseToggle = (exerciseId: string) => {
    if (!todaysWorkout) return;

    const updatedExercises = todaysWorkout.exercises.map(ex =>
      ex.exerciseId === exerciseId ? { ...ex, completed: !ex.completed } : ex
    );

    const allCompleted = updatedExercises.every(ex => ex.completed);

    updateWorkout(todaysWorkout.id, {
      exercises: updatedExercises,
      completed: allCompleted,
    });
  };

  const handleWeightSave = () => {
    const weight = parseFloat(tempWeight);
    if (weight && weight > 0) {
      addBodyWeight({
        date: todayString,
        weight,
        unit: data.settings.weightUnit,
      });
      setTempWeight('');
      setShowWeightModal(false);
    }
  };

  const handleStepsSave = () => {
    const steps = parseInt(tempSteps);
    const target = parseInt(tempTarget) || data.settings.stepTarget;
    
    if (steps >= 0) {
      addSteps({
        date: todayString,
        steps,
        target,
      });
      if (target !== data.settings.stepTarget) {
        updateSettings({ stepTarget: target });
      }
      setTempSteps('');
      setTempTarget('');
      setShowStepsModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workouts</Text>
        <TouchableOpacity onPress={() => setShowProfileModal(true)}>
          <Ionicons name="person-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Today's Gym Progress */}
        <Card>
          <View style={styles.progressSection}>
            <View style={styles.progressCircleContainer}>
              <ProgressCircle progress={progress}>
                <Text style={styles.progressNumber}>{Math.round(progress)}%</Text>
              </ProgressCircle>
              <EditButton onPress={() => setShowWorkoutModal(true)} style={styles.editButtonSpacing} />
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.exerciseType}>
                {workoutPlan?.name || 'Rest Day'}
              </Text>
              <Text style={styles.dayText}>{dayName}</Text>
            </View>
          </View>
        </Card>

        {/* Body Weight */}
        <Card>
          <View style={styles.weightSection}>
            <View style={styles.weightDisplay}>
              <Text style={styles.weightNumber}>
                {todaysWeight?.weight || 0} {data.settings.weightUnit}
              </Text>
              <EditButton onPress={() => setShowWeightModal(true)} />
            </View>
            <Text style={styles.weightLabel}>Body Weight</Text>
            <Text style={styles.dateText}>{fullDate}</Text>
          </View>
        </Card>

        {/* Workout Calendar */}
        <Card>
          <Calendar 
            data={getCalendarData()} 
            onDatePress={(date) => {
              // Could navigate to specific workout details
            }}
          />
          <TouchableOpacity 
            style={styles.previousWorkoutButton}
            onPress={() => setShowPreviousWorkoutModal(true)}
          >
            <Text style={styles.previousWorkoutText}>Previous Day Workout</Text>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </Card>

        {/* Step Counter */}
        <Card>
          <View style={styles.stepsSection}>
            <View style={styles.stepsDisplay}>
              <Text style={styles.stepsTitle}>Steps ➡️ {todaysSteps?.steps || 0}</Text>
              <EditButton onPress={() => setShowStepsModal(true)} />
            </View>
            <Text style={styles.stepsTarget}>
              Target: {todaysSteps?.target || data.settings.stepTarget}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettingsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                updateSettings({ 
                  weightUnit: data.settings.weightUnit === 'lbs' ? 'kg' : 'lbs' 
                });
              }}
            >
              <Text style={styles.settingText}>
                Weight Unit: {data.settings.weightUnit}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => {
                updateSettings({ 
                  theme: data.settings.theme === 'dark' ? 'light' : 'dark' 
                });
              }}
            >
              <Text style={styles.settingText}>
                Theme: {data.settings.theme}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSettingsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Profile</Text>
            <Text style={styles.profileText}>
              {data.settings.username || 'Fitness Enthusiast'}
            </Text>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert('Logout', 'Are you sure you want to logout?');
              }}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowProfileModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Workout Modal */}
      <Modal visible={showWorkoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Today's Workout</Text>
            {todaysWorkout ? (
              <ScrollView style={styles.exercisesList}>
                {todaysWorkout.exercises.map((exercise, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.exerciseItem,
                      exercise.completed && styles.exerciseCompleted
                    ]}
                    onPress={() => handleWorkoutExerciseToggle(exercise.exerciseId)}
                  >
                    <View style={styles.exerciseInfo}>
                      <Text style={[
                        styles.exerciseName,
                        exercise.completed && styles.exerciseNameCompleted
                      ]}>
                        {exercise.exercise.name}
                      </Text>
                      <Text style={styles.exerciseDetails}>
                        {exercise.sets} sets × {exercise.reps} reps
                      </Text>
                    </View>
                    <Ionicons 
                      name={exercise.completed ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={exercise.completed ? "#10B981" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noWorkoutText}>No workout planned for today</Text>
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowWorkoutModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Weight Modal */}
      <Modal visible={showWeightModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Body Weight</Text>
            <TextInput
              style={styles.input}
              placeholder={`Weight (${data.settings.weightUnit})`}
              placeholderTextColor="#9CA3AF"
              value={tempWeight}
              onChangeText={setTempWeight}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleWeightSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setTempWeight('');
                  setShowWeightModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Steps Modal */}
      <Modal visible={showStepsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Steps</Text>
            <TextInput
              style={styles.input}
              placeholder="Steps taken"
              placeholderTextColor="#9CA3AF"
              value={tempSteps}
              onChangeText={setTempSteps}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={`Target (current: ${data.settings.stepTarget})`}
              placeholderTextColor="#9CA3AF"
              value={tempTarget}
              onChangeText={setTempTarget}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleStepsSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setTempSteps('');
                  setTempTarget('');
                  setShowStepsModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Previous Workout Modal */}
      <Modal visible={showPreviousWorkoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Previous Day Workout</Text>
            {previousWorkout ? (
              <ScrollView style={styles.exercisesList}>
                <Text style={styles.workoutDateText}>
                  {new Date(previousWorkout.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.workoutDayName}>{previousWorkout.dayName}</Text>
                {previousWorkout.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>
                        {exercise.exercise.name}
                      </Text>
                      <Text style={styles.exerciseDetails}>
                        {exercise.sets} sets × {exercise.reps} reps
                      </Text>
                    </View>
                    <Ionicons 
                      name={exercise.completed ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={exercise.completed ? "#10B981" : "#EF4444"} 
                    />
                  </View>
                ))}
                {data.steps.find(s => s.date === previousWorkout.date) && (
                  <View style={styles.stepsInfo}>
                    <Text style={styles.stepsInfoText}>
                      Steps: {data.steps.find(s => s.date === previousWorkout.date)?.steps || 0}
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              <Text style={styles.noWorkoutText}>No workout found for previous day</Text>
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPreviousWorkoutModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressCircleContainer: {
    alignItems: 'center',
  },
  progressNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButtonSpacing: {
    marginTop: 12,
  },
  progressInfo: {
    alignItems: 'center',
  },
  exerciseType: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  weightSection: {
    alignItems: 'center',
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weightNumber: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 16,
  },
  weightLabel: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 4,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  previousWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  previousWorkoutText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  stepsSection: {
    alignItems: 'center',
  },
  stepsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 16,
  },
  stepsTarget: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  settingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  settingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  exercisesList: {
    maxHeight: 300,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#4B5563',
    borderRadius: 8,
  },
  exerciseCompleted: {
    backgroundColor: '#059669',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseNameCompleted: {
    textDecorationLine: 'line-through',
  },
  exerciseDetails: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  noWorkoutText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    backgroundColor: '#4B5563',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  workoutDateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDayName: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepsInfo: {
    backgroundColor: '#4B5563',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  stepsInfoText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});