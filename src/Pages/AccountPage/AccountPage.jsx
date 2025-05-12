import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.css";
import EmojiShower from "../../Components/EmojiShower/EmojiShower";
import Modal from "../../Components/Modal/Modal";
import { useDispatch } from "react-redux";
import { setIsLogged } from "../../store/authSlice";
export default function AccountPage() {
  const [email, setEmail] = useState("");
  const modalRef = useRef();
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:3000/api/me", {
        credentials: "include",
      });
      if (!response.ok) {
        navigate("/auth?mode=login");
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      setEmail(data.email);
    }
    fetchData();
  }, []);

  const queryFn = async () => {
    const response = await fetch(
      "http://localhost:3000/get-favourite-sticker",
      {
        credentials: "include",
      }
    );
    const responseData = await response.json();
    return responseData;
  };

  const queryKey = email ? ["email", email] : ["email"];

  const { data: favourites, isLoading } = useQuery({ queryFn, queryKey });

  const dispatch = useDispatch();

  async function logout() {
    await fetch("http://localhost:3000/api/logout", {
      method: "POST",
      credentials: "include",
    });
    dispatch(setIsLogged(false));
    navigate("/auth?mode=login");
  }

  async function openModal(emoji) {
    setSelectedEmoji(emoji);
    modalRef.current.showModal();
  }

  return (
    <div className={styles.AccountPage}>
      <h2>Account Info</h2>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <Modal key={selectedEmoji} ref={modalRef} emoji={selectedEmoji} />
      <ul>
        {!isLoading && favourites && (
          <EmojiShower emojis={favourites} openModal={openModal} />
        )}
      </ul>
      <button className={styles.logoutButton} onClick={logout}>Log out</button>
    </div>
  );
}
