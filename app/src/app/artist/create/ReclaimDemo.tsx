import React, { useState } from "react";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";

interface SocialMedia {
  social: string;
}

const APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APP_ID;
const APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET;

async function initializeReclaim(PROVIDER_ID: string) {
  const reclaimProofRequest = await ReclaimProofRequest.init(
    APP_ID,
    APP_SECRET,
    PROVIDER_ID
  );
  return reclaimProofRequest;
}

async function generateRequestUrl(reclaimProofRequest: any) {
  const requestUrl = await reclaimProofRequest.getRequestUrl();
  console.log("Request URL:", requestUrl);
  return requestUrl;
}

async function startVerificationSession(
  reclaimProofRequest: any,
  onSuccess: any,
  onFailure: any
) {
  await reclaimProofRequest.startSession({
    onSuccess: onSuccess,
    onFailure: onFailure,
  });
}

const getAPPID = (social: string) => {
  switch (social) {
    case "instagram":
      return "a7dcfc29-25a6-44ca-8e7b-a3099044bc63";
    case "x":
      return "2523321f-f61d-4db3-b4e6-e665af5efdc1";
    case "youtube":
      return "2cc41f51-ee6f-43a1-b2a5-742665c0660f";
    case "spotify":
      return "31d6ad77-b726-4726-a5b3-330e16482ab6";
    default:
      return null;
  }
};

function ReclaimDemo({ social }: SocialMedia) {
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [proofs, setProofs] = useState(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setup = async () => {
    try {
      setIsLoading(true);
      const PROVIDER_ID = getAPPID(social);

      if (!PROVIDER_ID) {
        setStatus("Invalid social media platform.");
        setIsLoading(false);
        return;
      }

      setStatus("Initializing Reclaim...");
      const reclaimProofRequest = await initializeReclaim(PROVIDER_ID);
      const url = await generateRequestUrl(reclaimProofRequest);
      setRequestUrl(url);
      setStatus("Ready to start verification");

      await startVerificationSession(
        reclaimProofRequest,
        (proofs: any) => {
          console.log("Verification success", proofs);
          setProofs(proofs);
          setStatus("Proof received!");
        },
        (error: any) => {
          console.error("Verification failed", error);
          setStatus(`Error: ${error.message}`);
        }
      );
    } catch (error: any) {
      console.error("Setup failed", error);
      setStatus(`Setup failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reclaim Protocol Demo</h1>

      <p className="mt-4 text-gray-700">Status: {status}</p>

      {requestUrl ? (
        <div className="mt-6 p-4 border rounded-lg bg-white shadow-sm">
          <p className="mb-2 text-sm text-gray-600">Scan this QR Code:</p>
          <div className="flex justify-center p-4 bg-white">
            <QRCode
              value={requestUrl}
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
          </div>
        </div>
      ) : (
        <button
          className={`mt-4 px-4 py-2 rounded ${isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
            } text-white transition-colors`}
          onClick={setup}
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Create QR Code!"}
        </button>
      )}

      {proofs && (
        <div className="mt-6 p-4 border rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold text-green-700">
            Verification Successful!
          </h2>
        </div>
      )}
    </div>
  );
}

export default ReclaimDemo;
