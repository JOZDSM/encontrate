import { SignupForm } from "@/app/(main)/signup/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start px-4 pt-12 pb-24 md:pt-12 md:pb-10">
      <div className="flex w-full flex-col items-center gap-6">
        <SignupForm />
      </div>
    </div>
  );
}

