import { client } from "@/app/client";
import { getContract } from "thirdweb";
import { defineChain } from "thirdweb"; 

export const predictionMarketContractAddress = "0x5B45E4C00B310f1E9C951e1169C9A60fD856d186";
export const tokenContractAddress = "0xEA32A96608495e54156Ae48931A7c20f0dcc1a21"; 

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