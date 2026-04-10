package com.schedulix.faculty_coordination.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabasePatcher {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ContextRefreshedEvent.class)
    public void patchDatabase() {
        try {
            // Drop old unique constraint on department name that blocks SaaS architecture
            jdbcTemplate.execute("ALTER TABLE IF EXISTS departments DROP CONSTRAINT IF EXISTS ukj6cwks7xecs5jov19ro8ge3qk");
            System.out.println("✅ DATABASE PATCH: Successfully dropped old unique constraint on departments.name!");
        } catch (Exception e) {
            System.out.println("⚠️ DATABASE PATCH: Could not drop constraint (it may already be gone). " + e.getMessage());
        }
    }
}
