import { AuthGate } from "@/components/AuthGate";
import { TimeShell } from "@/components/TimeShell";

export default function TimePanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <TimeShell>{children}</TimeShell>
    </AuthGate>
  );
}
