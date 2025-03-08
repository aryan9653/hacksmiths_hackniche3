"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const campaigns = [
  {
    id: 1,
    title: "Save the Rainforest",
    description: "Join us in protecting the world's rainforests and wildlife.",
    image: "/rainforest.png", 
  },
  {
    id: 2,
    title: "Education for All",
    description: "Providing education resources to underprivileged children.",
    image: "/education.jpg",
  },
  {
    id: 3,
    title: "Clean Water Initiative",
    description: "Ensuring access to clean drinking water for all communities.",
    image: "/clean-water.jpeg",
  },
];

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900">
        Our Campaigns
      </h1>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-lg border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="hover:shadow-2xl transition duration-300 bg-white rounded-lg overflow-hidden"
            >
              <CardHeader className="p-0">
                <Image
                  src={campaign.image}
                  alt={campaign.title}
                  width={400}
                  height={300}
                  className="w-full h-52 object-cover"
                />
              </CardHeader>
              <CardContent className="p-5">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  {campaign.title}
                </CardTitle>
                <p className="text-gray-700 mt-2">{campaign.description}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full text-lg">
            No campaigns found.
          </p>
        )}
      </div>
    </div>
  );
}
