package com.queueflow;
import com.queueflow.entity.*;
import com.queueflow.repository.*;
import com.queueflow.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"queueflow.seed-password=Integration-test-only-42","queueflow.jobs.enabled=false"}) @ActiveProfiles("demo") @AutoConfigureMockMvc
@WithMockUser(username="student@queueflow.local",roles="STUDENT")
class AppointmentTest {
 @Autowired Store db;@Autowired SchedulingService schedule;@Autowired AppointmentService appointments;@Autowired MockMvc mvc;
 @Test @Transactional void bookIsIdempotentAndCancelPersists(){
  var service=db.all(ServiceOffering.class).getFirst();LocalDate date=schedule.today().plusDays(1);while(date.getDayOfWeek().getValue()>5)date=date.plusDays(1);
  var slot=schedule.slots(service.id,date).getFirst();var first=appointments.book(slot.id);assertThat(appointments.book(slot.id).id).isEqualTo(first.id);assertThat(db.list(QueueEntry.class,"from QueueEntry where appointmentId=?1",first.id)).isEmpty();appointments.cancel(first.id);db.flush();assertThat(db.get(Appointment.class,first.id).status).isEqualTo("CANCELLED");
 }
 @Test @Transactional void failedReschedulePreservesOriginal(){
  var service=db.all(ServiceOffering.class).getFirst();LocalDate date=schedule.today().plusDays(1);while(date.getDayOfWeek().getValue()>5)date=date.plusDays(1);var slot=schedule.slots(service.id,date).getFirst();var a=appointments.book(slot.id);
  assertThatThrownBy(()->appointments.reschedule(a.id,Long.MAX_VALUE)).isInstanceOf(org.springframework.dao.InvalidDataAccessApiUsageException.class);assertThat(db.get(Appointment.class,a.id).slotId).isEqualTo(slot.id);
 }
 @Test void studentPagesRender() throws Exception {
  mvc.perform(get("/student/services")).andExpect(status().isOk());mvc.perform(get("/student/appointments")).andExpect(status().isOk());
  var service=db.all(ServiceOffering.class).getFirst();mvc.perform(get("/student/appointments/new").param("serviceId",service.id.toString()).param("date",schedule.today().plusDays(1).toString())).andExpect(status().isOk());
 }
 @Test void pastDateRejected(){assertThatThrownBy(()->schedule.slots(db.all(ServiceOffering.class).getFirst().id,schedule.today().minusDays(1))).isInstanceOf(IllegalArgumentException.class);}
}
