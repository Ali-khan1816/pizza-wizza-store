// Last edited by you@example.com @ 15/09/26 13:06.
import Layout from "@/components/layouts/layout";
import "@/styles/globals.css";
import { CartProvider } from "@/utils/ContextReducer";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CartProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </CartProvider>
    </ThemeProvider>
  );
}
