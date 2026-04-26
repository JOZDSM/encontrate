import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start px-4 pt-24 pb-24 md:pt-32 md:pb-10">
      <div className="flex w-full flex-col items-center gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
