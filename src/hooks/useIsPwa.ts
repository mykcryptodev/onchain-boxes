import { useEffect, useState } from "react";

const useIsPwa = () => {
  const [isPwa, setIsPwa] = useState<boolean>(false);

  const isStandaloneCheck = () => {
    if (typeof window !== "undefined") {
      setIsPwa(window.matchMedia("(display-mode: standalone)").matches);
    }
  }

  useEffect(() => {
    void isStandaloneCheck();
  }, []);

  return isPwa;
}

export default useIsPwa;