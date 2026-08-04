import LoginHero from "@/components/auth/LoginHero";
import TrustStats from "@/components/auth/TrustStats";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {

  const { token } =
    await params;

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left */}

        <div className="hidden lg:flex relative overflow-hidden p-16 text-white">

          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between w-full">

            <LoginHero />

            <TrustStats />

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center justify-center p-6">

          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">

            <div className="text-center mb-8">

              <h1 className="text-3xl font-bold">
                Reset Password
              </h1>

              <p className="text-slate-500 mt-2">
                Create a new secure password
              </p>

            </div>

            <ResetPasswordForm
              token={token}
            />

          </div>

        </div>

      </div>

    </div>
  );
}