package com.schedulix.faculty_coordination.repository;

import com.schedulix.faculty_coordination.model.MeetingRequest;
import com.schedulix.faculty_coordination.model.MeetingRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository 
public interface MeetingRequestRepository extends JpaRepository<MeetingRequest, Long> {

    List<MeetingRequest> findByCollegeIdAndFacultyIdAndStatusOrderByIdDesc(UUID collegeId, Long facultyId, MeetingRequestStatus status);

    List<MeetingRequest> findByCollegeIdAndStudentIdOrderByIdDesc(UUID collegeId, Long studentId);
    
    List<MeetingRequest> findByCollegeIdAndFacultyIdOrderByIdDesc(UUID collegeId, Long facultyId);
}