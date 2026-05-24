import "./globals.css";

export const metadata = {
  title: "House Price Predictor",
  description: "A web app to predict house prices based on various factors for REDFIN properties.",
};

// src/app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
