package com.queueflow;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(properties={"queueflow.seed-password=Integration-test-only-42","queueflow.jobs.enabled=false"}) @ActiveProfiles("demo")
class BookingConcurrencyTest {
 @Autowired Store db;@Autowired SchedulingService schedule;@Autowired AppointmentService appointments;@Autowired PlatformTransactionManager manager;
 @Test void simultaneousLastSlotHasOneWinner() throws Exception {
  var tx=new TransactionTemplate(manager);String suffix=UUID.randomUUID().toString();List<User> users=new ArrayList<>();
  ServiceOffering service=tx.execute(s->{ServiceOffering v=new ServiceOffering();v.name="Concurrent test";v.code="C"+suffix.substring(0,8);v.description="Integration fixture";v.slotCapacity=1;v=db.save(v);for(int i=0;i<2;i++){User u=new User();u.name="Concurrent student";u.email=i+suffix+"@test.local";u.role="STUDENT";u.passwordHash="unused-test-account";users.add(db.save(u));}return v;});
  LocalDate date=schedule.today().plusDays(2);WorkingHours w=new WorkingHours();w.serviceId=service.id;w.dayOfWeek=date.getDayOfWeek().getValue();w.opens=LocalTime.of(9,0);w.closes=LocalTime.of(10,0);tx.executeWithoutResult(s->db.save(w));
  Long slot=schedule.slots(service.id,date).getFirst().id;var gate=new CountDownLatch(1);var pool=Executors.newFixedThreadPool(2);
  try {
   List<Future<Boolean>> attempts=new ArrayList<>();for(User u:users)attempts.add(pool.submit(()->{SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u.email,"",List.of()));try{gate.await();appointments.book(slot);return true;}catch(IllegalArgumentException ex){return false;}finally{SecurityContextHolder.clearContext();}}));
   gate.countDown();int winners=0;for(var attempt:attempts)if(attempt.get(20,TimeUnit.SECONDS))winners++;assertThat(winners).isEqualTo(1);assertThat(schedule.booked(slot)).isEqualTo(1);
  }finally{pool.shutdownNow();tx.executeWithoutResult(s->{for(User u:users){db.execute("delete from notifications where user_id=?1",u.id);db.execute("delete from audit_logs where actor_id=?1",u.id);}db.execute("delete from appointments where service_id=?1",service.id);db.execute("delete from appointment_slots where service_id=?1",service.id);db.execute("delete from working_hours where service_id=?1",service.id);db.delete(db.get(ServiceOffering.class,service.id));for(User u:users)db.delete(db.get(User.class,u.id));});}
 }
}
