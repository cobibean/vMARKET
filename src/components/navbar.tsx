"use client"; 

import { ConnectButton, useConnect } from "thirdweb/react";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { tokenContractAddress } from "@/constants/contracts";

export function Navbar() {

    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">  vMARKET</h1>
            <div className="items-center flex gap-2">
                <ConnectButton
                    client={client}
                    chain={chain}
                    connectButton={{
                        label: "Sign In",
                        style: {
                            fontSize: '0.75rem !important',
                            height: '2.5rem !important',
                        }
                    }}
                    detailsButton={{
                        displayBalanceToken: {
                            [chain.id]: tokenContractAddress
                        }
                    }}
                />
            </div>
        </div>
    ); 
}