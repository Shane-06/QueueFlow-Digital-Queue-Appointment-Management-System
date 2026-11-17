package com.queueflow.service;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.security.Actor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
import static com.queueflow.service.AdminService.check;

@Service @Transactional
public class AppointmentService {
    private final Store db;private final Actor actor;private final SchedulingService schedule;private final Events events;private final Clock clock;
    public AppointmentService(Store db,Actor actor,SchedulingService schedule,Events events,Clock clock){this.db=db;this.actor=actor;this.schedule=schedule;this.events=events;this.clock=clock;}
    private void validate(AppointmentSlot slot,Long userId,Long exclude){
        check(schedule.slots(slot.serviceId,slot.day).stream().anyMatch(s->s.id.equals(slot.id)),"Slot is not available");
        ServiceOffering s=db.get(ServiceOffering.class,slot.serviceId);
        var bookings=db.list(Appointment.class,"from Appointment where serviceId=?1 and day=?2 and status<>'CANCELLED'",slot.serviceId,slot.day).stream().filter(a->!Objects.equals(a.id,exclude)).toList();
        check(bookings.stream().filter(a->a.slotId.equals(slot.id)).count()<slot.capacity,"This slot is full");check(bookings.size()<s.appointmentCapacity,"Daily appointment capacity reached");
        var mine=db.list(Appointment.class,"from Appointment where userId=?1 and day=?2 and status in ('BOOKED','CHECKED_IN')",userId,slot.day);
        for(Appointment a:mine){if(Objects.equals(a.id,exclude))continue;check(!a.serviceId.equals(slot.serviceId),"You already have an active appointment for this service and day");AppointmentSlot other=db.get(AppointmentSlot.class,a.slotId);check(!slot.starts.isBefore(other.ends)||!slot.ends.isAfter(other.starts),"Appointment overlaps another booking");}
    }
    public Appointment book(Long slotId){
        User user=actor.require("STUDENT");db.lockWrites();AppointmentSlot slot=db.get(AppointmentSlot.class,slotId);
        var duplicate=db.list(Appointment.class,"from Appointment where userId=?1 and slotId=?2 and status='BOOKED'",user.id,slot.id);if(!duplicate.isEmpty())return duplicate.getFirst();
        validate(slot,user.id,null);Appointment a=new Appointment();a.userId=user.id;a.serviceId=slot.serviceId;a.slotId=slot.id;a.day=slot.day;a.reference="APT-"+UUID.randomUUID();a.status="BOOKED";a.createdAt=clock.instant();a=db.save(a);events.notify(user.id,"Appointment confirmed for "+slot.day+" at "+slot.starts+". Reference "+a.reference);events.audit("APPOINTMENT_BOOKED",a.reference);return a;
    }
    private Appointment editable(Long id){Appointment a=db.get(Appointment.class,id);if(!actor.current().role.equals("ADMIN"))actor.owns(a.userId);AppointmentSlot s=db.get(AppointmentSlot.class,a.slotId);check(a.status.equals("BOOKED")&&schedule.instant(s.day,s.starts).isAfter(clock.instant()),"Only future booked appointments can be changed");return a;}
    public void cancel(Long id){actor.require("STUDENT","ADMIN");db.lockWrites();Appointment a=editable(id);a.status="CANCELLED";events.notify(a.userId,"Appointment cancelled: "+a.reference);events.audit("APPOINTMENT_CANCELLED",a.reference);}
    public void reschedule(Long id,Long slotId){actor.require("STUDENT");db.lockWrites();Appointment a=editable(id);AppointmentSlot slot=db.get(AppointmentSlot.class,slotId);check(a.serviceId.equals(slot.serviceId),"Choose a slot for the same service");validate(slot,a.userId,a.id);a.slotId=slot.id;a.day=slot.day;events.notify(a.userId,"Appointment rescheduled to "+slot.day+" at "+slot.starts);events.audit("APPOINTMENT_RESCHEDULED",a.reference);}
    public QueueEntry checkIn(Long id){
        actor.require("STUDENT");db.lockWrites();Appointment a=db.get(Appointment.class,id);actor.owns(a.userId);
        var existing=db.list(QueueEntry.class,"from QueueEntry where appointmentId=?1",id);if(!existing.isEmpty())return existing.getFirst();
        check(a.status.equals("BOOKED")&&a.day.equals(schedule.today()),"Only today's booked appointment can check in");AppointmentSlot slot=db.get(AppointmentSlot.class,a.slotId);Instant start=schedule.instant(slot.day,slot.starts);
        check(!clock.instant().isBefore(start.minusSeconds(900))&&!clock.instant().isAfter(start.plusSeconds(900)),"Check in within 15 minutes before or after your slot start");schedule.openNow(a.serviceId);check(db.get(ServiceOffering.class,a.serviceId).active,"Service is inactive; contact administration");
        check(db.list(QueueEntry.class,"from QueueEntry where userId=?1 and serviceId=?2 and day=?3 and status in ('WAITING','CALLED','SERVING','HOLD')",a.userId,a.serviceId,a.day).isEmpty(),"You already have an active token");
        ServiceDay day=schedule.day(a.serviceId,a.day);QueueEntry q=new QueueEntry();q.userId=a.userId;q.serviceId=a.serviceId;q.appointmentId=a.id;q.day=a.day;q.token=db.get(ServiceOffering.class,a.serviceId).code+"-"+String.format("%03d",day.nextToken++);q.status="WAITING";q.joinedAt=clock.instant();q.queuedAt=q.joinedAt;q=db.save(q);a.status="CHECKED_IN";events.notify(a.userId,"Checked in. Your token is "+q.token);events.audit("CHECK_IN",q.token);return q;
    }
    public void expireNoShows(){
        db.lockWrites();for(Appointment a:db.list(Appointment.class,"from Appointment where status='BOOKED'")){AppointmentSlot slot=db.get(AppointmentSlot.class,a.slotId);if(clock.instant().isAfter(schedule.instant(slot.day,slot.starts).plusSeconds(900))){a.status="NO_SHOW";events.notify(a.userId,"Missed appointment: "+a.reference);AuditLog log=new AuditLog();log.action="NO_SHOW";log.details=a.reference;log.createdAt=clock.instant();db.save(log);}}
    }
}
