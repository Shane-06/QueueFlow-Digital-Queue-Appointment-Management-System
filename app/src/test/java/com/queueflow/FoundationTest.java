package com.queueflow;
import com.queueflow.controller.HomeController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;

@WebMvcTest(HomeController.class)
class FoundationTest {
    @Autowired MockMvc mvc;
    @Test void rendersThymeleafHome() throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(view().name("home"))
            .andExpect(content().string(containsString("QueueFlow")))
            .andExpect(content().string(containsString("/css/app.css")));
    }
}
