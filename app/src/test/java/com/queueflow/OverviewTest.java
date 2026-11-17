package com.queueflow;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties={"queueflow.seed-password=Integration-test-only-42","queueflow.jobs.enabled=false"}) @ActiveProfiles("demo") @AutoConfigureMockMvc
class OverviewTest {
 @Autowired MockMvc mvc;
 @Test void allOverviewPagesRender()throws Exception{
  for(String role:new String[]{"student","staff","admin"})mvc.perform(get("/"+role+"/dashboard").with(user(role+"@queueflow.local").roles(role.toUpperCase()))).andExpect(status().isOk());
  for(String page:new String[]{"appointments","queue","reports","audit"})mvc.perform(get("/admin/"+page).with(user("admin@queueflow.local").roles("ADMIN"))).andExpect(status().isOk());
  for(String page:new String[]{"notifications","profile"})mvc.perform(get("/student/"+page).with(user("student@queueflow.local").roles("STUDENT"))).andExpect(status().isOk());
 }
}
