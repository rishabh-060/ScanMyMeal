import "./globals.css";
import LayoutWrapper from "./layoutWrapper";

export const metadata = {
  title: "Scan My Meal",
  description: "Scan My Meal is a full-stack, real-time food ordering web application that allows users to browse food categories, add items to cart, place orders, and make payments. Admins can manage categories, subcategories, food items, and orders dynamically via an admin panel. This project also features secure authentication, profile management, and cloud-based media handling.",
  keywords: "scan my meal, food ordering, real-time, web application, full-stack, categories, subcategories, cart, orders, payments, admin panel, authentication, profile management, cloud media",
  openGraph: {
    title: "Scan My Meal",
    description: "A full-stack, real-time food ordering web application.",
    url: "https://scanmymeal.netlify.app/",
    siteName: "Scan My Meal",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/assets/favicon.png",
    apple: "/assets/favicon.png",
    android: "/assets/favicon.png",
    other: [
      { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16" },
      { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32" },
      { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "icon", url: "/favicon-128x128.png", sizes: "128x128" },
    ],
  },
};


export default function layout({ children }) {

  return (
    <html lang="en">
      <body className="select-none p-0 m-0">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
