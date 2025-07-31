import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import Card from '../components/Card';
import EditButton from '../components/EditButton';
import { Workout } from '../types';

export default function TrainingLogScreen() {
  const { data } = useData();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  // Sort workouts by date (most recent first)
  const sortedWorkouts = [...data.workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getMuscleGroupsText = (muscleGroups: string[]) => {
    if (muscleGroups.length === 0) return 'Mixed';
    if (muscleGroups.length === 1) return muscleGroups[0];
    if (muscleGroups.length === 2) return muscleGroups.join(' + ');
    return `${muscleGroups[0]} + ${muscleGroups.length - 1} more`;
  };

  const handleWorkoutPress = (workout: Workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

  const getCompletionStatus = (workout: Workout) => {
    if (workout.exercises.length === 0) return { text: 'No exercises', color: '#6B7280' };
    
    const completed = workout.exercises.filter(ex => ex.completed).length;
    const total = workout.exercises.length;
    
    if (completed === total) {
      return { text: 'Completed', color: '#10B981' };
    } else if (completed > 0) {
      return { text: `${completed}/${total} done`, color: '#F59E0B' };
    } else {
      return { text: 'Not started', color: '#EF4444' };
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sortedWorkouts.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Ionicons name="fitness" size={64} color="#6B7280" />
              <Text style={styles.emptyTitle}>No Workouts Yet</Text>
              <Text style={styles.emptyText}>
                Start tracking your workouts and they'll appear here
              </Text>
            </View>
          </Card>
        ) : (
          sortedWorkouts.map((workout, index) => {
            const completionStatus = getCompletionStatus(workout);
            const stepsForDay = data.steps.find(s => s.date === workout.date);
            
            return (
              <Card key={workout.id}>
                <TouchableOpacity
                  style={styles.workoutCard}
                  onPress={() => handleWorkoutPress(workout)}
                >
                  <View style={styles.workoutHeader}>
                    <View style={styles.dateContainer}>
                      <Text style={styles.dateNumber}>{getShortDate(workout.date)}</Text>
                      <Text style={styles.dateYear}>
                        {new Date(workout.date).getFullYear()}
                      </Text>
                    </View>
                    
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutTitle}>{workout.dayName}</Text>
                      <Text style={styles.muscleGroups}>
                        {getMuscleGroupsText(workout.muscleGroups)}
                      </Text>
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: completionStatus.color }]} />
                        <Text style={[styles.statusText, { color: completionStatus.color }]}>
                          {completionStatus.text}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.workoutActions}>
                      <EditButton onPress={() => handleWorkoutPress(workout)} />
                      <Ionicons name="chevron-forward" size={20} color="#8B5CF6" style={styles.chevron} />
                    </View>
                  </View>

                  {/* Workout preview */}
                  <View style={styles.workoutPreview}>
                    <View style={styles.exerciseCount}>
                      <Ionicons name="barbell" size={16} color="#9CA3AF" />
                      <Text style={styles.exerciseCountText}>
                        {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    
                    {stepsForDay && (
                      <View style={styles.stepsPreview}>
                        <Ionicons name="walk" size={16} color="#9CA3AF" />
                        <Text style={styles.stepsText}>
                          {stepsForDay.steps} steps
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Exercise preview */}
                  {workout.exercises.length > 0 && (
                    <View style={styles.exercisesPreview}>
                      {workout.exercises.slice(0, 3).map((exercise, idx) => (
                        <View key={idx} style={styles.exercisePreviewItem}>
                          <Text style={styles.exercisePreviewName}>
                            {exercise.exercise.name}
                          </Text>
                          <Text style={styles.exercisePreviewSets}>
                            {exercise.sets}×{exercise.reps}
                          </Text>
                          {exercise.completed && (
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                          )}
                        </View>
                      ))}
                      {workout.exercises.length > 3 && (
                        <Text style={styles.moreExercises}>
                          +{workout.exercises.length - 3} more
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Workout Details Modal */}
      <Modal visible={showWorkoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedWorkout && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedWorkout.dayName}</Text>
                  <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDate}>
                  {formatDate(selectedWorkout.date)}
                </Text>

                {selectedWorkout.muscleGroups.length > 0 && (
                  <View style={styles.muscleGroupsContainer}>
                    {selectedWorkout.muscleGroups.map((group, index) => (
                      <View key={index} style={styles.muscleGroupTag}>
                        <Text style={styles.muscleGroupTagText}>{group}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <ScrollView style={styles.modalExercisesList}>
                  <Text style={styles.exercisesHeader}>
                    Exercises ({selectedWorkout.exercises.length})
                  </Text>
                  
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <View key={index} style={styles.modalExerciseItem}>
                      <View style={styles.modalExerciseInfo}>
                        <Text style={[
                          styles.modalExerciseName,
                          exercise.completed && styles.modalExerciseNameCompleted
                        ]}>
                          {exercise.exercise.name}
                        </Text>
                        <Text style={styles.modalExerciseDetails}>
                          {exercise.sets} sets × {exercise.reps} reps
                        </Text>
                        {exercise.weight && (
                          <Text style={styles.modalExerciseWeight}>
                            Weight: {exercise.weight} {data.settings.weightUnit}
                          </Text>
                        )}
                      </View>
                      <Ionicons 
                        name={exercise.completed ? "checkmark-circle" : "close-circle"} 
                        size={24} 
                        color={exercise.completed ? "#10B981" : "#EF4444"} 
                      />
                    </View>
                  ))}

                  {/* Steps for the day */}
                  {data.steps.find(s => s.date === selectedWorkout.date) && (
                    <View style={styles.stepsSection}>
                      <Text style={styles.exercisesHeader}>Steps</Text>
                      <View style={styles.stepsContainer}>
                        <Ionicons name="walk" size={24} color="#8B5CF6" />
                        <View style={styles.stepsInfo}>
                          <Text style={styles.stepsCount}>
                            {data.steps.find(s => s.date === selectedWorkout.date)?.steps || 0}
                          </Text>
                          <Text style={styles.stepsTarget}>
                            Target: {data.steps.find(s => s.date === selectedWorkout.date)?.target || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowWorkoutModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  workoutCard: {
    // Card content styling
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  dateNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateYear: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  muscleGroups: {
    color: '#8B5CF6',
    fontSize: 14,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  workoutActions: {
    alignItems: 'center',
  },
  chevron: {
    marginTop: 8,
  },
  workoutPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseCountText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 4,
  },
  stepsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepsText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginLeft: 4,
  },
  exercisesPreview: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    padding: 12,
  },
  exercisePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exercisePreviewName: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  exercisePreviewSets: {
    color: '#9CA3AF',
    fontSize: 12,
    marginRight: 8,
  },
  moreExercises: {
    color: '#8B5CF6',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalDate: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 16,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  muscleGroupTag: {
    backgroundColor: '#8B5CF620',
    borderColor: '#8B5CF6',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  muscleGroupTagText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  modalExercisesList: {
    maxHeight: 400,
  },
  exercisesHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#4B5563',
    borderRadius: 8,
  },
  modalExerciseInfo: {
    flex: 1,
  },
  modalExerciseName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalExerciseNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  modalExerciseDetails: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  modalExerciseWeight: {
    color: '#8B5CF6',
    fontSize: 12,
    marginTop: 2,
  },
  stepsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563',
    borderRadius: 8,
    padding: 16,
  },
  stepsInfo: {
    marginLeft: 12,
  },
  stepsCount: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepsTarget: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});