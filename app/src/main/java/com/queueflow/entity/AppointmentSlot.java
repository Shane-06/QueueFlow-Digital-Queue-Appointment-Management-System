package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "appointment_slots")
public class AppointmentSlot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public Long serviceId;
    public LocalDate day;
    public LocalTime starts;
    public LocalTime ends;
    public int capacity;
}

