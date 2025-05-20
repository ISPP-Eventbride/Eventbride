import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/api";
import axios from "axios";

export const useCurrentUser = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt");

    const validateToken = async () => {
      try {
        await axios.get("/api/auth/validate-token", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return true;
      } catch {
        return false;
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) {
          localStorage.removeItem("jwt");
          localStorage.removeItem("user");
          setCurrentUser(null);
          return;
        }

        const data = await getCurrentUser({ token });
        setCurrentUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        console.error("Error fetching current user:", error);
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  return { currentUser, loading, setCurrentUser };
};
