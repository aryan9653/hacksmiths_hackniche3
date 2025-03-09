"use client";
import { getContract } from "@/lib/contract";
import { useEffect, useState } from "react";
import CampaignCard from "./CampaignCard";

// Updated Campaign interface with new fields
interface Campaign {
  campaignId: number;
  creator: string;
  title: string; // New field
  description: string; // New field
  goal: string;
  deadline: number;
  totalFunds: string;
  status: number;
  mediaHashes: string[]; // New field for IPFS hashes
}

const CampaignList: React.FC = () => {
  const [ongoingCampaigns, setOngoingCampaigns] = useState<Campaign[]>([]);
  const [pastCampaigns, setPastCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const contract = await getContract();
      const campaignCount = Number(await contract.campaignCount());
      const ongoing: Campaign[] = [];
      const past: Campaign[] = [];

      for (let i = 0; i < campaignCount; i++) {
        const campaign = await contract.getCampaign(i);
        const campaignData: Campaign = {
          campaignId: i,
          creator: campaign[0],
          title: campaign[1], // Assuming title is at index 1
          description: campaign[2], // Assuming description is at index 2
          goal: campaign[3].toString(),
          deadline: Number(campaign[4]),
          totalFunds: campaign[5].toString(),
          status: Number(campaign[6]),
          mediaHashes: campaign[8], // Assuming mediaHashes is at index 8
        };

        if (campaignData.status === 0) {
          ongoing.push(campaignData);
        } else {
          past.push(campaignData);
        }
      }

      setOngoingCampaigns(ongoing);
      setPastCampaigns(past);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const setupEventListeners = async () => {
      const contract = await getContract();
      contract.on(
        "CampaignStatusUpdated",
        (campaignId: number, newStatus: number) => {
          fetchData();
        }
      );
      contract.on(
        "Contributed",
        (campaignId: number, contributor: string, amount: string) => {
          fetchData();
        }
      );
    };

    setupEventListeners();

    const pollingInterval = setInterval(fetchData, 5000);

    return () => clearInterval(pollingInterval);
  }, []);

  if (loading)
    return <p className="text-center text-gray-600">Loading campaigns...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Ongoing Campaigns
      </h2>
      {ongoingCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mb-8">
          {ongoingCampaigns.map((campaign) => (
            <CampaignCard key={campaign.campaignId} {...campaign} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 mb-8">
          No ongoing campaigns found.
        </p>
      )}

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Past Campaigns
      </h2>
      {pastCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {pastCampaigns.map((campaign) => (
            <CampaignCard key={campaign.campaignId} {...campaign} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No past campaigns found.</p>
      )}
    </div>
  );
};

export default CampaignList;
