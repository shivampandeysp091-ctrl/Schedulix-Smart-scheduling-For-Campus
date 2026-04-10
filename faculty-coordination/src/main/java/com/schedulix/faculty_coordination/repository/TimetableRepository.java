package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.DayOfWeek;
import com.schedulix.faculty_coordination.model.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional; 
import java.util.UUID;

@Repository
public interface TimetableRepository extends JpaRepository<TimetableEntry, Long> {

    void deleteByCollegeIdAndFacultyId(UUID collegeId, Long facultyId);

    Optional<TimetableEntry> findFirstByCollegeIdAndFacultyIdAndDayAndStartTimeLessThanEqualAndEndTimeGreaterThan(
            UUID collegeId, Long facultyId, DayOfWeek day,
            LocalTime timeStartQuery, LocalTime timeEndQuery
    );

    List<TimetableEntry> findByCollegeIdAndFacultyId(UUID collegeId, Long facultyId);

    List<TimetableEntry> findByCollegeIdAndFacultyIdAndDay(UUID collegeId, Long facultyId, DayOfWeek day);
}