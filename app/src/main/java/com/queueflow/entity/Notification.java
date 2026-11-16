package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long userId;
    public String message;
    public boolean seen = false;
    public Instant createdAt;
}

