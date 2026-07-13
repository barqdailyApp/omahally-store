"use client";

import { useEffect, useRef, useState } from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { HEADER } from "../config-layout";
import styles from "./header-ticker.module.css";

// Minimum number of copies per set so content always fills wide screens
const MIN_COPIES = 6;
// Gap between items in px
const ITEM_GAP = 40;

interface Props {
  text: string;
}

export default function HeaderTicker({ text }: Props) {
  const theme = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setARef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(MIN_COPIES);
  const [setWidth, setSetWidth] = useState<number | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const setA = setARef.current;
    if (!wrapper || !setA) return;

    const measure = () => {
      const wrapperW = wrapper.offsetWidth;
      const singleItemW = setA.firstElementChild
        ? (setA.firstElementChild as HTMLElement).offsetWidth + ITEM_GAP
        : 0;

      if (singleItemW === 0) return;

      // How many copies needed so one full set overflows the wrapper
      const needed = Math.ceil(wrapperW / singleItemW) + 2;
      const finalCopies = Math.max(needed, MIN_COPIES);
      setCopies(finalCopies);

      // Recalculate set width after copies are updated
      // We rely on the next render to measure; use rAF for accuracy
      requestAnimationFrame(() => {
        if (setARef.current) {
          setSetWidth(setARef.current.offsetWidth);
        }
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [text]);

  const animStyle = setWidth
    ? ({ "--ticker-translate": `-${setWidth}px` } as React.CSSProperties)
    : undefined;

  const renderItems = (prefix: string) =>
    Array.from({ length: copies }).map((_, i) => (
      <span key={`${prefix}-${i}`} className={styles.item}>
        {text}
      </span>
    ));

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{
        height: HEADER.H_TICKER,
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <div
        className={styles.track}
        style={animStyle}
        aria-hidden="false"
        aria-label={text}
        role="marquee"
      >
        {/* Set A — measured to derive exact translate distance */}
        <div ref={setARef} className={styles.set}>
          {renderItems("a")}
        </div>
        {/* Set B — identical clone that follows seamlessly */}
        <div className={styles.set} aria-hidden="true">
          {renderItems("b")}
        </div>
      </div>
    </div>
  );
}
