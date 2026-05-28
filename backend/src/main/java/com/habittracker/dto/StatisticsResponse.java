package com.habittracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StatisticsResponse {
    private int totalHabits;
    private double monthlyCompletionRate;
    private Map<Integer, Double> dailyCompletionRates; // day -> percentage
    private Map<Integer, Double> weeklyCompletionRates; // week -> percentage
    private Map<Long, Integer> habitStreaks; // habitId -> streak count
    private List<DailyStats> dailyStats;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyStats {
        private int day;
        private int completed;
        private int incomplete;
        private double percentage;
    }
}
