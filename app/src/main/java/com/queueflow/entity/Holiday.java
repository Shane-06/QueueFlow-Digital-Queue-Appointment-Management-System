package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "holidays")
public class Holiday {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long serviceId;
    public LocalDate day;
    public String name;
}

