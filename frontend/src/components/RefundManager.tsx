"use client";
import { getContract } from "@/lib/contract";
import { useEffect, useRef } from "react";

const RefundManager: React.FC = () => {
  const isCheckingRef = useRef(false);
  const refundedCampaignsRef = useRef(new Set<number>());

  useEffect(() => {
    const checkAndInitiateRefunds = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;
      try {
        const contract = await getContract();
        const campaignCount = Number(await contract.campaignCount());

        for (let i = 0; i < campaignCount; i++) {
          if (refundedCampaignsRef.current.has(i)) continue;

          const [
            creator,
            goal,
            deadline,
            totalFunds,
            status,
            fundsReleased,
            escrow,
          ] = await contract.getCampaign(i);
          const currentTime = Math.floor(Date.now() / 1000);

          if (
            Number(deadline) < currentTime &&
            Number(totalFunds) > 0 &&
            Number(totalFunds) < Number(goal) &&
            Number(status) !== 3
          ) {
            // const escrowBalance = await contract.provider.getBalance(escrow);
            // console.log(
            //   `Escrow balance for campaign ${i}: ${escrowBalance.toString()}`
            // );
            // if (Number(escrowBalance) < Number(totalFunds)) {
            //   console.error(`Insufficient funds in escrow for campaign ${i}`);
            //   continue;
            // }

            try {
              console.log(
                `Initiating refund for campaign ${i}. Awaiting confirmation...`
              );
              const tx = await contract.initiateRefunds(i, {
                gasLimit: 5000000,
              });
              const receipt = await tx.wait();
              console.log(
                `Refund transaction receipt for campaign ${i}:`,
                receipt
              );
              if (receipt.status === 1) {
                console.log(`Refunds successfully initiated for campaign ${i}`);
                refundedCampaignsRef.current.add(i);
              } else {
                console.error(`Refund transaction failed for campaign ${i}`);
              }
            } catch (error) {
              console.error(
                `Error initiating refunds for campaign ${i}:`,
                error
              );
            }
          }
        }
      } catch (error) {
        console.error("Error in RefundManager:", error);
      }
      isCheckingRef.current = false;
    };

    checkAndInitiateRefunds();
    const pollingInterval = setInterval(checkAndInitiateRefunds, 5000);
    return () => clearInterval(pollingInterval);
  }, []);

  return null;
};

export default RefundManager;
