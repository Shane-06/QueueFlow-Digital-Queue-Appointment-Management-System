package com.queueflow.service;
import com.queueflow.entity.*;
import com.queueflow.repository.Store;
import com.queueflow.security.Actor;
import org.springframework.stereotype.Service;
import java.time.Clock;
@Service
public class Events {
    private final Store db;private final Actor actor;private final Clock clock;
    public Events(Store db,Actor actor,Clock clock){this.db=db;this.actor=actor;this.clock=clock;}
    public void audit(String action,String details){AuditLog log=new AuditLog();log.actorId=actor.current().id;log.action=action;log.details=details;log.createdAt=clock.instant();db.save(log);}
    public void notify(Long userId,String message){Notification n=new Notification();n.userId=userId;n.message=message;n.createdAt=clock.instant();db.save(n);}
}
