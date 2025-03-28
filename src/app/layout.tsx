'use client'

import packageCfg from "@/../package.json";
import '@mantine/core/styles.css';
import './globals.css';
import { Alert, ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import theme from '@/lib/theme';
import Footer from "@/components/Footer/Footer";
import { useOnline } from "./hooks";
import { AlertCircle } from "react-feather";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const online = useOnline();

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <title>MAC 24 Hour Race</title>
        <meta charSet="UTF-8" />
        <meta name="description" content={packageCfg.description} />
        <meta name="keywords" content="Race, 24 hour race, MAC, Milnerton Aquatic Club" />
        <meta name="author" content="Ryan Gray <https://github.com/Ch35>" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark" theme={theme}>
          {!online && (
            <Alert className="alertOffline" variant="light" color="red" icon={<AlertCircle />}>
              <div>You are offline!</div>
              Please check your connection and try restarting the page.
            </Alert>
          )}
          <main>
            {children}
          </main>
          <Footer />
        </MantineProvider>
      </body>
    </html>
  );
}
