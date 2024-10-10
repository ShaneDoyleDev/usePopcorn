import { useEffect } from "react";

export default function useKeypress(keycode, callback) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === keycode) callback();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [keycode, callback]);
}
