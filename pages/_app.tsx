import "animate.css";
import "../styles/fonts.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { persistor, store } from "../features/store";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";
import { auth } from "../libs/Firebase";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
