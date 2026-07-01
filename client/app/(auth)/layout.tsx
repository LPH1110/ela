import Logo from "@/components/layout/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-muted/30">
      <div className="mb-8">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {children}
      </div>
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ELA Platform. All rights reserved.</p>
      </div>
    </div>
  );
}
