import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CalendarProps {
  data: { [date: string]: boolean }; // date -> hasWorkout
  onDatePress?: (date: string) => void;
  months?: number;
}

export default function Calendar({ data, onDatePress, months = 3 }: CalendarProps) {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1);
  
  const generateCalendarData = () => {
    const monthsData = [];
    
    for (let i = 0; i < months; i++) {
      const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const monthName = currentMonth.toLocaleDateString('en-US', { month: 'short' });
      const year = currentMonth.getFullYear();
      const daysInMonth = new Date(year, currentMonth.getMonth() + 1, 0).getDate();
      const firstDayOfWeek = currentMonth.getDay();
      
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let j = 0; j < firstDayOfWeek; j++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, currentMonth.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        const hasWorkout = data[dateString] || false;
        
        days.push({
          day,
          date: dateString,
          hasWorkout,
          isToday: dateString === today.toISOString().split('T')[0]
        });
      }
      
      monthsData.push({
        monthName,
        days
      });
    }
    
    return monthsData;
  };

  const monthsData = generateCalendarData();

  return (
    <View style={styles.container}>
      {monthsData.map((month, monthIndex) => (
        <View key={monthIndex} style={styles.month}>
          <Text style={styles.monthHeader}>{month.monthName}</Text>
          <View style={styles.weekDays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <Text key={index} style={styles.weekDayHeader}>{day}</Text>
            ))}
          </View>
          <View style={styles.daysGrid}>
            {month.days.map((dayData, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.dayCell,
                  dayData && dayData.hasWorkout && styles.workoutDay,
                  dayData && dayData.isToday && styles.today
                ]}
                onPress={() => dayData && onDatePress && onDatePress(dayData.date)}
                disabled={!dayData}
              >
                <Text style={[
                  styles.dayText,
                  dayData && dayData.hasWorkout && styles.workoutDayText,
                  dayData && dayData.isToday && styles.todayText
                ]}>
                  {dayData ? dayData.day : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  month: {
    flex: 1,
    marginHorizontal: 4,
  },
  monthHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  weekDayHeader: {
    color: '#9CA3AF',
    fontSize: 12,
    width: 20,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 20,
    height: 20,
    margin: 1,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B5563',
  },
  workoutDay: {
    backgroundColor: '#8B5CF6',
  },
  today: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  dayText: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  workoutDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  todayText: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
});