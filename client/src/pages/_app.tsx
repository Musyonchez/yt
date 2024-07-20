import "@/styles/globals.css";
import "@/styles/waves.css";
import "@/styles/circle.css";


import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
