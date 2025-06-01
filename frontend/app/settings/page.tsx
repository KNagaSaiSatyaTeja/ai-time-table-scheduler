import { Settings } from "@/components/settings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Time Table Scheduler",
  description: "Manage your application settings",
};

export default function SettingsPage() {
  return <Settings />;
}
