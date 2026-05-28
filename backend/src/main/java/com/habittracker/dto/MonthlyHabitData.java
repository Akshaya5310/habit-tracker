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
public class MonthlyHabitData {
    private int month;
    private int year;
    private int totalDays;
    private List<HabitResponse> habits;
    private Map<Long, Map<Integer, Boolean>> records; // habitId -> {day -> completed}
    private Map<Long, Map<Integer, String>> notes; // habitId -> {day -> note}
}
