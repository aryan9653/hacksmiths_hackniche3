import UserContributions from "@/components/UserContributions";

export default function Contributions() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Your Contributions
      </h1>
      <UserContributions />
    </div>
  );
}
