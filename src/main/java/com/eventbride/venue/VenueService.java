package com.eventbride.venue;

import com.eventbride.dto.ServiceDTO;
import com.eventbride.event_properties.EventPropertiesRepository;
import com.eventbride.otherService.OtherService;
import com.eventbride.otherService.OtherServiceRepository;
import com.eventbride.service.ServiceService;
import com.eventbride.user.User;
import com.eventbride.user.UserService;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VenueService {

	@Autowired
	private VenueRepository venueRepository;

	@Autowired
	private OtherServiceRepository otherServiceRepository;

	@Autowired
	private UserService userService;

	@Autowired
	private ServiceService serviceService;

	@Autowired
	private EventPropertiesRepository eventPropertiesRepository;

	@Transactional
	public List<Venue> getAllVenues() {
		return venueRepository.findAll().stream()
				.sorted(Comparator.comparing(
						os -> os.getUser().getPlan() == User.Plan.PREMIUM ? 0 : 1))
				.collect(Collectors.toList());
	}

	@Transactional
	public Optional<Venue> getVenueById(Integer id) {
		return venueRepository.findById(id);
	}

	@Transactional
	public List<Venue> getVenuesByUserId(Integer userId) {
		return venueRepository.findByUserId(userId);
	}

	@Transactional
	public List<Venue> getFilteredVenues(String city, Integer maxGuests, Double surface) {
		return venueRepository.findByFilters(
				city,
				maxGuests != null ? maxGuests : 0,
				surface != null ? surface : 0.0).stream()
				.sorted(Comparator.comparing(
						os -> os.getUser().getPlan() == User.Plan.PREMIUM ? 0 : 1))
				.collect(Collectors.toList());
	}

	public Venue save(Venue venue) throws IllegalArgumentException {
		Optional<User> user = userService.getUserById(venue.getUser().getId());
		if (user.isPresent()) {
			User existingUser = user.get();

			List<com.eventbride.service.Service> allServices = new ArrayList<>();
			List<OtherService> otherServices = otherServiceRepository.findByUserId(user.get().getId());
			List<Venue> venues = venueRepository.findByUserId(user.get().getId());

			allServices.addAll(otherServices);
			allServices.addAll(venues);

			allServices = allServices.stream().filter(s -> s.getAvailable()).toList();

			int slotsCount = allServices.size();

			String plan = existingUser.getPlan() == null ? "BASIC" : existingUser.getPlan().toString();

			if ("BASIC".equalsIgnoreCase(plan) && slotsCount >= 3) {
				throw new IllegalArgumentException("Has alcanzado el límite de venues en el plan BASIC.");
			} else if ("PREMIUM".equalsIgnoreCase(plan) && slotsCount >= 10) {
				throw new IllegalArgumentException("Has alcanzado el límite de venues en el plan PREMIUM.");
			}

			venue.setUser(user.get());
		} else {
			throw new IllegalArgumentException("Usuario no encontrado");
		}

		return venueRepository.save(venue);
	}

	@Transactional
	public Venue update(Integer id, Venue venue) {
		Venue existingVenue = venueRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Venue not found"));

		BeanUtils.copyProperties(venue, existingVenue, "id", "user");

		if (venue.getUser().getId() == null) {
			throw new RuntimeException("Falta el usuario al actualizar el venue.");
		}

		User user = userService.getUserById(venue.getUser().getId())
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		existingVenue.setUser(user);

		return venueRepository.save(existingVenue);
	}

	@Transactional
	public Venue updateVenue(Integer id, Venue updatedVenue) {
		Venue existingVenue = venueRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("No se ha encontrado ningún recinto con esa Id"));

		// Evita sobrescribir el ID ni el usuario original directamente
		BeanUtils.copyProperties(updatedVenue, existingVenue, "id", "user");

		if (updatedVenue.getUser().getId() == null) {
			throw new RuntimeException("Falta el usuario al actualizar el Venue.");
		}

		User user = userService.getUserById(updatedVenue.getUser().getId())
				.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

		existingVenue.setUser(user);

		return venueRepository.save(existingVenue);
	}

	@Transactional
	public void deleteVenue(Integer id) {
		Venue venue = venueRepository.findById(id)
				.orElseThrow(() -> new RuntimeException("Venue not found"));

		// Eliminar EventProperties asociadas al Venue
		eventPropertiesRepository.deleteByVenue(venue);

		// Eliminar Venue
		venueRepository.deleteById(id);
	}

	public void saveAll(List<Venue> venues) {
		venueRepository.saveAll(venues);
	}

}
