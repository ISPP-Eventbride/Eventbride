package com.eventbride.tests.notifications;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

     @Test
    @WithMockUser(username = "alice123")
    void testGetAllNotificationsForUser() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", is(not(empty()))))
                .andExpect(jsonPath("$[0].subject", is(notNullValue())))
                .andExpect(jsonPath("$[0].message", is(notNullValue())));
    }

    @Test
    @WithMockUser(username = "nonExistentUser")
    void testGetAllNotificationsForNonExistentUser() throws Exception {
        mockMvc.perform(get("/api/notifications"))
                .andExpect(status().isInternalServerError()); // The SecurityException is properly thrown and produces a
                                                              // 500 error
    }
}