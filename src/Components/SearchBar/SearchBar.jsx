import { useState } from "react";
import styles from "./SearchBar.module.css";
export default function SearchBar({ typing, open, setOpen }) {
  return (
    <div className={styles.searchContainer}>
      <button
        style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
        className={styles.toggleButton}
        onClick={() => setOpen((prev) => !prev)}
      >
        >
      </button>
      <div className={styles.SearchBar}>
        <input
          className={styles.searchInput}
          placeholder="Search..."
          onChange={typing}
        />
      </div>
    </div>
  );
}
