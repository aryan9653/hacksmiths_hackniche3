"use client";

import React, { useState } from "react";
import { ArrowLeft, User, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { DockDemo } from "./components/dock";
const App: React.FC = () => {
  const [sidebar, setSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const campaigns = [
    {
      id: 1,
      name: "Education for All",
      image: "/campaign1.jpg",
      raised: "$5,000",
      target: "$10,000",
      donors: 120,
    },
    {
      id: 2,
      name: "Food for Needy",
      image: "/campaign2.jpg",
      raised: "$7,200",
      target: "$15,000",
      donors: 200,
    },
    {
      id: 3,
      name: "Healthcare Support",
      image: "/campaign1.jpg",
      raised: "$3,500",
      target: "$8,000",
      donors: 80,
    },
    {
      id: 4,
      name: "Disaster Relief",
      image: "/campaign2.jpg",
      raised: "$12,000",
      target: "$20,000",
      donors: 300,
    },
  ];
  return (
    <div className="bg-[#0d0d23] text-white min-h-screen py-6 px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button className="text-white hover:bg-gray-700 p-2 rounded-lg">
            <ArrowLeft size={24} />
          </button>
          <h1
            className="text-3xl font-bold cursor-pointer"
            onClick={() => setSidebar(!sidebar)}
          >
            Charity
          </h1>
        </div>
        <input
          type="text"
          placeholder="🔍 Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-lg px-5 py-3 text-lg text-white bg-gray-300 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="bg-gray-800 p-3 rounded-full cursor-pointer hover:bg-gray-700">
          <User size={24} />
        </div>
      </div>
      {/* Donation Stats Section */}
      <div className="flex justify-center gap-5">
        <div className="grid grid-cols-3 gap-5 mb-8"></div>
        {[
          { title: "Donation Today", amount: "$8,755" },
          { title: "Total Donor", amount: "3,544" },
          { title: "Average Donation", amount: "$484.70" },
        ].map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-gray-900 rounded-xl shadow-lg text-center"
          >
            <p className="text-lg text-gray-400">{stat.title}</p>
            <p className="text-3xl font-bold">{stat.amount}</p>
          </div>
        ))}
      </div>

      {/* Ongoing Campaigns */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Ongoing Campaigns</h2>
        <button
          className="flex items-center gap-2 px-5 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
          onClick={() => router.push("/create-campaign")}
        >
          <PlusCircle size={22} /> Add New Campaign
        </button>
      </div>
      <div className="grid grid-cols-4 gap-6 mb-8">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-gray-900 p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl"
            onClick={() => router.push(`/campaigns`)}
          >
            <img
              src={campaign.image}
              alt={campaign.name}
              className="h-40 w-full object-cover rounded mb-4"
            />
            <p className="text-lg font-semibold">{campaign.name}</p>
            <div className="flex gap-3 justify-between">
              <button className="mt-3 p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700">
                Update Campaign
              </button>
              <button className="mt-3 px-9 p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700">
                See Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Past Campaigns */}
      <h2 className="text-2xl font-semibold mb-6">Past Campaigns</h2>
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-gray-900 p-6 rounded-xl shadow-lg">
            <div className="h-40 bg-gray-700 rounded mb-4"></div>
            <p className="text-lg font-semibold">Past Campaign {index + 1}</p>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 flex justify-center w-auto mb-8">
        <DockDemo/>
      </div>
    </div>
  );
};

export default App;
