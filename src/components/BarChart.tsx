import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme/colors';

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  barSpacing?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_PADDING = 16;
const CHART_WIDTH = SCREEN_WIDTH - (CHART_PADDING * 2) - 32; // Account for card padding

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 200,
  showValues = true,
  barSpacing = 8,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>لا توجد بيانات</Text>
      </View>
    );
  }

  // Calculate max value if not provided
  const calculatedMaxValue = maxValue || Math.max(...data.map(d => d.value)) * 1.1; // Add 10% padding

  return (
    <View style={[styles.container, { height }]}>
      {/* Y-axis labels */}
      <View style={styles.yAxis}>
        {[100, 75, 50, 25, 0].map((value) => (
          <Text key={value} style={styles.yAxisLabel}>
            {value}%
          </Text>
        ))}
      </View>

      {/* Chart area */}
      <View style={styles.chartArea}>
        {/* Grid lines */}
        <View style={styles.gridContainer}>
          {[0, 1, 2, 3, 4].map((index) => {
            const gridPosition = (index * (height - 40)) / 4;
            return (
              <View
                key={index}
                style={[
                  styles.gridLine,
                  {
                    bottom: gridPosition + 20, // 20px padding for labels
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const barHeight = (item.value / calculatedMaxValue) * (height - 60); // Reserve space for labels
            const barColor = item.color || colors.primary;
            // Calculate bar width - use a reasonable width that scales with number of bars
            const maxBarWidth = 60; // Maximum width per bar
            const minBarWidth = 30; // Minimum width per bar
            const calculatedBarWidth = Math.max(
              minBarWidth,
              Math.min(maxBarWidth, CHART_WIDTH / data.length - barSpacing)
            );
            const barActualWidth = calculatedBarWidth * 0.75; // Use 75% of width for the bar itself

            return (
              <View
                key={index}
                style={[
                  styles.barWrapper,
                  {
                    width: calculatedBarWidth,
                    marginRight: index < data.length - 1 ? barSpacing : 0,
                  },
                ]}
              >
                <View style={styles.barContainer}>
                  {showValues && (
                    <Text style={styles.barValue}>{item.value.toFixed(1)}%</Text>
                  )}
                  <View
                    style={[
                      styles.bar,
                      {
                        width: barActualWidth,
                        height: Math.max(barHeight, 4), // Minimum height for visibility
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingBottom: 20,
  },
  yAxisLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
    paddingBottom: 20,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: '100%',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },
});

