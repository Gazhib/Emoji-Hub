import { Link } from "react-router-dom";
import styles from "./Header.module.css";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsLogged } from "../../store/authSlice";
export default function Header() {
  const isLogged = useSelector((state) => state.auth.isLogged);
  const dispatch = useDispatch();
  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:3000/api/me", {
        credentials: "include",
      });
      const isLoggedin = await response.json();
      if (isLoggedin && isLoggedin.email) dispatch(setIsLogged(true));
      else dispatch(setIsLogged(true));
    }
    fetchData();
  }, [isLogged]);
  return (
    <header className={styles.Header}>
      <div className={styles.left}>
        <Link to="/">Home</Link>
      </div>
      <div className={styles.right}>
        <Link to="/emojis">Emojis</Link>
        <Link to={isLogged ? "/account" : "/auth?mode=login"}>
          {isLogged ? "My account" : "Log in / Register"}
        </Link>
      </div>
    </header>
  );
}
