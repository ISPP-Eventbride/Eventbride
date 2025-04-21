package com.eventbride.rating;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Integer> {
    List<Rating> findByOtherService_Id(Integer otherServiceId, Pageable pageable);

    List<Rating> findByVenue_Id(Integer venueId, Pageable pageable);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.otherService.id = :serviceId")
    Double findAverageStarsByOtherServiceId(@Param("serviceId") Long serviceId);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.venue.id = :venueId")
    Double findAverageStarsByVenueId(@Param("venueId") Long venueId);

}
