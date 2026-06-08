import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/auth";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <TopBar isAdmin={participant.is_admin} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-3.5 sm:px-6 sm:pb-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
