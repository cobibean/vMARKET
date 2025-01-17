"use client";

import { ConnectButton, PayEmbed } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client } from "@/app/client";
import { chain } from "@/app/chain";
import { tokenContractAddress as vestaTokenAddress } from "@/app/vesta/constants/contracts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Basic toggle switch styles (Tailwind or your own classes)
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

  // Next.js 13 navigation
  const pathname = usePathname();
  const router = useRouter();

  // Determine if we are on the VESTA route. 
  //   If `pathname` includes "vesta", we consider the toggle = true.
  //   If it includes "usdc", toggle = false.
  // You can refine this logic as needed.
  const isVestaRoute = pathname?.startsWith("/vesta") ?? false;

  // We'll store the toggle state in local state
  const [isVestaToggled, setIsVestaToggled] = useState(isVestaRoute);

  // Whenever the toggle changes, push the user to the correct route
  useEffect(() => {
    if (isVestaToggled && !pathname?.startsWith("/vesta")) {
      router.push("/vesta");
    } else if (!isVestaToggled && !pathname?.startsWith("/usdc")) {
      router.push("/usdc");
    }
  }, [isVestaToggled]);

  return (
    <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6">
      {/* vMARKET => Link to root landing page */}
      <Link href="/">
        <button className="text-xl sm:text-2xl font-bold cursor-pointer">
          vMARKET
        </button>
      </Link>

      <div className="items-center flex flex-wrap sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-0">
        {/* Toggle Switch: USDC <-> VESTA */}
        <ToggleSwitch
          label={isVestaToggled ? "VESTA" : "USDC"}
          checked={isVestaToggled}
          onChange={(checked) => setIsVestaToggled(checked)}
        />

        {/* For the VESTA room, "Buy VESTA" link */}
        <a
          href="https://app.hercules.exchange/?token2=0x848E329d9C3FF5D3078C4670c773651155386C46"
          target="_blank"
          rel="noreferrer"
          className="px-4 flex items-center justify-center bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded hover:from-gray-700 hover:to-gray-900 transition-colors max-w-[10rem] truncate"
          style={{
            height: "2.5rem",
            lineHeight: "2.5rem",
            padding: "0 1rem",
          }}
        >
          Buy VESTA
        </a>

        {/* Connect Button with VESTA balance */}
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
            displayBalanceToken: {
              [chain.id]: vestaTokenAddress,
            },
          }}
        />
      </div>
    </div>
  );
}