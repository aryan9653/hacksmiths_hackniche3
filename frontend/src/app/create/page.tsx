"use client";
import CreateCampaignForm from "@/components/CreateCampaignForm";

export default function CreateCampaign() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Create a New Campaign
      </h1>
      <CreateCampaignForm />
    </div>
  );
}
