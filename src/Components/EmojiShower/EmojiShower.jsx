import { Fragment, useState } from "react";
import styles from "./EmojiShower.module.css";
export default function EmojiShower({ emojis, openModal }) {
  function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <>
      <ul className={styles.emojis}>
        {emojis &&
          Object.keys(emojis).map((heading) => {
            return (
              <li className={styles.container} key={`${heading}`}>

                <h1 className={styles.heading}>{capitalize(heading)}</h1>
                <div className={styles.emojiRow}>
                  {emojis[heading].map((emoji, index) => {
                    return (
                      <button
                        onClick={() => openModal(emoji)}
                        className={styles.emoji}
                        key={`${heading}-${index}`}
                        dangerouslySetInnerHTML={{ __html: emoji.htmlCode[0] }}
                      ></button>
                    );
                  })}
                </div>
              </li>
            );
          })}
      </ul>
    </>
  );
}
