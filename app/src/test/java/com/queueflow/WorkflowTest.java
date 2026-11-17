package com.queueflow;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.*;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
@SpringBootTest(properties={"queueflow.seed-password=Integration-test-only-42","queueflow.jobs.enabled=false"}) @ActiveProfiles("demo") @Transactional
class WorkflowTest {
 @Autowired Store db;@Autowired SchedulingService schedule;@Autowired AppointmentService appointments;@Autowired QueueService queue;
 @MockitoBean Clock clock;
 @BeforeEach void setup(){when(clock.getZone()).thenReturn(ZoneId.of("Asia/Kolkata"));at("2026-11-16T03:30:00Z");role("student");}
 @AfterEach void cleanup(){SecurityContextHolder.clearContext();}
 void at(String t){when(clock.instant()).thenReturn(Instant.parse(t));}
 void role(String role){SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(role+"@queueflow.local","",List.of()));}
 @Test void bookCheckInCallCompleteAndNotify(){
  var service=db.all(ServiceOffering.class).getFirst();var slot=schedule.slots(service.id,schedule.today()).getFirst();Appointment a=appointments.book(slot.id);
  when(clock.instant()).thenReturn(slot.day.atTime(slot.starts).atZone(ZoneId.of("Asia/Kolkata")).toInstant());QueueEntry q=appointments.checkIn(a.id);assertThat(appointments.checkIn(a.id).id).isEqualTo(q.id);
  role("staff");Long counter=db.all(Counter.class).getFirst().id;assertThat(queue.next(counter).id).isEqualTo(q.id);assertThatThrownBy(()->queue.next(counter)).isInstanceOf(IllegalArgumentException.class);queue.action(q.id,"start","");queue.action(q.id,"complete","");db.flush();
  assertThat(db.get(Appointment.class,a.id).status).isEqualTo("COMPLETED");assertThat(db.list(Notification.class,"from Notification where userId=?1",a.userId)).isNotEmpty();
 }
 @Test void gracePeriodOnlyExpiresUnarrivedBookings(){var service=db.all(ServiceOffering.class).getFirst();var slot=schedule.slots(service.id,schedule.today()).getFirst();Appointment a=appointments.book(slot.id);when(clock.instant()).thenReturn(slot.day.atTime(slot.starts).atZone(ZoneId.of("Asia/Kolkata")).toInstant().plusSeconds(901));appointments.expireNoShows();assertThat(db.get(Appointment.class,a.id).status).isEqualTo("NO_SHOW");}
 @Test void earlyCheckInFails(){var service=db.all(ServiceOffering.class).getFirst();var slot=schedule.slots(service.id,schedule.today()).get(4);Appointment a=appointments.book(slot.id);assertThatThrownBy(()->appointments.checkIn(a.id)).isInstanceOf(IllegalArgumentException.class);}
 @Test void walkInHoldRequeueAndSkip(){var service=db.all(ServiceOffering.class).getFirst();QueueEntry q=queue.join(service.id);assertThat(queue.join(service.id).id).isEqualTo(q.id);role("staff");queue.next(db.all(Counter.class).getFirst().id);queue.action(q.id,"hold","");queue.action(q.id,"requeue","");queue.next(db.all(Counter.class).getFirst().id);queue.action(q.id,"skip","Missing documents");assertThat(db.get(QueueEntry.class,q.id).status).isEqualTo("SKIPPED");}
 @Test void holidaysAndBreaksRejectWalkIns(){var service=db.all(ServiceOffering.class).getFirst();at("2026-11-16T07:45:00Z");assertThatThrownBy(()->queue.join(service.id)).isInstanceOf(IllegalArgumentException.class);}
 @Test void closedDayExcludesWaitingTokens(){var service=db.all(ServiceOffering.class).getFirst();QueueEntry q=queue.join(service.id);role("admin");queue.close(service.id);assertThat(db.get(QueueEntry.class,q.id).status).isEqualTo("SKIPPED");role("student");assertThatThrownBy(()->queue.join(service.id)).isInstanceOf(IllegalArgumentException.class);}
}
