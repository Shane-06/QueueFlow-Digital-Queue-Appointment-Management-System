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
    @Test void selectedWorkspaceOnlyAcceptsMatchingAccounts() throws Exception {
        var roles = java.util.List.of("student", "staff", "admin");
        for (String selectedRole : roles) {
            for (String accountRole : roles) {
                var result = mvc.perform(post("/login").with(csrf())
                    .param("role", selectedRole)
                    .param("username", accountRole + "@queueflow.local")
                    .param("password", "Integration-test-only-42"));
                if (selectedRole.equals(accountRole)) {
                    result.andExpect(authenticated()).andExpect(redirectedUrl("/dashboard"));
                } else {
                    result.andExpect(unauthenticated())
                        .andExpect(redirectedUrl("/login?role=" + selectedRole + "&workspaceMismatch"));
                }
            }
        }
    }

    @Test void failedWorkspaceLoginPreservesSelectionForRetry() throws Exception {
        mvc.perform(post("/login").with(csrf()).param("role", "student")
                .param("username", "student@queueflow.local").param("password", "wrong"))
            .andExpect(unauthenticated()).andExpect(redirectedUrl("/login?role=student&error"));
        mvc.perform(get("/login").param("role", "student").param("workspaceMismatch", ""))
            .andExpect(status().isOk())
            .andExpect(content().string(org.hamcrest.Matchers.containsString("name=\"role\" value=\"student\"")))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("cannot sign in to the Student workspace")));
    }

    @Test void studentCannotOpenAdminAndCsrfIsRequired() throws Exception {
        mvc.perform(get("/admin/dashboard").with(user("student@queueflow.local").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(post("/logout").with(user("student@queueflow.local").roles("STUDENT"))).andExpect(status().isForbidden());
        mvc.perform(post("/logout").with(user("student@queueflow.local").roles("STUDENT")).with(csrf())).andExpect(unauthenticated());
        mvc.perform(get("/student/dashboard")).andExpect(status().is3xxRedirection());
    }
}
