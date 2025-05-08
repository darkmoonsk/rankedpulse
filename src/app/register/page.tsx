import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Create an account</h1>
          <p className="text-gray-600">Join RankedPulse to get started</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <SignUp routing="hash" />
        </div>
      </div>
    </div>
  );
}
