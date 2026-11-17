package com.queueflow.controller;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.security.Actor;
import com.queueflow.service.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@Controller
public class QueueController {
 private final Store db;private final Actor actor;private final QueueService queue;private final SchedulingService schedule;
 public QueueController(Store db,Actor actor,QueueService queue,SchedulingService schedule){this.db=db;this.actor=actor;this.queue=queue;this.schedule=schedule;}
 @PostMapping("/student/queue/join")public String join(@RequestParam Long serviceId){queue.join(serviceId);return "redirect:/student/queue";}
 @GetMapping("/student/queue")public String student(Model m){User u=actor.require("STUDENT");m.addAttribute("account",u);var mine=db.list(QueueEntry.class,"from QueueEntry where userId=?1 and day=?2 order by id desc",u.id,schedule.today());m.addAttribute("entries",mine);Map<Long,Long> ahead=new HashMap<>();for(var q:mine)ahead.put(q.id,db.list(QueueEntry.class,"from QueueEntry where serviceId=?1 and day=?2 and status='WAITING' and (queuedAt<?3 or (queuedAt=?3 and id<?4))",q.serviceId,q.day,q.queuedAt,q.id).size()*1L);m.addAttribute("ahead",ahead);m.addAttribute("currentTokens",db.list(QueueEntry.class,"from QueueEntry where day=?1 and status in ('CALLED','SERVING') order by id",schedule.today()));m.addAttribute("services",db.all(ServiceOffering.class));m.addAttribute("counters",db.all(Counter.class));return "student-queue";}
 @GetMapping({"/staff/queue","/staff/history","/staff/appointments"})public String staff(@RequestParam(required=false)Long counterId,Model m){User u=actor.require("STAFF");var counters=db.all(Counter.class).stream().filter(c->c.active&&!db.sql("select 1 from staff_counters where counter_id=?1 and user_id=?2",c.id,u.id).isEmpty()).toList();if(counterId==null&&!counters.isEmpty())counterId=counters.getFirst().id;Long selected=counterId;if(selected!=null&&!counters.stream().anyMatch(c->c.id.equals(selected)))throw new org.springframework.security.access.AccessDeniedException("Counter not assigned");m.addAttribute("account",u);m.addAttribute("counters",counters);m.addAttribute("counterId",counterId);var entries=db.list(QueueEntry.class,"from QueueEntry where day=?1 order by queuedAt,id",schedule.today()).stream().filter(q->selected!=null&&!db.sql("select 1 from counter_services where counter_id=?1 and service_id=?2",selected,q.serviceId).isEmpty()).toList();m.addAttribute("entries",entries);m.addAttribute("appointments",db.list(Appointment.class,"from Appointment where day=?1 order by id",schedule.today()).stream().filter(a->selected!=null&&!db.sql("select 1 from counter_services where counter_id=?1 and service_id=?2",selected,a.serviceId).isEmpty()).toList());return "staff-queue";}
 @PostMapping("/staff/queue/next")public String next(@RequestParam Long counterId){queue.next(counterId);return "redirect:/staff/queue?counterId="+counterId;}
 @PostMapping("/staff/queue/{id}/{action}")public String action(@PathVariable Long id,@PathVariable String action,@RequestParam(defaultValue="")String reason){queue.action(id,action,reason);return "redirect:/staff/queue";}
 @PostMapping("/admin/queue/close")public String close(@RequestParam Long serviceId){queue.close(serviceId);return "redirect:/admin/queue";}
}
