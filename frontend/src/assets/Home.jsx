import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // Importing Auth Context
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the user's details from the Auth context
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown toggle

  const handleLogout = () => {
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile"); // Replace with the correct profile route
  };

  return (
    <div className="home-wrapper">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="navbar-left">FinIQ</div>
        <nav className="navbar-center">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <div
          className="navbar-right profile-dropdown"
          onClick={() => setDropdownOpen(!dropdownOpen)} // Toggle dropdown on click
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
            alt="Profile"
            className="profile-pic"
          />
          <div className="profile-name">{user?.name || "Profile"} ▾</div>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleProfile}>Profile</button>
              <button onClick={handleLogout}>Sign out</button>
            </div>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="hero">
        <div className="hero-content">
          <h1>Free and open</h1>
          <h2>Stock market and financial education</h2>
          <p>
            A structured, easy-to-follow path to help you understand markets.
            Modules and tests available — no ads, no signup required.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => navigate("/modules")}>
              Modules
            </button>
            <button className="btn btn-outline" onClick={() => navigate("/tests")}>
              Tests
            </button>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://zerodha.com/varsity/img/hero.svg"
            alt="Hero"
          />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Email:
          example@example.com
        </p>
      </footer>
    </div>
  );
}

export default Home;
