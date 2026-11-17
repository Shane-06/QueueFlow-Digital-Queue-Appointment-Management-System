package com.queueflow;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import java.time.*;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"queueflow.seed-password=Integration-test-only-42","queueflow.jobs.enabled=false"}) @ActiveProfiles("demo") @AutoConfigureMockMvc
@WithMockUser(username="staff@queueflow.local",roles="STAFF")
class QueueTest {
 @org.springframework.test.context.bean.override.mockito.MockitoBean Clock clock;
 @org.junit.jupiter.api.BeforeEach void time(){org.mockito.Mockito.when(clock.getZone()).thenReturn(ZoneId.of("Asia/Kolkata"));org.mockito.Mockito.when(clock.instant()).thenReturn(Instant.parse("2026-11-16T04:30:00Z"));}
 @Autowired org.springframework.transaction.PlatformTransactionManager manager;
 @Autowired QueueService queue;@Autowired Store db;@Autowired SchedulingService schedule;@Autowired MockMvc mvc;
 @Test void staffPagesRender()throws Exception{for(String p:new String[]{"queue","history","appointments"})mvc.perform(get("/staff/"+p)).andExpect(status().isOk());}
 @Test @WithMockUser(username="student@queueflow.local",roles="STUDENT")void studentQueueRenders()throws Exception{mvc.perform(get("/student/queue")).andExpect(status().isOk());}
 @Test @Transactional void transitionsReleaseCounterAndRejectInvalidCompletion(){
  Counter c=db.all(Counter.class).getFirst();QueueEntry q=new QueueEntry();q.userId=db.all(User.class).getFirst().id;q.serviceId=db.all(ServiceOffering.class).getFirst().id;q.day=schedule.today();q.token="TEST-"+System.nanoTime();q.status="CALLED";q.counterId=c.id;q.staffId=db.list(User.class,"from User where role='STAFF'").getFirst().id;q.joinedAt=Instant.now();q.queuedAt=q.joinedAt;q=db.save(q);Long id=q.id;
  assertThatThrownBy(()->queue.action(id,"complete","")).isInstanceOf(IllegalArgumentException.class);queue.action(id,"hold","");assertThat(db.get(QueueEntry.class,id).status).isEqualTo("HOLD");queue.action(id,"requeue","");assertThat(db.get(QueueEntry.class,id).status).isEqualTo("WAITING");assertThat(db.get(QueueEntry.class,id).counterId).isNull();db.flush();
 }
 @Test void concurrentCountersClaimOnlyOnce()throws Exception{
  var tx=new org.springframework.transaction.support.TransactionTemplate(manager);Long userId=db.list(User.class,"from User where role='STUDENT'").getFirst().id;Long serviceId=db.all(ServiceOffering.class).getFirst().id;
  Long id=tx.execute(t->{QueueEntry q=new QueueEntry();q.userId=userId;q.serviceId=serviceId;q.day=schedule.today();q.token="RACE-"+System.nanoTime();q.status="WAITING";q.joinedAt=clock.instant();q.queuedAt=q.joinedAt;return db.save(q).id;});
  var pool=java.util.concurrent.Executors.newFixedThreadPool(2);var gate=new java.util.concurrent.CountDownLatch(1);
  try{var futures=new java.util.ArrayList<java.util.concurrent.Future<Boolean>>();for(Counter c:db.all(Counter.class))futures.add(pool.submit(()->{org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("staff@queueflow.local","",java.util.List.of()));try{gate.await();return queue.next(c.id).id.equals(id);}catch(IllegalArgumentException e){return false;}finally{org.springframework.security.core.context.SecurityContextHolder.clearContext();}}));gate.countDown();int wins=0;for(var f:futures)if(f.get(20,java.util.concurrent.TimeUnit.SECONDS))wins++;assertThat(wins).isEqualTo(1);assertThat(db.get(QueueEntry.class,id).status).isEqualTo("CALLED");}
  finally{pool.shutdownNow();tx.executeWithoutResult(t->{db.delete(db.get(QueueEntry.class,id));});}
 }
}
