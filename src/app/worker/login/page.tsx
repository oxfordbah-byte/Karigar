import WorkerLoginForm from "@/components/WorkerLoginForm";

export default function WorkerLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Worker login</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Log in with the mobile number and password Karigar set up for you to view and accept jobs.
      </p>
      <WorkerLoginForm />
      <p className="text-sm text-neutral-500 mt-4">
        Not a Karigar worker yet? Contact us to get set up — this login is for verified service
        providers only.
      </p>
    </div>
  );
}
