import React from "react";
import { Link } from "react-router";
import "./Navbar.css"; // 🔥 Import the CSS

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">🌍 LandChain</div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/addTrustedMember">Add Trusted Member</Link></li>
        <li><Link to="/mintLand">Mint Land</Link></li>
        <li><Link to="/transferLand">Transfer Land</Link></li>
        <li><Link to="/PostLand">PostLand</Link></li>
        <li><Link to="/BuyLand">BuyLand</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
