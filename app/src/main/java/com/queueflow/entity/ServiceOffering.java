package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "services")
public class ServiceOffering {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public String code;
    public String description;
    public Long departmentId;
    public boolean active = true;
    public boolean appointmentEnabled = true;
    public boolean walkInEnabled = true;
    public int duration = 15;
    public int slotCapacity = 2;
    public int appointmentCapacity = 40;
    public int walkInCapacity = 40;
}

