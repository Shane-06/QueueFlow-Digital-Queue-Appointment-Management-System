package com.queueflow;
import com.queueflow.service.AdminService;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalTime;
import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties="queueflow.seed-password=Integration-test-only-42") @ActiveProfiles("demo") @AutoConfigureMockMvc
@WithMockUser(username="admin@queueflow.local",roles="ADMIN")
class AdminTest {
    @Autowired MockMvc mvc;@Autowired AdminService admin;@Autowired Store db;
    @Test void allConfigurationPagesRender() throws Exception {for(String page:new String[]{"services","counters","staff","schedules"})mvc.perform(get("/admin/"+page)).andExpect(status().isOk());}
    @Test @Transactional void configurationValidatesAndPersists(){
        ServiceOffering s=admin.saveService(null,"Test service","TEST","Test details",15,2,40,40,true,true,true);db.flush();assertThat(db.get(ServiceOffering.class,s.id).name).isEqualTo("Test service");
        assertThatThrownBy(()->admin.schedule(s.id,1,LocalTime.of(17,0),LocalTime.of(9,0),null,null)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test @WithMockUser(username="student@queueflow.local",roles="STUDENT") void serviceLayerRejectsStudent(){assertThatThrownBy(()->admin.saveService(null,"Test","TT","Test",15,2,40,40,true,true,true)).isInstanceOf(org.springframework.security.access.AccessDeniedException.class);}
}
