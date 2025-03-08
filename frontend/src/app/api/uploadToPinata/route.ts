import PinataSDK from "@pinata/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

// Initialize Pinata with environment variables
const pinata = new PinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

// Disable default body parser for handling multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  try {
    const uploadedHashes: string[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const readableStream = Readable.from(buffer);

      const result = await pinata.pinFileToIPFS(readableStream, {
        pinataMetadata: { name: file.name },
        pinataOptions: { cidVersion: 0 },
      });

      uploadedHashes.push(result.IpfsHash);
    }

    return NextResponse.json({ ipfsHashes: uploadedHashes });
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return NextResponse.json(
      { error: "Failed to upload to Pinata" },
      { status: 500 }
    );
  }
}
