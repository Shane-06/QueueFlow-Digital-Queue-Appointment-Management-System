package com.queueflow.controller;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.security.Actor;
import com.queueflow.service.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;
@Controller @RequestMapping("/student")
public class StudentController {
    private final Store db;private final Actor actor;private final SchedulingService schedule;private final AppointmentService appointments;
    public StudentController(Store db,Actor actor,SchedulingService schedule,AppointmentService appointments){this.db=db;this.actor=actor;this.schedule=schedule;this.appointments=appointments;}
    private void model(Model m){m.addAttribute("account",actor.require("STUDENT"));m.addAttribute("services",db.all(ServiceOffering.class));m.addAttribute("today",schedule.today());}
    @GetMapping("/services") public String services(Model m){model(m);return "services";}
    @GetMapping("/appointments/new")public String bookPage(@RequestParam Long serviceId,@RequestParam(required=false)LocalDate date,@RequestParam(required=false)Long rescheduleId,Model m){model(m);date=date==null?schedule.today():date;List<AppointmentSlot> slots=schedule.slots(serviceId,date);Map<Long,Long> remaining=new HashMap<>();for(var s:slots)remaining.put(s.id,s.capacity-schedule.booked(s.id));m.addAttribute("slots",slots);m.addAttribute("remaining",remaining);m.addAttribute("service",db.get(ServiceOffering.class,serviceId));m.addAttribute("date",date);m.addAttribute("rescheduleId",rescheduleId);return "booking";}
    @GetMapping({"/appointments","/history"})public String appointments(Model m){model(m);m.addAttribute("appointments",db.list(Appointment.class,"from Appointment where userId=?1 order by day desc,id desc",actor.current().id));m.addAttribute("slots",db.all(AppointmentSlot.class));return "appointments";}
    @PostMapping("/appointments")public String book(@RequestParam Long slotId){appointments.book(slotId);return "redirect:/student/appointments";}
    @PostMapping("/appointments/{id}/cancel")public String cancel(@PathVariable Long id){appointments.cancel(id);return "redirect:/student/appointments";}
    @PostMapping("/appointments/{id}/reschedule")public String reschedule(@PathVariable Long id,@RequestParam Long slotId){appointments.reschedule(id,slotId);return "redirect:/student/appointments";}
    @PostMapping("/appointments/{id}/check-in")public String checkIn(@PathVariable Long id){appointments.checkIn(id);return "redirect:/student/queue";}
}
