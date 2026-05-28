package com.habittracker.controller;

import com.habittracker.dto.*;
import com.habittracker.entity.User;
import com.habittracker.repository.UserRepository;
import com.habittracker.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<HabitResponse>> getHabits(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(habitService.getHabits(userId));
    }

    @PostMapping
    public ResponseEntity<HabitResponse> createHabit(
            Authentication authentication,
            @Valid @RequestBody HabitRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(habitService.createHabit(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitResponse> updateHabit(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody HabitRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(habitService.updateHabit(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = getUserId(authentication);
        habitService.deleteHabit(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<HabitRecordResponse> toggleHabit(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String date) {
        Long userId = getUserId(authentication);
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(habitService.toggleHabit(userId, id, localDate));
    }

    @PostMapping("/{id}/note")
    public ResponseEntity<HabitRecordResponse> addNote(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String date,
            @RequestBody Map<String, String> body) {
        Long userId = getUserId(authentication);
        LocalDate localDate = LocalDate.parse(date);
        String note = body.getOrDefault("note", "");
        return ResponseEntity.ok(habitService.addNote(userId, id, localDate, note));
    }

    @GetMapping("/monthly")
    public ResponseEntity<MonthlyHabitData> getMonthlyData(
            Authentication authentication,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        Long userId = getUserId(authentication);
        YearMonth now = YearMonth.now();
        int m = month != null ? month : now.getMonthValue();
        int y = year != null ? year : now.getYear();
        return ResponseEntity.ok(habitService.getMonthlyData(userId, m, y));
    }

    @GetMapping("/statistics")
    public ResponseEntity<StatisticsResponse> getStatistics(
            Authentication authentication,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        Long userId = getUserId(authentication);
        YearMonth now = YearMonth.now();
        int m = month != null ? month : now.getMonthValue();
        int y = year != null ? year : now.getYear();
        return ResponseEntity.ok(habitService.getStatistics(userId, m, y));
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
