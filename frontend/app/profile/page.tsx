import { Profile } from "@/components/profile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - Time Table Scheduler",
  description: "Manage your profile settings",
};

export default function ProfilePage() {
  return <Profile />;
}
