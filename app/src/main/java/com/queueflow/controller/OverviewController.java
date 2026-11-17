package com.queueflow.controller;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.security.Actor;
import com.queueflow.service.SchedulingService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Controller
public class OverviewController {
 private final Store db;private final Actor actor;private final SchedulingService schedule;
 public OverviewController(Store db,Actor actor,SchedulingService schedule){this.db=db;this.actor=actor;this.schedule=schedule;}
 @GetMapping({"/student/dashboard","/staff/dashboard","/admin/dashboard","/student/notifications","/student/profile","/admin/appointments","/admin/queue","/admin/reports","/admin/audit"})
 public String overview(Model m,jakarta.servlet.http.HttpServletRequest req){User u=actor.current();String page=req.getRequestURI().substring(req.getRequestURI().lastIndexOf('/')+1);m.addAttribute("account",u);m.addAttribute("page",page);m.addAttribute("today",schedule.today());
  var appointments=u.role.equals("STUDENT")?db.list(Appointment.class,"from Appointment where userId=?1 order by day desc",u.id):db.list(Appointment.class,"from Appointment order by day desc,id desc");
  var entries=u.role.equals("STUDENT")?db.list(QueueEntry.class,"from QueueEntry where userId=?1 and day=?2 order by id",u.id,schedule.today()):db.list(QueueEntry.class,"from QueueEntry where day=?1 order by id",schedule.today());
  m.addAttribute("appointments",appointments);m.addAttribute("entries",entries);m.addAttribute("services",db.all(ServiceOffering.class));m.addAttribute("notifications",db.list(Notification.class,"from Notification where userId=?1 order by createdAt desc",u.id));
  Map<String,Long> counts=new LinkedHashMap<>();for(String status:List.of("WAITING","CALLED","SERVING","COMPLETED","HOLD","SKIPPED"))counts.put(status,entries.stream().filter(q->q.status.equals(status)).count());m.addAttribute("counts",counts);
  m.addAttribute("appointmentCount",appointments.stream().filter(a->a.day.equals(schedule.today())).count());m.addAttribute("noShows",appointments.stream().filter(a->a.day.equals(schedule.today())&&a.status.equals("NO_SHOW")).count());m.addAttribute("cancellations",appointments.stream().filter(a->a.day.equals(schedule.today())&&a.status.equals("CANCELLED")).count());
  m.addAttribute("averageWait",Math.round(entries.stream().filter(q->q.calledAt!=null).mapToLong(q->java.time.Duration.between(q.joinedAt,q.calledAt).toMinutes()).average().orElse(0)));
  m.addAttribute("logs",u.role.equals("ADMIN")?db.list(AuditLog.class,"from AuditLog order by createdAt desc"):List.of());return "overview";
 }
 @PostMapping("/student/notifications/{id}/read") @Transactional public String read(@PathVariable Long id){actor.require("STUDENT");Notification n=db.get(Notification.class,id);actor.owns(n.userId);n.seen=true;return "redirect:/student/notifications";}
}
