package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "working_hours")
public class WorkingHours {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long serviceId;
    public int dayOfWeek;
    public LocalTime opens;
    public LocalTime closes;
    public LocalTime breakStart;
    public LocalTime breakEnd;
}

