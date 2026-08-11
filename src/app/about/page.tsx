import type { Metadata } from "next";
import AboutView from "./about-view";

export const metadata: Metadata = {
  title: "About FandomWear",
  description:
    "FandomWear makes premium oversized tees with original artwork inspired by the games, movies, anime, and comics you grew up loving.",
};

export default function AboutPage() {
  return <AboutView />;
}
