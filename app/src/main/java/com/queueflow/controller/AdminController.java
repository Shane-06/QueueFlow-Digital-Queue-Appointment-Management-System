package com.queueflow.controller;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.security.Actor;
import com.queueflow.service.AdminService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.*;

@Controller @RequestMapping("/admin")
public class AdminController {
    @org.springframework.beans.factory.annotation.Autowired private com.queueflow.service.AppointmentService appointments;
    @PostMapping("/appointments/{id}/cancel")public String cancelAppointment(@PathVariable Long id){appointments.cancel(id);return "redirect:/admin/appointments";}
    private final Store db;private final Actor actor;private final AdminService admin;
    public AdminController(Store db,Actor actor,AdminService admin){this.db=db;this.actor=actor;this.admin=admin;}
    @GetMapping({"/services","/counters","/staff","/schedules"})
    public String page(Model m,jakarta.servlet.http.HttpServletRequest request){actor.require("ADMIN");m.addAttribute("account",actor.current());m.addAttribute("page",request.getRequestURI().substring(7));m.addAttribute("services",db.all(ServiceOffering.class));m.addAttribute("counters",db.all(Counter.class));m.addAttribute("users",db.all(User.class));m.addAttribute("hours",db.all(WorkingHours.class));m.addAttribute("holidays",db.all(Holiday.class));m.addAttribute("counterServices",db.sql("select counter_id,service_id from counter_services"));m.addAttribute("counterStaff",db.sql("select counter_id,user_id from staff_counters"));m.addAttribute("newService",new ServiceOffering());m.addAttribute("newUser",new User());m.addAttribute("newCounter",new Counter());m.addAttribute("roles",List.of("STUDENT","STAFF","ADMIN"));return "admin";}
    @PostMapping("/services") public String service(@RequestParam(required=false) Long id,@RequestParam String name,@RequestParam String code,@RequestParam String description,@RequestParam int duration,@RequestParam int slotCapacity,@RequestParam int appointmentCapacity,@RequestParam int walkInCapacity,@RequestParam(defaultValue="false") boolean active,@RequestParam(defaultValue="false") boolean appointments,@RequestParam(defaultValue="false") boolean walkIns){admin.saveService(id,name,code,description,duration,slotCapacity,appointmentCapacity,walkInCapacity,active,appointments,walkIns);return "redirect:/admin/services";}
    @PostMapping("/counters") public String counter(@RequestParam(required=false)Long id,@RequestParam String name,@RequestParam String location,@RequestParam(defaultValue="false")boolean active,@RequestParam(defaultValue="")List<Long> serviceIds,@RequestParam(defaultValue="")List<Long> staffIds){admin.saveCounter(id,name,location,active,serviceIds,staffIds);return "redirect:/admin/counters";}
    @PostMapping("/staff") public String staff(@RequestParam(required=false)Long id,@RequestParam String name,@RequestParam String email,@RequestParam String role,@RequestParam(defaultValue="false")boolean active,@RequestParam(defaultValue="")String password){admin.saveUser(id,name,email,role,active,password);return "redirect:/admin/staff";}
    @PostMapping("/schedules") public String schedule(@RequestParam Long serviceId,@RequestParam int day,@RequestParam LocalTime opens,@RequestParam LocalTime closes,@RequestParam(required=false)LocalTime breakStart,@RequestParam(required=false)LocalTime breakEnd){admin.schedule(serviceId,day,opens,closes,breakStart,breakEnd);return "redirect:/admin/schedules";}
    @PostMapping("/schedules/{id}/remove")public String removeSchedule(@PathVariable Long id){admin.removeSchedule(id);return "redirect:/admin/schedules";}
    @PostMapping("/holidays")public String holiday(@RequestParam Long serviceId,@RequestParam LocalDate day,@RequestParam String name){admin.holiday(serviceId,day,name);return "redirect:/admin/schedules";}
    @PostMapping("/holidays/{id}/remove")public String removeHoliday(@PathVariable Long id){admin.removeHoliday(id);return "redirect:/admin/schedules";}
}


