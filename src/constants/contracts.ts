import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb"; // Ensure this import is correct based on your project structure

export const predictionMarketContractAddress = "0xE0DC88B9403ee5311b98117531993d0Ac6Da6c77";
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