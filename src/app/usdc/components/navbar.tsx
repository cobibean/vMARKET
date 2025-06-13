"use client";

import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { tokenContractAddress as usdcTokenAddress } from "@/app/usdc/constants/contracts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center cursor-pointer">
      {label && <span className="mr-2 font-medium">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="block w-12 h-6 bg-gray-300 rounded-full"></div>
        <div
          className={`dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${
            checked ? "transform translate-x-6" : ""
          }`}
        ></div>
      </div>
    </label>
  );
}

export function Navbar() {
  const wallets = [
    inAppWallet({
      auth: {
        options: ["google", "discord", "telegram", "farcaster", "email", "x", "passkey", "phone"],
      },
    }),
    createWallet("io.metamask"),
    createWallet("io.rabby"),
    createWallet("com.trustwallet.app"),
  ];

  const pathname = usePathname();
  const router = useRouter();
  const isVestaRoute = pathname?.startsWith("/vesta") ?? false;

  // For USDC, the toggle is OFF by default if on /usdc,
  // ON if on /vesta.
  const [isVestaToggled, setIsVestaToggled] = useState(isVestaRoute);

  useEffect(() => {
    if (isVestaToggled && !pathname?.startsWith("/vesta")) {
      router.push("/vesta");
    } else if (!isVestaToggled && !pathname?.startsWith("/usdc")) {
      router.push("/usdc");
    }
  }, [isVestaToggled]);

  return (
    <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6">
      {/* vMARKET => link to root */}
      <Link href="/">
        <button className="text-xl sm:text-2xl font-bold cursor-pointer">vMARKET</button>
      </Link>

      <div className="items-center flex flex-wrap sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-0">
        {/* Toggle Switch */}
        <ToggleSwitch
          label={isVestaToggled ? "VESTA" : "USDC"}
          checked={isVestaToggled}
          onChange={(checked) => setIsVestaToggled(checked)}
        />

        {/* Buy USDC link */}
        <a
          href="https://app.hercules.exchange/?token2=0xEA32A96608495e54156Ae48931A7c20f0dcc1a21"
          target="_blank"
          rel="noreferrer"
          className="px-4 flex items-center justify-center bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded hover:from-gray-700 hover:to-gray-900 transition-colors max-w-[10rem] truncate"
          style={{
            height: "2.5rem",
            lineHeight: "2.5rem",
            padding: "0 1rem",
          }}
        >
          Buy USDC
        </a>

        {/* Connect button with USDC balance */}
        <ConnectButton
          client={client}
          wallets={wallets}
          chain={chain}
          connectButton={{
            label: "Sign In",
            style: {
              fontSize: "0.75rem !important",
              height: "2.5rem !important",
            },
          }}
          connectModal={{ size: "wide" }}
          detailsButton={{
            // Show USDC balance
            displayBalanceToken: {
              [chain.id]: usdcTokenAddress,
            },
          }}
        />

        {/* My Predictions link */}
        <Link 
          href="/user"
          className="ml-4 px-4 py-2 text-sm hover:bg-accent rounded-lg"
        >
          My Predictions
        </Link>
      </div>
    </div>
  );
}