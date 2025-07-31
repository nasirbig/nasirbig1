import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useData } from '../context/DataContext';
import Card from '../components/Card';
import Calendar from '../components/Calendar';

const screenWidth = Dimensions.get('window').width;

type TimePeriod = 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days';

export default function ProgressScreen() {
  const { data } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Last 30 Days');
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [selectedWeightPoint, setSelectedWeightPoint] = useState<{ date: string; weight: number } | null>(null);
  const [showWeightModal, setShowWeightModal] = useState(false);

  const periods: TimePeriod[] = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];

  const getFilteredWeightData = () => {
    const now = new Date();
    const days = selectedPeriod === 'Last 7 Days' ? 7 : selectedPeriod === 'Last 30 Days' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return data.bodyWeights
      .filter(weight => new Date(weight.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getChartData = () => {
    const filteredData = getFilteredWeightData();
    
    if (filteredData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // If we have only one data point, duplicate it to show a line
    if (filteredData.length === 1) {
      return {
        labels: [
          formatDateForChart(filteredData[0].date),
          formatDateForChart(filteredData[0].date)
        ],
        datasets: [{
          data: [filteredData[0].weight, filteredData[0].weight],
          strokeWidth: 3,
        }]
      };
    }

    return {
      labels: filteredData.map(item => formatDateForChart(item.date)),
      datasets: [{
        data: filteredData.map(item => item.weight),
        strokeWidth: 3,
      }]
    };
  };

  const formatDateForChart = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeightCalendarData = () => {
    const calendarData: { [date: string]: boolean } = {};
    data.bodyWeights.forEach(weight => {
      calendarData[weight.date] = true;
    });
    return calendarData;
  };

  const handleCalendarDatePress = (date: string) => {
    const weightEntry = data.bodyWeights.find(w => w.date === date);
    if (weightEntry) {
      setSelectedWeightPoint({ date, weight: weightEntry.weight });
      setShowWeightModal(true);
    }
  };

  const getTodaysWeight = () => {
    const today = new Date().toISOString().split('T')[0];
    return data.bodyWeights.find(w => w.date === today);
  };

  const getWeightTrend = () => {
    const filteredData = getFilteredWeightData();
    if (filteredData.length < 2) return null;
    
    const firstWeight = filteredData[0].weight;
    const lastWeight = filteredData[filteredData.length - 1].weight;
    const change = lastWeight - firstWeight;
    
    return {
      change: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs((change / firstWeight) * 100)
    };
  };

  const chartData = getChartData();
  const todaysWeight = getTodaysWeight();
  const weightTrend = getWeightTrend();

  const chartConfig = {
    backgroundColor: '#374151',
    backgroundGradientFrom: '#374151',
    backgroundGradientTo: '#4B5563',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#8B5CF6',
      fill: '#FFFFFF'
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#6B7280',
      strokeDasharray: '5,5'
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Period Selector */}
        <Card>
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Progress</Text>
            <TouchableOpacity 
              style={styles.periodSelector}
              onPress={() => setShowPeriodModal(true)}
            >
              <Text style={styles.periodText}>{selectedPeriod}</Text>
              <Ionicons name="chevron-down" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Weight Trend Summary */}
        {weightTrend && (
          <Card>
            <View style={styles.trendSection}>
              <Text style={styles.trendTitle}>Weight Trend</Text>
              <View style={styles.trendInfo}>
                <Ionicons 
                  name={weightTrend.direction === 'up' ? 'trending-up' : weightTrend.direction === 'down' ? 'trending-down' : 'remove'} 
                  size={24} 
                  color={weightTrend.direction === 'up' ? '#EF4444' : weightTrend.direction === 'down' ? '#10B981' : '#6B7280'} 
                />
                <View style={styles.trendDetails}>
                  <Text style={[styles.trendChange, { 
                    color: weightTrend.direction === 'up' ? '#EF4444' : weightTrend.direction === 'down' ? '#10B981' : '#6B7280' 
                  }]}>
                    {weightTrend.direction === 'up' ? '+' : weightTrend.direction === 'down' ? '-' : ''}
                    {weightTrend.change.toFixed(1)} {data.settings.weightUnit}
                  </Text>
                  <Text style={styles.trendPeriod}>over {selectedPeriod.toLowerCase()}</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Weight Chart */}
        <Card>
          <Text style={styles.chartTitle}>Weight Over Time</Text>
          {getFilteredWeightData().length > 0 ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 64} // padding
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                onDataPointClick={(data) => {
                  const filteredData = getFilteredWeightData();
                  if (filteredData[data.index]) {
                    setSelectedWeightPoint({
                      date: filteredData[data.index].date,
                      weight: filteredData[data.index].weight
                    });
                    setShowWeightModal(true);
                  }
                }}
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="analytics" size={48} color="#6B7280" />
              <Text style={styles.noDataText}>No weight data for this period</Text>
              <Text style={styles.noDataSubtext}>Start tracking your weight to see progress</Text>
            </View>
          )}
        </Card>

        {/* Calendar & Stats */}
        <Card>
          <Text style={styles.sectionTitle}>Weight Tracking Calendar</Text>
          <Calendar 
            data={getWeightCalendarData()} 
            onDatePress={handleCalendarDatePress}
            months={1}
          />
          
          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today's Date</Text>
              <Text style={styles.statValue}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today's Weight</Text>
              <Text style={styles.statValue}>
                {todaysWeight ? `${todaysWeight.weight} ${todaysWeight.unit}` : 'Not recorded'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Additional Stats */}
        <Card>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.additionalStats}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>Total Entries</Text>
              <Text style={styles.statBoxValue}>{data.bodyWeights.length}</Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>This Month</Text>
              <Text style={styles.statBoxValue}>
                {data.bodyWeights.filter(w => {
                  const date = new Date(w.date);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </Text>
            </View>
            
            <View style={styles.statBox}>
              <Text style={styles.statBoxLabel}>Workouts</Text>
              <Text style={styles.statBoxValue}>{data.workouts.length}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Period Selection Modal */}
      <Modal visible={showPeriodModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Time Period</Text>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodOption,
                  selectedPeriod === period && styles.selectedPeriodOption
                ]}
                onPress={() => {
                  setSelectedPeriod(period);
                  setShowPeriodModal(false);
                }}
              >
                <Text style={[
                  styles.periodOptionText,
                  selectedPeriod === period && styles.selectedPeriodOptionText
                ]}>
                  {period}
                </Text>
                {selectedPeriod === period && (
                  <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowPeriodModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Weight Detail Modal */}
      <Modal visible={showWeightModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedWeightPoint && (
              <>
                <Text style={styles.modalTitle}>Weight Entry</Text>
                <Text style={styles.weightModalDate}>
                  {new Date(selectedWeightPoint.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <View style={styles.weightDisplay}>
                  <Text style={styles.weightValue}>
                    {selectedWeightPoint.weight} {data.settings.weightUnit}
                  </Text>
                </View>
              </>
            )}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowWeightModal(false)}
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
  scrollView: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B5563',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  trendSection: {
    alignItems: 'center',
  },
  trendTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  trendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendDetails: {
    marginLeft: 12,
    alignItems: 'center',
  },
  trendChange: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendPeriod: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noDataSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statBoxLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  statBoxValue: {
    color: '#8B5CF6',
    fontSize: 24,
    fontWeight: 'bold',
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
    maxHeight: '70%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  periodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#4B5563',
  },
  selectedPeriodOption: {
    backgroundColor: '#8B5CF620',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  periodOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedPeriodOptionText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  weightModalDate: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  weightDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  weightValue: {
    color: '#8B5CF6',
    fontSize: 32,
    fontWeight: 'bold',
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