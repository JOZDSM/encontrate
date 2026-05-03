import { redirect } from "next/navigation";

export default function DashboardFavoritosRedirectPage() {
  redirect("/mis-cosas/favoritos");
}
