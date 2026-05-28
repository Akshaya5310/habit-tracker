package com.habittracker.repository;

import com.habittracker.entity.HabitRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HabitRecordRepository extends JpaRepository<HabitRecord, Long> {

    Optional<HabitRecord> findByHabitIdAndDate(Long habitId, LocalDate date);

    List<HabitRecord> findByHabitIdAndDateBetween(Long habitId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT hr FROM HabitRecord hr WHERE hr.habit.user.id = :userId AND hr.date BETWEEN :startDate AND :endDate")
    List<HabitRecord> findByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(hr) FROM HabitRecord hr WHERE hr.habit.id = :habitId AND hr.completed = true AND hr.date BETWEEN :startDate AND :endDate")
    long countCompletedByHabitIdAndDateBetween(
            @Param("habitId") Long habitId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT hr FROM HabitRecord hr WHERE hr.habit.id = :habitId AND hr.completed = true ORDER BY hr.date DESC")
    List<HabitRecord> findCompletedByHabitIdOrderByDateDesc(@Param("habitId") Long habitId);
}
