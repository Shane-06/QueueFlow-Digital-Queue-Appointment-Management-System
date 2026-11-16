package com.queueflow.repository;

import jakarta.persistence.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
@Transactional(readOnly = true)
public class Store {
    @PersistenceContext private EntityManager em;
    public <T> T get(Class<T> type, Long id) {
        T item = id == null ? null : em.find(type,id);
        if (item == null) throw new IllegalArgumentException("Record not found");
        return item;
    }
    public <T> List<T> all(Class<T> type) { return list(type,"from " + type.getSimpleName() + " order by id"); }
    public <T> List<T> list(Class<T> type, String jpql, Object... args) {
        TypedQuery<T> query=em.createQuery(jpql,type);
        for (int i=0;i<args.length;i++) query.setParameter(i+1,args[i]);
        return query.getResultList();
    }
    @Transactional public <T> T save(T item) { return em.merge(item); }
    @Transactional public void delete(Object item) { em.remove(em.contains(item)?item:em.merge(item)); }
    @Transactional public void lockWrites() {
        // One transaction-scoped lock keeps V1 operations consistent across app instances.
        em.createNativeQuery("select pg_advisory_xact_lock(724811)").getSingleResult();
    }
    public List<?> sql(String query,Object... args) {
        Query q=em.createNativeQuery(query);
        for(int i=0;i<args.length;i++) q.setParameter(i+1,args[i]);
        return q.getResultList();
    }
    @Transactional public void execute(String query,Object... args) {
        Query q=em.createNativeQuery(query);
        for(int i=0;i<args.length;i++) q.setParameter(i+1,args[i]);
        q.executeUpdate();
    }
    @Transactional public void flush() { em.flush(); }
}
