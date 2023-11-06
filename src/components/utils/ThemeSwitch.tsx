import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { type FC,useEffect, useState } from 'react';

interface Props {
  toggle?: boolean;
}

const ThemeSwitch: FC<Props> = ({ toggle }) => {
  const [mounted, setMounted] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  // check if the user's system prefers dark mode
  // if so, set the theme to dark
  // useEffect(() => {
  //   if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  //     setTheme("dark");
  //   }
  // }, [setTheme]);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, []);

  if (!mounted) {
    return null
  }

  if (toggle) {
    return (
      <input 
        type="checkbox" 
        className="toggle toggle-lg" checked={theme === "light"}
        onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
      />
    )
  }

  return (
    <div className="mx-auto w-full justify-center flex">
      <label className="swap swap-rotate">
        <input type="checkbox" checked={theme === "light"} onChange={() => setTheme(theme === "dark" ? "light" : "dark")} />
        <SunIcon className="swap-on sm:w-10 sm:h-10 w-8 h-8 stroke-2" />
        <MoonIcon className="swap-off sm:w-10 sm:h-10 w-8 h-8 stroke-2" />
      </label>
    </div>
  )
}

export default ThemeSwitch;