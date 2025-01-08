import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb"; 

export const predictionMarketContractAddress = "0xf1f18D31841DdFBB254BA1F487619d7c9A9fA41e";
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