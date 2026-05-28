package com.habittracker.service;

import com.habittracker.dto.*;
import com.habittracker.entity.Habit;
import com.habittracker.entity.HabitRecord;
import com.habittracker.entity.User;
import com.habittracker.repository.HabitRecordRepository;
import com.habittracker.repository.HabitRepository;
import com.habittracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitRecordRepository habitRecordRepository;
    private final UserRepository userRepository;

    public List<HabitResponse> getHabits(Long userId) {
        return habitRepository.findByUserIdOrderBySortOrderAsc(userId).stream()
                .map(this::toHabitResponse)
                .collect(Collectors.toList());
    }

    public HabitResponse createHabit(Long userId, HabitRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Habit habit = Habit.builder()
                .title(request.getTitle())
                .color(request.getColor())
                .icon(request.getIcon())
                .frequency(request.getFrequency())
                .sortOrder(request.getSortOrder())
                .user(user)
                .build();

        habit = habitRepository.save(habit);
        return toHabitResponse(habit);
    }

    public HabitResponse updateHabit(Long userId, Long habitId, HabitRequest request) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        habit.setTitle(request.getTitle());
        habit.setColor(request.getColor());
        habit.setIcon(request.getIcon());
        habit.setFrequency(request.getFrequency());
        habit.setSortOrder(request.getSortOrder());

        habit = habitRepository.save(habit);
        return toHabitResponse(habit);
    }

    public void deleteHabit(Long userId, Long habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));
        habitRepository.delete(habit);
    }

    @Transactional
    public HabitRecordResponse toggleHabit(Long userId, Long habitId, LocalDate date) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        Optional<HabitRecord> existingRecord = habitRecordRepository.findByHabitIdAndDate(habitId, date);

        HabitRecord record;
        if (existingRecord.isPresent()) {
            record = existingRecord.get();
            record.setCompleted(!record.getCompleted());
        } else {
            record = HabitRecord.builder()
                    .habit(habit)
                    .date(date)
                    .completed(true)
                    .build();
        }

        record = habitRecordRepository.save(record);

        return HabitRecordResponse.builder()
                .habitId(habitId)
                .date(date)
                .completed(record.getCompleted())
                .note(record.getNote())
                .build();
    }

    @Transactional
    public HabitRecordResponse addNote(Long userId, Long habitId, LocalDate date, String note) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new RuntimeException("Habit not found"));

        Optional<HabitRecord> existingRecord = habitRecordRepository.findByHabitIdAndDate(habitId, date);

        HabitRecord record;
        if (existingRecord.isPresent()) {
            record = existingRecord.get();
        } else {
            record = HabitRecord.builder()
                    .habit(habit)
                    .date(date)
                    .completed(false)
                    .build();
        }
        record.setNote(note);
        record = habitRecordRepository.save(record);

        return HabitRecordResponse.builder()
                .habitId(habitId)
                .date(date)
                .completed(record.getCompleted())
                .note(record.getNote())
                .build();
    }

    public MonthlyHabitData getMonthlyData(Long userId, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Habit> habits = habitRepository.findByUserIdOrderBySortOrderAsc(userId);
        List<HabitRecord> records = habitRecordRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        // Build records map: habitId -> {day -> completed}
        Map<Long, Map<Integer, Boolean>> recordsMap = new HashMap<>();
        Map<Long, Map<Integer, String>> notesMap = new HashMap<>();
        for (Habit habit : habits) {
            recordsMap.put(habit.getId(), new HashMap<>());
            notesMap.put(habit.getId(), new HashMap<>());
        }
        for (HabitRecord record : records) {
            Map<Integer, Boolean> dayMap = recordsMap.computeIfAbsent(record.getHabit().getId(), k -> new HashMap<>());
            dayMap.put(record.getDate().getDayOfMonth(), record.getCompleted());

            if (record.getNote() != null && !record.getNote().isEmpty()) {
                Map<Integer, String> noteMap = notesMap.computeIfAbsent(record.getHabit().getId(), k -> new HashMap<>());
                noteMap.put(record.getDate().getDayOfMonth(), record.getNote());
            }
        }

        return MonthlyHabitData.builder()
                .month(month)
                .year(year)
                .totalDays(yearMonth.lengthOfMonth())
                .habits(habits.stream().map(this::toHabitResponse).collect(Collectors.toList()))
                .records(recordsMap)
                .notes(notesMap)
                .build();
    }

    public StatisticsResponse getStatistics(Long userId, int month, int year) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        int totalDays = yearMonth.lengthOfMonth();

        List<Habit> habits = habitRepository.findByUserIdOrderBySortOrderAsc(userId);
        List<HabitRecord> records = habitRecordRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        int totalHabits = habits.size();

        // Daily stats
        List<StatisticsResponse.DailyStats> dailyStats = new ArrayList<>();
        Map<Integer, Double> dailyCompletionRates = new HashMap<>();

        for (int day = 1; day <= totalDays; day++) {
            final int currentDay = day;
            long completedCount = records.stream()
                    .filter(r -> r.getDate().getDayOfMonth() == currentDay && r.getCompleted())
                    .count();
            int incomplete = totalHabits - (int) completedCount;
            double percentage = totalHabits > 0 ? (completedCount * 100.0 / totalHabits) : 0;

            dailyStats.add(StatisticsResponse.DailyStats.builder()
                    .day(day)
                    .completed((int) completedCount)
                    .incomplete(Math.max(0, incomplete))
                    .percentage(Math.round(percentage * 100.0) / 100.0)
                    .build());

            dailyCompletionRates.put(day, Math.round(percentage * 100.0) / 100.0);
        }

        // Weekly completion rates
        Map<Integer, Double> weeklyCompletionRates = new HashMap<>();
        for (int week = 1; week <= 5; week++) {
            int weekStart = (week - 1) * 7 + 1;
            int weekEnd = Math.min(week * 7, totalDays);
            double weekTotal = 0;
            int weekDays = 0;
            for (int day = weekStart; day <= weekEnd; day++) {
                weekTotal += dailyCompletionRates.getOrDefault(day, 0.0);
                weekDays++;
            }
            if (weekDays > 0) {
                weeklyCompletionRates.put(week, Math.round((weekTotal / weekDays) * 100.0) / 100.0);
            }
        }

        // Monthly completion rate
        long totalCompleted = records.stream().filter(HabitRecord::getCompleted).count();
        long totalPossible = (long) totalHabits * totalDays;
        double monthlyRate = totalPossible > 0 ? (totalCompleted * 100.0 / totalPossible) : 0;

        // Habit streaks
        Map<Long, Integer> habitStreaks = new HashMap<>();
        for (Habit habit : habits) {
            habitStreaks.put(habit.getId(), calculateStreak(habit.getId()));
        }

        return StatisticsResponse.builder()
                .totalHabits(totalHabits)
                .monthlyCompletionRate(Math.round(monthlyRate * 100.0) / 100.0)
                .dailyCompletionRates(dailyCompletionRates)
                .weeklyCompletionRates(weeklyCompletionRates)
                .habitStreaks(habitStreaks)
                .dailyStats(dailyStats)
                .build();
    }

    private int calculateStreak(Long habitId) {
        List<HabitRecord> completedRecords = habitRecordRepository.findCompletedByHabitIdOrderByDateDesc(habitId);
        if (completedRecords.isEmpty()) return 0;

        int streak = 0;
        LocalDate expectedDate = LocalDate.now();

        for (HabitRecord record : completedRecords) {
            if (record.getDate().equals(expectedDate)) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else if (record.getDate().equals(expectedDate.minusDays(1)) && streak == 0) {
                // Allow starting from yesterday
                expectedDate = record.getDate();
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    private HabitResponse toHabitResponse(Habit habit) {
        return HabitResponse.builder()
                .id(habit.getId())
                .title(habit.getTitle())
                .color(habit.getColor())
                .icon(habit.getIcon())
                .frequency(habit.getFrequency())
                .sortOrder(habit.getSortOrder())
                .build();
    }
}
