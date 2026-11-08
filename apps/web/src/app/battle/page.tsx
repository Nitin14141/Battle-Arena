import { redirect } from "next/navigation";

export default function LegacyBattlePage() {
  redirect("/battle-setup");
}
