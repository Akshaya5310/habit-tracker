package com.habittracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HabitResponse {
    private Long id;
    private String title;
    private String color;
    private String icon;
    private String frequency;
    private Integer sortOrder;
}
