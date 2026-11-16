package com.queueflow;
import com.queueflow.config.DemoSeed;
import com.queueflow.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.JdbcTemplate;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(properties="queueflow.seed-password=Integration-test-only-42") @ActiveProfiles("demo")
class DatabaseTest {
    @Autowired JdbcTemplate jdbc; @Autowired DemoSeed seed; @Autowired UserRepository users;
    @Test void migrationsAndSeedArePersistentAndIdempotent() {
        assertThat(jdbc.queryForObject("select count(*) from flyway_schema_history where success",Integer.class)).isPositive();
        long count=users.count();seed.run();assertThat(users.count()).isEqualTo(count);
        assertThat(users.findByEmail("admin@queueflow.local")).isPresent();
        assertThat(jdbc.queryForObject("select count(*) from pg_indexes where indexname='one_active_counter'",Integer.class)).isEqualTo(1);
    }
    @Test void databaseRejectsInvalidCapacity() {
        assertThatThrownBy(()->jdbc.update("update services set slot_capacity=0")).isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }
}
