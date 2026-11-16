package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "counters")
public class Counter {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public String location;
    public boolean active = true;
}

