import type { Metadata } from "next";
import ContactView from "./contact-view";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the FandomWear team about orders, drops, or anything else.",
};

export default function ContactPage() {
  return <ContactView />;
}
