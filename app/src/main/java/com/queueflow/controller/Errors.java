package com.queueflow.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DataIntegrityViolationException;
@ControllerAdvice
public class Errors {
    @ExceptionHandler({IllegalArgumentException.class,DataIntegrityViolationException.class,org.springframework.dao.InvalidDataAccessApiUsageException.class}) @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String invalid(Exception ex,Model model){model.addAttribute("message",ex instanceof DataIntegrityViolationException?"This change conflicts with an existing record. Review your values and try again.":ex instanceof org.springframework.dao.InvalidDataAccessApiUsageException?"The requested record is unavailable. Return to your dashboard and refresh.":ex.getMessage());return "error";}
}
