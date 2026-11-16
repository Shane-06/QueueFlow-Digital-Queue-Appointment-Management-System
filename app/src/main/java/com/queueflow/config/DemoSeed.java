package com.queueflow.config;

import com.queueflow.entity.*;
import com.queueflow.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalTime;

@Component @Profile("demo")
public class DemoSeed implements CommandLineRunner {
    private final Store store; private final UserRepository users; private final String password;
    public DemoSeed(Store store, UserRepository users,@Value("${queueflow.seed-password}") String password) {this.store=store;this.users=users;this.password=password;}
    @Override @Transactional public void run(String... args) {
        store.lockWrites();
        if (users.count()>0) return;
        if (password.length()<12) throw new IllegalStateException("Set DEMO_PASSWORD to at least 12 characters for first demo initialization");
        Department d=new Department();d.name="Student Administration";d=store.save(d);
        for(String role: new String[]{"STUDENT","STAFF","ADMIN"}) {
            User u=new User();u.name=role.substring(0,1)+role.substring(1).toLowerCase()+" Demo";u.email=role.toLowerCase()+"@queueflow.local";u.role=role;u.departmentId=d.id;
            u.passwordHash=new BCryptPasswordEncoder().encode(password);store.save(u);
        }
        for(String[] spec: new String[][]{{"TV","Transcript Verification"},{"BC","Bonafide Certificate"}}) {
            ServiceOffering s=new ServiceOffering();s.name=spec[1];s.code=spec[0];s.description="Bring your college ID and supporting documents.";s.departmentId=d.id;s=store.save(s);
            for(int day=1;day<=5;day++) {WorkingHours w=new WorkingHours();w.serviceId=s.id;w.dayOfWeek=day;w.opens=LocalTime.of(9,0);w.closes=LocalTime.of(17,0);w.breakStart=LocalTime.of(13,0);w.breakEnd=LocalTime.of(14,0);store.save(w);}
        }
        User staff=users.findByEmail("staff@queueflow.local").orElseThrow();
        for(int i=1;i<=2;i++) {Counter c=new Counter();c.name="Counter "+i;c.location="Administration Hall";c=store.save(c);store.flush();
            for(ServiceOffering s:store.all(ServiceOffering.class)) store.execute("insert into counter_services values (?1,?2)",c.id,s.id);
            store.execute("insert into staff_counters values (?1,?2)",c.id,staff.id);
        }
    }
}
