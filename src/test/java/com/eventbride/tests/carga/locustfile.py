from locust import HttpUser, task, between


class WebsiteUser(HttpUser):
    wait_time = between(1, 3)  

    @task
    def load_homepage(self):
        self.client.get("/")  
