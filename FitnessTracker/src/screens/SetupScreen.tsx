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
import { Exercise, WorkoutDay } from '../types';

export default function SetupScreen() {
  const {
    data,
    addExercise,
    updateExercise,
    deleteExercise,
    addWorkoutDay,
    updateWorkoutDay,
    deleteWorkoutDay,
  } = useData();

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showWorkoutDayModal, setShowWorkoutDayModal] = useState(false);
  const [showExercisesList, setShowExercisesList] = useState(false);
  const [showEditWorkoutModal, setShowEditWorkoutModal] = useState(false);

  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<WorkoutDay | null>(null);
  const [exerciseFormData, setExerciseFormData] = useState({
    name: '',
    defaultSets: '',
    defaultReps: '',
    muscleGroup: '',
  });

  const [workoutDayFormData, setWorkoutDayFormData] = useState({
    name: '',
    exercises: [] as Array<{ exerciseId: string; sets: number; reps: number }>,
    assignedDays: [] as string[],
  });

  const [expandedWorkoutDays, setExpandedWorkoutDays] = useState<string[]>([]);
  const [tempSets, setTempSets] = useState('');
  const [tempReps, setTempReps] = useState('');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const resetExerciseForm = () => {
    setExerciseFormData({
      name: '',
      defaultSets: '',
      defaultReps: '',
      muscleGroup: '',
    });
  };

  const resetWorkoutDayForm = () => {
    setWorkoutDayFormData({
      name: '',
      exercises: [],
      assignedDays: [],
    });
  };

  const handleSaveExercise = () => {
    if (!exerciseFormData.name.trim()) {
      Alert.alert('Error', 'Please enter exercise name');
      return;
    }

    const sets = parseInt(exerciseFormData.defaultSets) || 3;
    const reps = parseInt(exerciseFormData.defaultReps) || 10;

    addExercise({
      name: exerciseFormData.name.trim(),
      defaultSets: sets,
      defaultReps: reps,
      muscleGroup: exerciseFormData.muscleGroup.trim() || undefined,
    });

    resetExerciseForm();
    setShowExerciseModal(false);
    Alert.alert('Success', 'Exercise added successfully');
  };

  const handleDeleteExercise = (exerciseId: string) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExercise(exerciseId),
        },
      ]
    );
  };

  const handleSaveWorkoutDay = () => {
    if (!workoutDayFormData.name.trim()) {
      Alert.alert('Error', 'Please enter workout name');
      return;
    }

    if (workoutDayFormData.assignedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day');
      return;
    }

    if (selectedWorkoutDay) {
      updateWorkoutDay(selectedWorkoutDay.id, workoutDayFormData);
      Alert.alert('Success', 'Workout day updated successfully');
    } else {
      addWorkoutDay(workoutDayFormData);
      Alert.alert('Success', 'Workout day created successfully');
    }

    resetWorkoutDayForm();
    setSelectedWorkoutDay(null);
    setShowWorkoutDayModal(false);
  };

  const handleEditWorkoutDay = (workoutDay: WorkoutDay) => {
    setSelectedWorkoutDay(workoutDay);
    setWorkoutDayFormData({
      name: workoutDay.name,
      exercises: [...workoutDay.exercises],
      assignedDays: [...workoutDay.assignedDays],
    });
    setShowWorkoutDayModal(true);
  };

  const handleDeleteWorkoutDay = (dayId: string) => {
    Alert.alert(
      'Delete Workout Day',
      'Are you sure you want to delete this workout day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkoutDay(dayId),
        },
      ]
    );
  };

  const toggleWorkoutDayExpansion = (dayId: string) => {
    setExpandedWorkoutDays(prev =>
      prev.includes(dayId)
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const toggleDayAssignment = (day: string) => {
    setWorkoutDayFormData(prev => ({
      ...prev,
      assignedDays: prev.assignedDays.includes(day)
        ? prev.assignedDays.filter(d => d !== day)
        : [...prev.assignedDays, day],
    }));
  };

  const addExerciseToWorkoutDay = (exerciseId: string) => {
    const exercise = data.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const sets = parseInt(tempSets) || exercise.defaultSets;
    const reps = parseInt(tempReps) || exercise.defaultReps;

    setWorkoutDayFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { exerciseId, sets, reps }
      ],
    }));

    setTempSets('');
    setTempReps('');
    setShowEditWorkoutModal(false);
  };

  const removeExerciseFromWorkoutDay = (exerciseId: string) => {
    setWorkoutDayFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.exerciseId !== exerciseId),
    }));
  };

  const getExerciseById = (exerciseId: string) => {
    return data.exercises.find(ex => ex.id === exerciseId);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Exercise List Section */}
        <Card>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowExercisesList(!showExercisesList)}
          >
            <Text style={styles.sectionTitle}>Exercises ({data.exercises.length})</Text>
            <Ionicons
              name={showExercisesList ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#8B5CF6"
            />
          </TouchableOpacity>

          {showExercisesList && (
            <View style={styles.exercisesList}>
              {data.exercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.defaultSets} sets × {exercise.defaultReps} reps
                    </Text>
                    {exercise.muscleGroup && (
                      <Text style={styles.exerciseMuscleGroup}>{exercise.muscleGroup}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteExercise(exercise.id)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowExerciseModal(true)}
          >
            <Ionicons name="add" size={20} color="#8B5CF6" />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>
        </Card>

        {/* Workout Days Section */}
        <Card>
          <Text style={styles.sectionTitle}>Day-wise Routine Setup</Text>
          
          {data.workoutDays.map((workoutDay) => (
            <View key={workoutDay.id} style={styles.workoutDayCard}>
              <TouchableOpacity
                style={styles.workoutDayHeader}
                onPress={() => toggleWorkoutDayExpansion(workoutDay.id)}
              >
                <View style={styles.workoutDayInfo}>
                  <Text style={styles.workoutDayName}>{workoutDay.name}</Text>
                  <Text style={styles.workoutDayDays}>
                    {workoutDay.assignedDays.join(', ')}
                  </Text>
                </View>
                <View style={styles.workoutDayActions}>
                  <TouchableOpacity
                    style={styles.editIconButton}
                    onPress={() => handleEditWorkoutDay(workoutDay)}
                  >
                    <Ionicons name="pencil" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                  <Ionicons
                    name={expandedWorkoutDays.includes(workoutDay.id) ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#8B5CF6"
                  />
                </View>
              </TouchableOpacity>

              {expandedWorkoutDays.includes(workoutDay.id) && (
                <View style={styles.workoutDayDetails}>
                  <Text style={styles.exercisesHeader}>
                    Exercises ({workoutDay.exercises.length})
                  </Text>
                  {workoutDay.exercises.map((exercise, index) => {
                    const exerciseData = getExerciseById(exercise.exerciseId);
                    return (
                      <View key={index} style={styles.workoutExerciseItem}>
                        <Text style={styles.workoutExerciseName}>
                          {exerciseData?.name || 'Unknown Exercise'}
                        </Text>
                        <Text style={styles.workoutExerciseDetails}>
                          {exercise.sets} × {exercise.reps}
                        </Text>
                      </View>
                    );
                  })}
                  
                  <TouchableOpacity
                    style={styles.deleteWorkoutButton}
                    onPress={() => handleDeleteWorkoutDay(workoutDay.id)}
                  >
                    <Text style={styles.deleteWorkoutButtonText}>Delete Workout Day</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetWorkoutDayForm();
              setSelectedWorkoutDay(null);
              setShowWorkoutDayModal(true);
            }}
          >
            <Ionicons name="add" size={20} color="#8B5CF6" />
            <Text style={styles.addButtonText}>Add New Day</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Add Exercise Modal */}
      <Modal visible={showExerciseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Exercise name"
              placeholderTextColor="#9CA3AF"
              value={exerciseFormData.name}
              onChangeText={(text) => setExerciseFormData(prev => ({ ...prev, name: text }))}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Default sets"
              placeholderTextColor="#9CA3AF"
              value={exerciseFormData.defaultSets}
              onChangeText={(text) => setExerciseFormData(prev => ({ ...prev, defaultSets: text }))}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Default reps"
              placeholderTextColor="#9CA3AF"
              value={exerciseFormData.defaultReps}
              onChangeText={(text) => setExerciseFormData(prev => ({ ...prev, defaultReps: text }))}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Muscle group (optional)"
              placeholderTextColor="#9CA3AF"
              value={exerciseFormData.muscleGroup}
              onChangeText={(text) => setExerciseFormData(prev => ({ ...prev, muscleGroup: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveExercise}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetExerciseForm();
                  setShowExerciseModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Workout Day Modal */}
      <Modal visible={showWorkoutDayModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedWorkoutDay ? 'Edit Workout Day' : 'Add Workout Day'}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Workout name (e.g., Push Day)"
              placeholderTextColor="#9CA3AF"
              value={workoutDayFormData.name}
              onChangeText={(text) => setWorkoutDayFormData(prev => ({ ...prev, name: text }))}
            />

            <Text style={styles.sectionSubtitle}>Assign Days</Text>
            <View style={styles.daysGrid}>
              {weekDays.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayChip,
                    workoutDayFormData.assignedDays.includes(day) && styles.selectedDayChip,
                  ]}
                  onPress={() => toggleDayAssignment(day)}
                >
                  <Text style={[
                    styles.dayChipText,
                    workoutDayFormData.assignedDays.includes(day) && styles.selectedDayChipText,
                  ]}>
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionSubtitle}>Exercises</Text>
            <ScrollView style={styles.workoutExercisesList}>
              {workoutDayFormData.exercises.map((exercise, index) => {
                const exerciseData = getExerciseById(exercise.exerciseId);
                return (
                  <View key={index} style={styles.selectedExerciseItem}>
                    <View style={styles.selectedExerciseInfo}>
                      <Text style={styles.selectedExerciseName}>
                        {exerciseData?.name || 'Unknown'}
                      </Text>
                      <Text style={styles.selectedExerciseDetails}>
                        {exercise.sets} sets × {exercise.reps} reps
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeExerciseFromWorkoutDay(exercise.exerciseId)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => setShowEditWorkoutModal(true)}
            >
              <Ionicons name="add" size={16} color="#8B5CF6" />
              <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkoutDay}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetWorkoutDayForm();
                  setSelectedWorkoutDay(null);
                  setShowWorkoutDayModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Exercise to Workout Modal */}
      <Modal visible={showEditWorkoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Exercise to Workout</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Sets"
              placeholderTextColor="#9CA3AF"
              value={tempSets}
              onChangeText={setTempSets}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Reps"
              placeholderTextColor="#9CA3AF"
              value={tempReps}
              onChangeText={setTempReps}
              keyboardType="numeric"
            />

            <ScrollView style={styles.exerciseSelectionList}>
              {data.exercises
                .filter(ex => !workoutDayFormData.exercises.some(we => we.exerciseId === ex.id))
                .map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseSelectionItem}
                    onPress={() => addExerciseToWorkoutDay(exercise.id)}
                  >
                    <View>
                      <Text style={styles.exerciseSelectionName}>{exercise.name}</Text>
                      <Text style={styles.exerciseSelectionDetails}>
                        Default: {exercise.defaultSets} × {exercise.defaultReps}
                      </Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color="#8B5CF6" />
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setTempSets('');
                setTempReps('');
                setShowEditWorkoutModal(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
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
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  exercisesList: {
    marginBottom: 16,
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
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseDetails: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  exerciseMuscleGroup: {
    color: '#8B5CF6',
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#8B5CF620',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  workoutDayCard: {
    marginBottom: 12,
    backgroundColor: '#4B5563',
    borderRadius: 8,
    overflow: 'hidden',
  },
  workoutDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  workoutDayInfo: {
    flex: 1,
  },
  workoutDayName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDayDays: {
    color: '#8B5CF6',
    fontSize: 14,
  },
  workoutDayActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIconButton: {
    padding: 8,
    marginRight: 8,
  },
  workoutDayDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#6B7280',
  },
  exercisesHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  workoutExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 2,
    backgroundColor: '#374151',
    borderRadius: 6,
  },
  workoutExerciseName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workoutExerciseDetails: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  deleteWorkoutButton: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#EF444420',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteWorkoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#4B5563',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6B7280',
  },
  selectedDayChip: {
    backgroundColor: '#8B5CF620',
    borderColor: '#8B5CF6',
  },
  dayChipText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedDayChipText: {
    color: '#8B5CF6',
  },
  workoutExercisesList: {
    maxHeight: 150,
    marginBottom: 16,
  },
  selectedExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 2,
    backgroundColor: '#4B5563',
    borderRadius: 6,
  },
  selectedExerciseInfo: {
    flex: 1,
  },
  selectedExerciseName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedExerciseDetails: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#8B5CF620',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    marginBottom: 16,
  },
  addExerciseButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  exerciseSelectionList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  exerciseSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#4B5563',
    borderRadius: 8,
  },
  exerciseSelectionName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseSelectionDetails: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
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
});