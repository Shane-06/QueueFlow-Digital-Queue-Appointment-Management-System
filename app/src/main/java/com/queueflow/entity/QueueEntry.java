package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "queue_entries")
public class QueueEntry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long userId;
    public Long serviceId;
    public Long appointmentId;
    public LocalDate day;
    public String token;
    public String status;
    public Long counterId;
    public Long staffId;
    public Instant joinedAt;
    public Instant queuedAt;
    public Instant calledAt;
    public Instant startedAt;
    public Instant completedAt;
    public String reason;
}

