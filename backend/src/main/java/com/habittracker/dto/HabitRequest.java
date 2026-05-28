package com.habittracker.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class HabitRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String color;
    private String icon;
    private String frequency = "daily";
    private Integer sortOrder = 0;
}
