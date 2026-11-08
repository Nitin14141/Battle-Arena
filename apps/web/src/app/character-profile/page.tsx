import { redirect } from "next/navigation";

export default function LegacyCharacterProfilePage() {
  redirect("/character-explorer");
}
