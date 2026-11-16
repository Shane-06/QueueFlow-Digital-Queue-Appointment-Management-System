package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "appointments")
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long userId;
    public Long serviceId;
    public Long slotId;
    public LocalDate day;
    public String reference;
    public String status;
    public Instant createdAt;
    public Instant completedAt;
}

