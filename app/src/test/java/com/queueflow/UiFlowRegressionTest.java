package com.queueflow;

import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.service.SchedulingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"queueflow.seed-password=Integration-test-only-42","queueflow.jobs.enabled=false"})
@ActiveProfiles("demo") @AutoConfigureMockMvc @Transactional
class UiFlowRegressionTest {
 @Autowired MockMvc mvc;@Autowired Store db;@Autowired SchedulingService schedule;
 private QueueEntry visit(String status){QueueEntry q=new QueueEntry();q.userId=db.list(User.class,"from User where role='STUDENT'").getFirst().id;q.serviceId=db.all(ServiceOffering.class).getFirst().id;q.day=schedule.today().minusDays(2);q.token="HISTORY-REGRESSION";q.status=status;q.joinedAt=Instant.now();q.queuedAt=q.joinedAt;return db.save(q);}
 @Test void studentAndStaffHistoryIncludePastWalkIn()throws Exception{visit("COMPLETED");db.flush();mvc.perform(get("/student/history").with(user("student@queueflow.local").roles("STUDENT"))).andExpect(status().isOk()).andExpect(content().string(containsString("HISTORY-REGRESSION")));mvc.perform(get("/staff/history").with(user("staff@queueflow.local").roles("STAFF"))).andExpect(status().isOk()).andExpect(content().string(containsString("HISTORY-REGRESSION")));}
 @Test void holdKeepsSecondCounterSelected()throws Exception{QueueEntry q=visit("WAITING");q.status="CALLED";q.day=schedule.today();q.counterId=db.all(Counter.class).get(1).id;q.staffId=db.list(User.class,"from User where role='STAFF'").getFirst().id;db.flush();mvc.perform(post("/staff/queue/"+q.id+"/hold").with(user("staff@queueflow.local").roles("STAFF")).with(csrf())).andExpect(redirectedUrl("/staff/queue?counterId="+q.counterId));}
 @Test void pastBookingDoesNotOfferCancelOrReschedule()throws Exception{AppointmentSlot slot=new AppointmentSlot();slot.serviceId=db.all(ServiceOffering.class).getFirst().id;slot.day=schedule.today().minusDays(5);slot.starts=LocalTime.of(10,0);slot.ends=LocalTime.of(10,15);slot.capacity=2;slot=db.save(slot);Appointment a=new Appointment();a.slotId=slot.id;a.serviceId=slot.serviceId;a.day=slot.day;a.userId=db.list(User.class,"from User where role='STUDENT'").getFirst().id;a.reference="EXPIRED-UI-TEST";a.status="BOOKED";a.createdAt=Instant.now();db.save(a);db.flush();mvc.perform(get("/student/appointments").with(user("student@queueflow.local").roles("STUDENT"))).andExpect(status().isOk()).andExpect(content().string(not(containsString(">Cancel appointment</button>")))).andExpect(content().string(not(containsString(">Reschedule</a>"))));}
}
