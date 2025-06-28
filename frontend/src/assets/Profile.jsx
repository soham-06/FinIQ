import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token"); // Assuming token is stored here
        const response = await axios.get("http://localhost:2100/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-error">User not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={user.pfp || "https://via.placeholder.com/150"} // Fallback profile picture
          alt={`${user.name}'s profile`}
          className="profile-picture"
        />
        <h1>{user.name}</h1>
        <p>Email: {user.email}</p>
        <p>Date of Birth: {new Date(user.dob).toLocaleDateString()}</p> {/* Format date */}
      </div>
    </div>
  );
};

export default Profile;
