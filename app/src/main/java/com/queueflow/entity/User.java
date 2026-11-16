package com.queueflow.entity;

import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String name;
    public String email;
    public String passwordHash;
    public String role;
    public boolean active = true;
    public Long departmentId;
}

