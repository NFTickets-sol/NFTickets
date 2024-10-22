import React, { useState, useEffect } from "react";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";
import QRCode from "react-qr-code";

interface SocialMedia {
  social: string;
}

const APP_ID = process.env.NEXT_PUBLIC_RECLAIM_APP_ID;
const APP_SECRET = process.env.NEXT_PUBLIC_RECLAIM_APP_SECRET;

async function initializeReclaim(PROVIDER_ID: string) {
  console.log("APP_ID, APP_SECRET", APP_SECRET, APP_ID);

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
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function setup() {
      try {
        const PROVIDER_ID = getAPPID(social);
        console.log("PROVIDER_ID", PROVIDER_ID, social);

        if (!PROVIDER_ID) {
          setStatus("Invalid social media platform.");
          return;
        }

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
      }
    }

    setup();
  }, []); // Only re-run the effect when 'social' changes

  return (
    <div>
      <h1>Reclaim Protocol Demo</h1>
      <p>Status: {status}</p>
      {requestUrl && (
        <div>
          <p>Request URL: {requestUrl}</p>
          <p>Scan this QR Code:</p>
          <QRCode size={256} value={requestUrl} viewBox={`0 0 256 256`} />
        </div>
      )}
      {proofs && (
        <div>
          <h2>Verification Successful!</h2>
          {/* You can uncomment this to show proofs */}
          {/* <pre>{JSON.stringify(proofs, null, 2)}</pre> */}
        </div>
      )}
    </div>
  );
}

export default ReclaimDemo;
