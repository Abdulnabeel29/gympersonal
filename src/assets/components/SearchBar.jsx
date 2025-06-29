import React from "react";
import { FaSearch } from "react-icons/fa";
import "./MemberTable.css";

const SearchBar = ({ onSearch }) => {
  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search by name or member ID..."
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
