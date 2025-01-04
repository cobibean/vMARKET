import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb"; // Ensure this import is correct based on your project structure

export const predictionMarketContractAddress = "0x32ce242630c39A94EC24742025d2BE4D380DB8b5";
export const tokenContractAddress = "0x848E329d9C3FF5D3078C4670c773651155386C46"; 

export const contract = getContract({
    client: client,
    chain: defineChain(1088),
    address: predictionMarketContractAddress,
});

export const tokenContract = getContract({
    client: client,
    chain: defineChain(1088),
    address: tokenContractAddress,
});