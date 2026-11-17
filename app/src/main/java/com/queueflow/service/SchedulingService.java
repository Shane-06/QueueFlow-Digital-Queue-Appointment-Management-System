package com.queueflow.service;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
import static com.queueflow.service.AdminService.check;

@Service @Transactional
public class SchedulingService {
    private final Store db;private final Clock clock;
    public SchedulingService(Store db,Clock clock){this.db=db;this.clock=clock;}
    public LocalDate today(){return LocalDate.now(clock);}
    public Instant instant(LocalDate date,LocalTime time){return date.atTime(time).atZone(clock.getZone()).toInstant();}
    public Optional<WorkingHours> hours(Long service,LocalDate day){
        if(!db.list(Holiday.class,"from Holiday where serviceId=?1 and day=?2",service,day).isEmpty())return Optional.empty();
        return db.list(WorkingHours.class,"from WorkingHours where serviceId=?1 and dayOfWeek=?2",service,day.getDayOfWeek().getValue()).stream().findFirst();
    }
    public void openNow(Long service){
        var h=hours(service,today()).orElseThrow(()->new IllegalArgumentException("Service is closed today"));LocalTime now=LocalTime.now(clock);
        check(!now.isBefore(h.opens)&&now.isBefore(h.closes),"Service is outside working hours");
        check(h.breakStart==null||now.isBefore(h.breakStart)||!now.isBefore(h.breakEnd),"Service is on a scheduled break");
        check(!day(service,today()).closed,"Today's queue is closed");
    }
    public ServiceDay day(Long service,LocalDate day){
        var rows=db.list(ServiceDay.class,"from ServiceDay where serviceId=?1 and day=?2",service,day);
        if(!rows.isEmpty())return rows.getFirst();ServiceDay d=new ServiceDay();d.serviceId=service;d.day=day;return db.save(d);
    }
    public List<AppointmentSlot> slots(Long serviceId,LocalDate date){
        db.lockWrites();ServiceOffering service=db.get(ServiceOffering.class,serviceId);
        check(service.active&&service.appointmentEnabled,"Appointments are not available for this service");
        check(!date.isBefore(today())&&!date.isAfter(today().plusDays(60)),"Choose a date within the next 60 days");
        var schedule=hours(serviceId,date);if(schedule.isEmpty())return List.of();WorkingHours h=schedule.get();
        List<AppointmentSlot> result=new ArrayList<>();
        for(LocalTime t=h.opens;!t.plusMinutes(service.duration).isAfter(h.closes)&&t.plusMinutes(service.duration).isAfter(t);t=t.plusMinutes(service.duration)) {
            LocalTime end=t.plusMinutes(service.duration);
            if(h.breakStart!=null&&t.isBefore(h.breakEnd)&&end.isAfter(h.breakStart))continue;
            if(!instant(date,t).isAfter(clock.instant()))continue;
            var existing=db.list(AppointmentSlot.class,"from AppointmentSlot where serviceId=?1 and day=?2 and starts=?3",serviceId,date,t);
            AppointmentSlot slot=existing.isEmpty()?new AppointmentSlot():existing.getFirst();slot.serviceId=serviceId;slot.day=date;slot.starts=t;slot.ends=end;slot.capacity=service.slotCapacity;result.add(db.save(slot));
        }
        return result;
    }
    public long booked(Long slot){return db.list(Appointment.class,"from Appointment where slotId=?1 and status<>'CANCELLED'",slot).size();}
}
