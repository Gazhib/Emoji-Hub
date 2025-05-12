import { forwardRef, useState, useEffect } from "react";
import styles from "./Modal.module.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
const Modal = forwardRef(function Modal({ emoji }, ref) {
  const [isFavourite, setIsFavourite] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const queryFn = async () => {
    if (!emoji) return;
    const response = await fetch("http://localhost:3000/is-favourite-sticker", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emoji }),
    });
    setIsFavourite(response.status === 201);
    return response.status;
  };

  const queryKey = emoji ? ["emoji", emoji.name] : ["emoji"];

  const { isLoading } = useQuery({ queryFn, queryKey });

  async function addToFavourites() {
    const response = await fetch(
      "http://localhost:3000/add-favourite-sticker",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      }
    );
    const responseData = await response.json();
    setIsFavourite(true);
  }

  async function deleteFromFavourites() {
    const response = await fetch(
      "http://localhost:3000/delete-favourite-sticker",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      }
    );
    const responseData = await response.json();
    setIsFavourite(false);
    queryClient.invalidateQueries(["email"])
    ref.current.close()
  }


  return (
    <dialog ref={ref} className={styles.Modal}>
      {emoji && (
        <>
          <span dangerouslySetInnerHTML={{ __html: emoji.htmlCode[0] }} />
          <h1>{emoji.name}</h1>
          <h2>Category: {emoji.category}</h2>
          <h2>Group: {emoji.group}</h2>
          {isLoading && "Loading..."}
          {!isFavourite && !isLoading && (
            <button onClick={() => addToFavourites()}>Add to favourites</button>
          )}
          {isFavourite && !isLoading && (
            <button onClick={() => deleteFromFavourites()}>Delete from favourites</button>
          )}
          <form method="dialog">
            <button>Close</button>
          </form>
        </>
      )}
    </dialog>
  );
});

export default Modal;
