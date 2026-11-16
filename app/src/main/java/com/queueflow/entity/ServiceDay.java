package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "service_days")
public class ServiceDay {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long serviceId;
    public LocalDate day;
    public int nextToken = 1;
    public boolean closed = false;
}

