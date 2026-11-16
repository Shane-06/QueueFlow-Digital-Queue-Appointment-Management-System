package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long actorId;
    public String action;
    public String details;
    public Instant createdAt;
}

