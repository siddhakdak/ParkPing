import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata={
  title:"ParkPing — Contact Vehicle Owners Privately",
  description:"A privacy-first QR contact platform for cars, bikes and EVs.",
  manifest:"/manifest.webmanifest"
};

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body>{children}</body></html>;
}