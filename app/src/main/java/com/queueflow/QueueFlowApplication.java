package com.queueflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.time.Clock;
import java.time.ZoneId;

@SpringBootApplication
public class QueueFlowApplication {
    public static void main(String[] args) { SpringApplication.run(QueueFlowApplication.class, args); }
    @Bean Clock clock() { return Clock.system(ZoneId.of("Asia/Kolkata")); }
}
