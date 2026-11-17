package com.queueflow;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"queueflow.seed-password=Integration-test-only-42","queueflow.jobs.enabled=false"}) @ActiveProfiles("demo") @AutoConfigureMockMvc @Transactional
class AccountAccessTest {
 @Autowired Store db;@Autowired MockMvc mvc;
 @Test void disabledSessionLosesAccess()throws Exception{var u=db.list(User.class,"from User where role='STUDENT'").getFirst();u.active=false;db.flush();mvc.perform(get("/student/dashboard").with(user(u.email).roles("STUDENT"))).andExpect(redirectedUrl("/login?disabled"));}
 @Test void notificationOwnershipEnforced()throws Exception{Notification n=new Notification();n.userId=db.list(User.class,"from User where role='ADMIN'").getFirst().id;n.message="Private";n.createdAt=java.time.Instant.now();n=db.save(n);db.flush();mvc.perform(post("/student/notifications/"+n.id+"/read").with(user("student@queueflow.local").roles("STUDENT")).with(csrf())).andExpect(status().isForbidden());}
}
