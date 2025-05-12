import { useQuery } from "@tanstack/react-query";
import styles from "./LandingPage.module.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
export default function LandingPage() {
  const queryKey = ["emojis"];
  function randomIndex(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  const queryFn = async () => {
    const response = await fetch(
      "https://emojihub.yurace.pro/api/all/category/smileys-and-people"
    );
    const responseData = await response.json();
    const data = [
      responseData[randomIndex(0, responseData.length)],
      responseData[randomIndex(0, responseData.length)],
      responseData[randomIndex(0, responseData.length)],
    ];
    return data;
  };
  const { data: randomEmojis } = useQuery({
    queryKey,
    queryFn,
    staleTime: Infinity,
  });

  return (
    <div className={styles.LandingPage}>
      <header>
        Welcome to the Emoji viewer application, where you can find and use
        different types of emojis
      </header>
      <Link to="/emojis">Get Started</Link>
      <ul className={styles.emojiList}>
        {randomEmojis &&
          randomEmojis.map((emoji, index) => {
            return (
              <li
                style={
                  index === 0
                    ? { transform: "rotate(-45deg) translateY(10rem)" }
                    : index === 2
                    ? { transform: "rotate(45deg) translateY(10rem)" }
                    : {}
                }
                className={styles.emoji}
                key={index}
                dangerouslySetInnerHTML={{ __html: emoji.htmlCode[0] }}
              />
            );
          })}
      </ul>
    </div>
  );
}
