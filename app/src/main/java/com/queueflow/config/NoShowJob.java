package com.queueflow.config;
import com.queueflow.service.AppointmentService;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.*;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
@Configuration @EnableScheduling @ConditionalOnProperty(name="queueflow.jobs.enabled",havingValue="true",matchIfMissing=true)
public class NoShowJob {
    private final AppointmentService appointments;public NoShowJob(AppointmentService appointments){this.appointments=appointments;}
    @Scheduled(fixedDelay=60000,initialDelay=60000) public void expire(){appointments.expireNoShows();}
}
