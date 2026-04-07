import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "StudyBuddy",
  description: "Summarize, quiz, and review anything you read or watch."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold shadow-lg shadow-brand-500/40">
                SB
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight">StudyBuddy</div>
                <p className="text-xs text-slate-400">
                  Turn anything into summaries, quizzes, and flashcards.
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-10 border-t border-slate-800 pt-4 text-xs text-slate-500">
            Built with Next.js and Supabase.
          </footer>
        </div>
      </body>
    </html>
  );
}
