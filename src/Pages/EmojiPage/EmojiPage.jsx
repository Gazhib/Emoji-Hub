import { useQuery } from "@tanstack/react-query";
import SearchBar from "../../Components/SearchBar/SearchBar";
import styles from "./EmojiPage.module.css";
import { useEffect, useRef, useState } from "react";
import Modal from "../../Components/Modal/Modal";
import EmojiShower from "../../Components/EmojiShower/EmojiShower";
export default function EmojiPage() {
  const queryFn = async () => {
    const response = await fetch("http://localhost:3000/getEmojis");
    const { byCategory, byAlphabet } = await response.json();
    setModifiedData(byCategory);
    return { byCategory, byAlphabet };
  };
  const queryKey = ["allEmojis"];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
  });

  const { byCategory, byAlphabet } = data || {};

  const lastChange = useRef();

  const [modifiedData, setModifiedData] = useState({});
  const [mode, setMode] = useState("category");

  const [selectedEmoji, setSelectedEmoji] = useState(null);

  const [open, setOpen] = useState(false);

  const modalRef = useRef(null);

  function openModal(emoji) {
    setSelectedEmoji(emoji);
    modalRef.current.showModal();
  }

  function typing(event) {
    if (lastChange.current) {
      clearTimeout(lastChange.current);
    }

    lastChange.current = setTimeout(() => {
      lastChange.current = null;
      const query = event.target.value.toLowerCase().split(" ");
      let toFilter;
      if (mode === "category") toFilter = byCategory;
      else toFilter = byAlphabet;

      setModifiedData(
        Object.fromEntries(
          Object.entries(toFilter).map(([key, emojis]) => [
            key,
            emojis.filter((emoji) =>
              query.every((word) => emoji.name.toLowerCase().includes(word))
            ),
          ])
        )
      );
    }, 500);
  }

  function setModeCategory() {
    setModifiedData(byCategory);
    setMode("category");
  }

  function setModeAlphabet() {
    setModifiedData(byAlphabet);
    setMode("alphabet");
  }

  return (
    <div className={styles.EmojiPage}>
      <SearchBar open={open} setOpen={setOpen} typing={typing} />
      {open && (
        <div className={styles.sortingDiv}>
          <h2>Sort by:</h2>
          <div>
            <button onClick={setModeCategory} className={styles.sortingButton}>
              Category
            </button>
            <button onClick={setModeAlphabet} className={styles.sortingButton}>
              Alphabet
            </button>
          </div>
        </div>
      )}
      <Modal key = {selectedEmoji} ref={modalRef} emoji={selectedEmoji} />
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <EmojiShower openModal={openModal} emojis={modifiedData} />
      )}
    </div>
  );
}
