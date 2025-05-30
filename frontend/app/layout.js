import "./globals.css";
import LayoutWrapper from "./layoutWrapper";

export const metadata = {
  title: "Scan My Meal",
  description: "Scan My Meal is a full-stack, real-time food ordering web application that allows users to browse food categories, add items to cart, place orders, and make payments. Admins can manage categories, subcategories, food items, and orders dynamically via an admin panel. This project also features secure authentication, profile management, and cloud-based media handling.",
  icons: {
    icon: "/favicon.ico",
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
