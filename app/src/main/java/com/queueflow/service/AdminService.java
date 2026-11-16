package com.queueflow.service;
import com.queueflow.entity.*;
import com.queueflow.repository.*;
import com.queueflow.security.Actor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.*;
import java.util.*;

@Service @Transactional
public class AdminService {
    private final Store db;private final Actor actor;private final Events events;private final PasswordEncoder encoder;private final Clock clock;
    public AdminService(Store db,Actor actor,Events events,PasswordEncoder encoder,Clock clock){this.db=db;this.actor=actor;this.events=events;this.encoder=encoder;this.clock=clock;}
    private void begin(){actor.require("ADMIN");db.lockWrites();}
    public static void check(boolean valid,String message){if(!valid)throw new IllegalArgumentException(message);}
    public static String text(String value,int max){check(value!=null&&!value.isBlank()&&value.trim().length()<=max,"Please enter a valid value (maximum "+max+" characters)");return value.trim();}
    private void noFutureBookings(Long service){check(db.list(Appointment.class,"from Appointment where serviceId=?1 and day>=?2 and status in ('BOOKED','CHECKED_IN')",service,LocalDate.now(clock)).isEmpty(),"Resolve existing bookings before changing this schedule or capacity");}
    public ServiceOffering saveService(Long id,String name,String code,String description,int duration,int slotCapacity,int appointmentCapacity,int walkInCapacity,boolean active,boolean appointments,boolean walkIns){
        begin();check(duration>=5&&duration<=180&&slotCapacity>0&&appointmentCapacity>0&&walkInCapacity>0,"Duration must be 5–180 minutes and capacities must be positive");
        check(code!=null&&code.matches("[A-Z0-9]{2,12}"),"Use a unique 2–12 character uppercase service code");
        ServiceOffering s=id==null?new ServiceOffering():db.get(ServiceOffering.class,id);
        if(id!=null&&(s.duration!=duration||s.slotCapacity!=slotCapacity||s.appointmentCapacity!=appointmentCapacity)) noFutureBookings(id);
        s.name=text(name,120);s.code=code;s.description=text(description,1000);s.duration=duration;s.slotCapacity=slotCapacity;s.appointmentCapacity=appointmentCapacity;s.walkInCapacity=walkInCapacity;s.active=active;s.appointmentEnabled=appointments;s.walkInEnabled=walkIns;
        s=db.save(s);events.audit("SERVICE_SAVED",s.name);return s;
    }
    public Counter saveCounter(Long id,String name,String location,boolean active,List<Long> serviceIds,List<Long> staffIds){
        begin();Counter c=id==null?new Counter():db.get(Counter.class,id);
        if(id!=null) check(db.list(QueueEntry.class,"from QueueEntry where counterId=?1 and status in ('CALLED','SERVING')",id).isEmpty(),"Finish the counter's active token before changing its assignments");
        for(Long s:serviceIds)db.get(ServiceOffering.class,s);
        for(Long u:staffIds)check(db.get(User.class,u).role.equals("STAFF"),"Only staff can be assigned to counters");
        c.name=text(name,120);c.location=text(location,200);c.active=active;c=db.save(c);db.flush();
        db.execute("delete from counter_services where counter_id=?1",c.id);db.execute("delete from staff_counters where counter_id=?1",c.id);
        for(Long s:new HashSet<>(serviceIds))db.execute("insert into counter_services values (?1,?2)",c.id,s);
        for(Long u:new HashSet<>(staffIds))db.execute("insert into staff_counters values (?1,?2)",c.id,u);
        events.audit("COUNTER_SAVED",c.name);return c;
    }
    public User saveUser(Long id,String name,String email,String role,boolean active,String password){
        begin();check(List.of("STUDENT","STAFF","ADMIN").contains(role),"Invalid role");
        email=text(email,180).toLowerCase(Locale.ROOT);check(email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"),"Enter a valid email");
        User u=id==null?new User():db.get(User.class,id);
        if(id!=null) {check(!actor.current().id.equals(id)||active&&role.equals("ADMIN"),"You cannot remove your own admin access");check(u.role==null||u.role.equals(role),"Existing account roles cannot be changed; create the appropriate account instead");}
        if(id==null||password!=null&&!password.isBlank()){check(password!=null&&password.length()>=12&&password.length()<=72,"Password must contain 12–72 characters");u.passwordHash=encoder.encode(password);}
        u.name=text(name,120);u.email=email;u.role=role;u.active=active;u=db.save(u);events.audit("USER_SAVED",u.email);return u;
    }
    public void schedule(Long service,int day,LocalTime opens,LocalTime closes,LocalTime breakStart,LocalTime breakEnd){
        begin();db.get(ServiceOffering.class,service);check(day>=1&&day<=7&&opens!=null&&closes!=null&&opens.isBefore(closes),"Invalid working day or opening hours");
        check(breakStart==null&&breakEnd==null||breakStart!=null&&breakEnd!=null&&!breakStart.isBefore(opens)&&!breakEnd.isAfter(closes)&&breakStart.isBefore(breakEnd),"Break must be inside opening hours");noFutureBookings(service);
        var rows=db.list(WorkingHours.class,"from WorkingHours where serviceId=?1 and dayOfWeek=?2",service,day);WorkingHours w=rows.isEmpty()?new WorkingHours():rows.getFirst();
        w.serviceId=service;w.dayOfWeek=day;w.opens=opens;w.closes=closes;w.breakStart=breakStart;w.breakEnd=breakEnd;db.save(w);
        db.execute("delete from appointment_slots where service_id=?1 and day>=?2 and id not in (select slot_id from appointments)",service,LocalDate.now(clock));events.audit("SCHEDULE_SAVED","Service "+service+", day "+day);
    }
    public void removeSchedule(Long id){begin();WorkingHours w=db.get(WorkingHours.class,id);noFutureBookings(w.serviceId);db.delete(w);events.audit("SCHEDULE_REMOVED","Service "+w.serviceId+", day "+w.dayOfWeek);}
    public void holiday(Long service,LocalDate day,String name){begin();db.get(ServiceOffering.class,service);check(day!=null&&!day.isBefore(LocalDate.now(clock)),"Holiday cannot be in the past");check(db.list(Appointment.class,"from Appointment where serviceId=?1 and day=?2 and status in ('BOOKED','CHECKED_IN')",service,day).isEmpty(),"Resolve bookings on this date before closing it");Holiday h=new Holiday();h.serviceId=service;h.day=day;h.name=text(name,120);db.save(h);events.audit("HOLIDAY_ADDED",h.name);}
    public void removeHoliday(Long id){begin();Holiday h=db.get(Holiday.class,id);db.delete(h);events.audit("HOLIDAY_REMOVED",h.name);}
}
