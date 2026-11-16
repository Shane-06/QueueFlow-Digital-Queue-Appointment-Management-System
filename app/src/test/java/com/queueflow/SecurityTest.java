package com.queueflow;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties="queueflow.seed-password=Integration-test-only-42") @ActiveProfiles("demo") @AutoConfigureMockMvc
class SecurityTest {
    @Autowired MockMvc mvc;
    @Test void loginRejectsBadPasswordAndAcceptsValidPassword() throws Exception {
        mvc.perform(post("/login").with(csrf()).param("username","student@queueflow.local").param("password","wrong")).andExpect(unauthenticated());
        mvc.perform(post("/login").with(csrf()).param("username","student@queueflow.local").param("password","Integration-test-only-42")).andExpect(authenticated()).andExpect(redirectedUrl("/dashboard"));
    }
    @Test void studentCannotOpenAdminAndCsrfIsRequired() throws Exception {
        mvc.perform(get("/admin/dashboard").with(user("student@queueflow.local").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(post("/logout").with(user("student@queueflow.local").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(post("/logout").with(user("student@queueflow.local").roles("STUDENT")).with(csrf())).andExpect(unauthenticated());
        mvc.perform(get("/student/dashboard")).andExpect(status().is3xxRedirection());
    }
}
