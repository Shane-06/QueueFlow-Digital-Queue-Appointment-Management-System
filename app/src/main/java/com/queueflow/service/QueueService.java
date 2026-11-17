package com.queueflow.service;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.security.Actor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Clock;
import java.util.*;
import static com.queueflow.service.AdminService.check;

@Service @Transactional
public class QueueService {
 private final Store db;private final Actor actor;private final SchedulingService schedule;private final Events events;private final Clock clock;
 public QueueService(Store db,Actor actor,SchedulingService schedule,Events events,Clock clock){this.db=db;this.actor=actor;this.schedule=schedule;this.events=events;this.clock=clock;}
 private Counter counter(Long id){User staff=actor.require("STAFF");Counter c=db.get(Counter.class,id);check(c.active,"Counter is inactive");check(!db.sql("select 1 from staff_counters where counter_id=?1 and user_id=?2",id,staff.id).isEmpty(),"Counter is not assigned to you");return c;}
 public QueueEntry join(Long serviceId){User u=actor.require("STUDENT");db.lockWrites();ServiceOffering s=db.get(ServiceOffering.class,serviceId);check(s.active&&s.walkInEnabled,"Walk-ins are unavailable");schedule.openNow(s.id);
  var active=db.list(QueueEntry.class,"from QueueEntry where userId=?1 and serviceId=?2 and day=?3 and status in ('WAITING','CALLED','SERVING','HOLD')",u.id,s.id,schedule.today());if(!active.isEmpty())return active.getFirst();
  check(db.list(QueueEntry.class,"from QueueEntry where serviceId=?1 and day=?2 and appointmentId is null",s.id,schedule.today()).size()<s.walkInCapacity,"Walk-in capacity reached");ServiceDay day=schedule.day(s.id,schedule.today());QueueEntry q=new QueueEntry();q.userId=u.id;q.serviceId=s.id;q.day=schedule.today();q.token=s.code+"-"+String.format("%03d",day.nextToken++);q.status="WAITING";q.joinedAt=clock.instant();q.queuedAt=q.joinedAt;q=db.save(q);events.notify(u.id,"Your walk-in token is "+q.token);events.audit("QUEUE_JOINED",q.token);return q;
 }
 public QueueEntry next(Long counterId){db.lockWrites();Counter c=counter(counterId);check(db.list(QueueEntry.class,"from QueueEntry where counterId=?1 and status in ('CALLED','SERVING')",c.id).isEmpty(),"Resolve the current token first");
  var list=db.list(QueueEntry.class,"from QueueEntry where day=?1 and status='WAITING' order by queuedAt,id",schedule.today());
  QueueEntry q=list.stream().filter(x->!db.sql("select 1 from counter_services where counter_id=?1 and service_id=?2",c.id,x.serviceId).isEmpty()).filter(x->db.get(ServiceOffering.class,x.serviceId).active&&!schedule.day(x.serviceId,x.day).closed).findFirst().orElseThrow(()->new IllegalArgumentException("No eligible waiting tokens"));
  schedule.openNow(q.serviceId);q.counterId=c.id;q.staffId=actor.current().id;q.status="CALLED";q.calledAt=clock.instant();events.notify(q.userId,"Token "+q.token+": proceed to "+c.name);events.audit("TOKEN_CALLED",q.token);return q;
 }
 public void action(Long id,String action,String reason){db.lockWrites();QueueEntry q=db.get(QueueEntry.class,id);check(q.day.equals(schedule.today()),"Only today's tokens can be operated");check(q.counterId!=null,"Token has no assigned counter");counter(q.counterId);
  switch(action){
   case "start" -> {check(q.status.equals("CALLED"),"Only a called token can start service");q.status="SERVING";q.startedAt=clock.instant();}
   case "complete" -> {check(q.status.equals("SERVING"),"Start service before completing it");q.status="COMPLETED";q.completedAt=clock.instant();}
   case "hold" -> {check(List.of("CALLED","SERVING").contains(q.status),"Only an active token can be held");q.status="HOLD";}
   case "requeue" -> {check(q.status.equals("HOLD"),"Only held tokens can be requeued");q.status="WAITING";q.queuedAt=clock.instant();q.counterId=null;q.staffId=null;}
   case "skip" -> {check(List.of("CALLED","SERVING","HOLD").contains(q.status),"Token cannot be skipped from this state");q.reason=AdminService.text(reason,500);q.status="SKIPPED";q.completedAt=clock.instant();}
   default -> throw new IllegalArgumentException("Unknown queue action");
  }
  if(q.appointmentId!=null&&List.of("COMPLETED","SKIPPED").contains(q.status)){Appointment a=db.get(Appointment.class,q.appointmentId);a.status=q.status;a.completedAt=q.completedAt;}
  events.notify(q.userId,"Token "+q.token+": "+q.status);events.audit("TOKEN_"+action.toUpperCase(Locale.ROOT),q.token);
 }
 public void close(Long serviceId){actor.require("ADMIN");db.lockWrites();check(db.list(QueueEntry.class,"from QueueEntry where serviceId=?1 and day=?2 and status in ('CALLED','SERVING')",serviceId,schedule.today()).isEmpty(),"Resolve active tokens before closing");schedule.day(serviceId,schedule.today()).closed=true;
  for(QueueEntry q:db.list(QueueEntry.class,"from QueueEntry where serviceId=?1 and day=?2 and status in ('WAITING','HOLD')",serviceId,schedule.today())){q.status="SKIPPED";q.reason="Service day closed";q.completedAt=clock.instant();if(q.appointmentId!=null)db.get(Appointment.class,q.appointmentId).status="SKIPPED";events.notify(q.userId,"Token "+q.token+" closed by administration");}events.audit("QUEUE_CLOSED","Service "+serviceId);
 }
}
