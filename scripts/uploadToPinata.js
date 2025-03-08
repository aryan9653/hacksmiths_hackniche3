require("dotenv").config(); // Load .env variables
const fs = require("fs");
const path = require("path");
const pinataSDK = require("@pinata/sdk");

// Ensure environment variables are correctly loaded
if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
    console.error("❌ Pinata API credentials not found! Make sure .env file is set up.");
    process.exit(1);
}

// Initialize Pinata
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

// Define the folder containing files
const uploadsFolder = "./uploads";  // Change this if needed

// Function to upload all files in the folder
async function uploadAllFiles() {
    try {
        // Check if folder exists
        if (!fs.existsSync(uploadsFolder)) {
            console.error(`❌ Uploads folder not found: ${uploadsFolder}`);
            process.exit(1);
        }

        // Read files from the uploads folder
        const files = fs.readdirSync(uploadsFolder);

        if (files.length === 0) {
            console.log("📂 No files found in the uploads folder.");
            return;
        }

        console.log(`🚀 Found ${files.length} files. Uploading...`);

        // Loop through and upload each file
        for (const file of files) {
            const filePath = path.join(uploadsFolder, file);
            if (fs.lstatSync(filePath).isFile()) {
                try {
                    const readableStream = fs.createReadStream(filePath);
                    const options = {
                        pinataMetadata: { name: file },
                        pinataOptions: { cidVersion: 0 }
                    };

                    const result = await pinata.pinFileToIPFS(readableStream, options);
                    console.log(`✅ Uploaded ${file}: ${result.IpfsHash}`);
                } catch (uploadError) {
                    console.error(`❌ Error uploading ${file}:`, uploadError);
                }
            }
        }

    } catch (error) {
        console.error("❌ Error processing files:", error);
    }
}

// Start upload
uploadAllFiles();
