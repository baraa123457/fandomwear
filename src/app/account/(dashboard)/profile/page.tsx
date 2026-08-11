import type { Metadata } from "next";
import ProfileView from "./profile-view";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false, follow: true },
};

export default function ProfilePage() {
  return <ProfileView />;
}
