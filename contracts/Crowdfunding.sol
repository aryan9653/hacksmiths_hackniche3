// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Crowdfunding is ReentrancyGuard {
    enum CampaignStatus { Active, Completed, Failed, Refunded }

    struct Campaign {
        address creator;
        string title;           // Added for campaign title
        string description;     // Added for campaign description
        uint256 goal;
        uint256 deadline;
        uint256 totalFunds;
        CampaignStatus status;
        bool fundsReleased;
        string[] mediaHashes;   // Added for IPFS hashes of media files
        mapping(address => uint256) contributions;
        mapping(address => bool) refunded;
        address[] contributors;
        address escrow;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public campaignCount;

    // Events (unchanged except for context)
    event CampaignCreated(uint256 indexed campaignId, address indexed creator, uint256 goal, uint256 duration, uint256 deadline, address escrow);
    event Contributed(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event FundsReleased(uint256 indexed campaignId, address indexed creator, uint256 amount);
    event Refunded(uint256 indexed campaignId, address indexed contributor, uint256 amount);
    event CampaignStatusUpdated(uint256 indexed campaignId, CampaignStatus status);
    event DebugBalance(address indexed account, uint256 balance);
    event DebugEscrowBalance(uint256 indexed campaignId, address indexed escrow, uint256 balance);
    event DebugRefundAttempt(uint256 indexed campaignId, address indexed contributor, uint256 amount, bool success, string reason);
    event DebugReleaseFunds(uint256 indexed campaignId, string step);
    event DebugInitiateRefunds(uint256 indexed campaignId, string step);

    modifier onlyCreator(uint256 _campaignId) {
        require(msg.sender == campaigns[_campaignId].creator, "Not the creator");
        _;
    }

    modifier checkCampaignStatus(uint256 _campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        if (block.timestamp >= campaign.deadline && campaign.status == CampaignStatus.Active) {
            if (campaign.totalFunds >= campaign.goal) {
                campaign.status = CampaignStatus.Completed;
                emit CampaignStatusUpdated(_campaignId, CampaignStatus.Completed);
            } else {
                campaign.status = CampaignStatus.Failed;
                emit CampaignStatusUpdated(_campaignId, CampaignStatus.Failed);
            }
        }
        _;
    }

    // Updated createCampaign function
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _duration,
        string[] memory _mediaHashes
    ) external {
        require(_goal > 0, "Goal must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");

        uint256 campaignId = campaignCount++;
        Campaign storage campaign = campaigns[campaignId];
        campaign.creator = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.goal = _goal;
        campaign.deadline = block.timestamp + _duration;
        campaign.status = CampaignStatus.Active;
        campaign.fundsReleased = false;
        campaign.mediaHashes = _mediaHashes; // Store IPFS hashes
        campaign.escrow = address(new Escrow());

        emit CampaignCreated(campaignId, msg.sender, _goal, _duration, campaign.deadline, campaign.escrow);
        emit CampaignStatusUpdated(campaignId, CampaignStatus.Active);
        emit DebugBalance(msg.sender, address(msg.sender).balance);
    }

    // Updated getCampaign function
    function getCampaign(uint256 _campaignId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 goal,
        uint256 deadline,
        uint256 totalFunds,
        CampaignStatus status,
        bool fundsReleased,
        string[] memory mediaHashes,
        address escrow
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.creator,
            campaign.title,
            campaign.description,
            campaign.goal,
            campaign.deadline,
            campaign.totalFunds,
            campaign.status,
            campaign.fundsReleased,
            campaign.mediaHashes,
            campaign.escrow
        );
    }

    function contribute(uint256 _campaignId) external payable checkCampaignStatus(_campaignId) nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Active, "Campaign is not active");
        require(msg.value > 0, "Contribution must be greater than 0");

        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
        }
        campaign.contributions[msg.sender] += msg.value;
        campaign.totalFunds += msg.value;

        Escrow escrow = Escrow(payable(campaign.escrow));
        (bool success, ) = address(escrow).call{value: msg.value}("");
        require(success, "Transfer to escrow failed");
        emit DebugEscrowBalance(_campaignId, campaign.escrow, address(escrow).balance);

        emit Contributed(_campaignId, msg.sender, msg.value);

        if (campaign.totalFunds >= campaign.goal) {
            campaign.status = CampaignStatus.Completed;
            emit CampaignStatusUpdated(_campaignId, CampaignStatus.Completed);
        }
    }

    function releaseFunds(uint256 _campaignId) external onlyCreator(_campaignId) checkCampaignStatus(_campaignId) nonReentrant {
        emit DebugReleaseFunds(_campaignId, "Starting releaseFunds");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Completed, "Campaign not completed");
        require(!campaign.fundsReleased, "Funds already released");

        campaign.fundsReleased = true;
        uint256 amount = campaign.totalFunds;

        Escrow escrow = Escrow(payable(campaign.escrow));
        emit DebugEscrowBalance(_campaignId, campaign.escrow, address(escrow).balance);
        emit DebugReleaseFunds(_campaignId, "Before escrow release");
        try escrow.release(payable(campaign.creator), amount) {
            emit DebugReleaseFunds(_campaignId, "After escrow release");
            emit DebugBalance(campaign.creator, address(campaign.creator).balance);
            emit FundsReleased(_campaignId, campaign.creator, amount);
        } catch Error(string memory reason) {
            emit DebugReleaseFunds(_campaignId, string(abi.encodePacked("Release failed: ", reason)));
            revert(string(abi.encodePacked("Release failed: ", reason)));
        } catch {
            emit DebugReleaseFunds(_campaignId, "Release failed: Unknown error");
            revert("Release failed: Unknown error");
        }
    }

    function refund(uint256 _campaignId) external checkCampaignStatus(_campaignId) nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Failed, "Campaign not failed");
        require(campaign.contributions[msg.sender] > 0, "No contribution to refund");
        require(!campaign.refunded[msg.sender], "Already refunded");

        uint256 amount = campaign.contributions[msg.sender];
        Escrow escrow = Escrow(payable(campaign.escrow));
        emit DebugEscrowBalance(_campaignId, campaign.escrow, address(escrow).balance);
        try escrow.release(payable(msg.sender), amount) {
            campaign.refunded[msg.sender] = true;
            campaign.contributions[msg.sender] = 0;
            campaign.totalFunds -= amount;
            emit Refunded(_campaignId, msg.sender, amount);
            emit DebugBalance(msg.sender, address(msg.sender).balance);
            emit DebugRefundAttempt(_campaignId, msg.sender, amount, true, "Success");

            bool allRefunded = true;
            for (uint256 i = 0; i < campaign.contributors.length; i++) {
                address contributor = campaign.contributors[i];
                if (campaign.contributions[contributor] > 0 && !campaign.refunded[contributor]) {
                    allRefunded = false;
                    break;
                }
            }
            if (allRefunded) {
                campaign.status = CampaignStatus.Refunded;
                emit CampaignStatusUpdated(_campaignId, CampaignStatus.Refunded);
            }
        } catch Error(string memory reason) {
            emit DebugRefundAttempt(_campaignId, msg.sender, amount, false, reason);
            revert(string(abi.encodePacked("Refund failed: ", reason)));
        } catch {
            emit DebugRefundAttempt(_campaignId, msg.sender, amount, false, "Unknown error");
            revert("Refund failed: Unknown error");
        }
    }

    function initiateRefunds(uint256 _campaignId) external checkCampaignStatus(_campaignId) nonReentrant {
        emit DebugInitiateRefunds(_campaignId, "Starting initiateRefunds");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Failed, "Campaign not failed");
        require(campaign.totalFunds > 0, "No funds to refund");

        Escrow escrow = Escrow(payable(campaign.escrow));
        emit DebugInitiateRefunds(_campaignId, "Before refund loop");
        emit DebugEscrowBalance(_campaignId, campaign.escrow, address(escrow).balance);
        bool allRefunded = true;
        for (uint256 i = 0; i < campaign.contributors.length; i++) {
            address contributor = campaign.contributors[i];
            if (campaign.contributions[contributor] > 0 && !campaign.refunded[contributor]) {
                uint256 amount = campaign.contributions[contributor];
                emit DebugInitiateRefunds(_campaignId, string(abi.encodePacked("Attempting refund for contributor: ", string(abi.encodePacked(contributor)))));
                
                try escrow.release(payable(contributor), amount) {
                    campaign.refunded[contributor] = true;
                    campaign.contributions[contributor] = 0;
                    campaign.totalFunds -= amount;
                    emit Refunded(_campaignId, contributor, amount);
                    emit DebugBalance(contributor, address(contributor).balance);
                    emit DebugRefundAttempt(_campaignId, contributor, amount, true, "Success");
                } catch Error(string memory reason) {
                    allRefunded = false;
                    emit DebugRefundAttempt(_campaignId, contributor, amount, false, reason);
                    emit DebugInitiateRefunds(_campaignId, string(abi.encodePacked("Release failed: ", reason)));
                } catch {
                    allRefunded = false;
                    emit DebugRefundAttempt(_campaignId, contributor, amount, false, "Unknown error");
                    emit DebugInitiateRefunds(_campaignId, "Refund failed: Unknown error");
                }
            }
        }
        if (allRefunded) {
            campaign.status = CampaignStatus.Refunded;
            emit CampaignStatusUpdated(_campaignId, CampaignStatus.Refunded);
            emit DebugInitiateRefunds(_campaignId, "All refunds completed, status set to Refunded");
        } else {
            emit DebugInitiateRefunds(_campaignId, "Not all refunds completed");
        }
    }

    // Other unchanged functions
    function getContributors(uint256 _campaignId) external view returns (address[] memory) {
        return campaigns[_campaignId].contributors;
    }

    function getContribution(uint256 _campaignId, address _contributor) external view returns (uint256) {
        return campaigns[_campaignId].contributions[_contributor];
    }

    function isRefunded(uint256 _campaignId, address _contributor) external view returns (bool) {
        return campaigns[_campaignId].refunded[_contributor];
    }
}

contract Escrow {
    address public owner;

    event DebugBalance(address indexed account, uint256 balance);

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function release(address payable recipient, uint256 amount) external {
        require(msg.sender == owner, "Only owner can release funds");
        require(address(this).balance >= amount, "Insufficient balance in escrow");
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit DebugBalance(recipient, address(recipient).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}