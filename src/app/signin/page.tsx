import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="glass-panel mx-auto max-w-md text-center">
      <h1 className="mb-2 text-lg font-semibold tracking-tight text-rose-ink">
        Sign in
      </h1>
      <p className="mb-6 text-sm text-rose-muted">
        Sign in to save your study packs to your library and access them from any device.
        Configure Supabase Auth (email/password or OAuth) in your project to enable sign-in.
      </p>
      <Link
        href="/"
        className="btn-primary inline-flex"
      >
        Back to home
      </Link>
    </div>
  );
}
