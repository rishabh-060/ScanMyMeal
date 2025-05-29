import "./globals.css";
import LayoutWrapper from "./layoutWrapper";

export const metadata = {
  title: "Scan My Meal",
  description: "Scan My Meal is a food ordering web app",
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
