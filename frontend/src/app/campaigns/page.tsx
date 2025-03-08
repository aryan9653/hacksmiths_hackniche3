"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white px-6 py-10">
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Explore Our Campaigns
      </motion.h1>

      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="🔍 Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-2 text-lg text-white bg-gray-800 border border-gray-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Campaigns Grid */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
                  <CardTitle className="text-2xl font-semibold text-black">
                    {campaign.title}
                  </CardTitle>
                  <p className="text-gray-900 mt-2">{campaign.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-full text-lg">
            No campaigns found.
          </p>
        )}
      </div>
    </div>
  );
}
