"use client";

import { ConnectButton, PayEmbed} from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { tokenContractAddress } from "@/constants/contracts";




export function Navbar() {
    const wallets = [
        inAppWallet({
            auth: {
                options: [
                    "google",
                    "discord",
                    "telegram",
                    "farcaster",
                    "email",
                    "x",
                    "passkey",
                    "phone",
                ],
            },
        }),
        createWallet("io.metamask"),
        createWallet("io.rabby"),
        createWallet("com.trustwallet.app"),
    ];

    return (
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">vMARKET</h1>
            <div className="items-center flex gap-4">
                {/* Get VESTA Button */}
                <a
                    href="https://app.hercules.exchange/?outputCurrency=0x848E329d9C3FF5D3078C4670c773651155386C46"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 flex items-center justify-center bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded hover:from-gray-700 hover:to-gray-900 transition-colors"
                    style={{ height: '2.5rem', lineHeight: '2.5rem', padding: '0 1rem' }}
                >
                    Get VESTA
                </a>

                {/* Connect Wallet Button */}
                <ConnectButton
                    client={client}
                    wallets={wallets}
                    chain={chain}
                    connectButton={{
                        label: "Sign In",
                        style: {
                            fontSize: '0.75rem !important',
                            height: '2.5rem !important',
                        },
                    }}
                    connectModal={{ size: "wide" }}
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