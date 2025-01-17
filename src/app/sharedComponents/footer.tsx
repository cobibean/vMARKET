import { Send } from "lucide-react"
import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-screen border-t bg-gradient-to-r from-black to-gray-800">
            <div className="container max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 py-8 md:flex-row md:py-6">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-teal-400 md:text-left">
                        Predict the future with{" "}
                        <span className="font-bold text-xl">vMARKET</span>
                    </p>
                </div>
                <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
                    <Link
                        href="/about"
                        className="text-teal-400 hover:text-gray-300 transition-colors"
                    >
                        About
                    </Link>
                    <Link
                        href="https://vdao.online/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:text-gray-300 transition-colors"
                    >
                        Website
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="https://t.me/+cEis7ManxyJkODc0"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Telegram"
                    >
                        <Send className="h-5 w-5 text-teal-400 hover:text-gray-300 transition-colors" />
                    </Link>
                    <Link
                        href="https://twitter.com/vestadao"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Twitter"
                    >
                        <img
                            src="/twitterLogo.svg"
                            alt="Twitter/X logo for predictions market vMARKET by Vesta / VestaDAO on Metis L2 Ethereum Layer 2 / predictions / prediction / crypto predictions market"
                            className="h-6 w-6 text-teal-400 hover:text-gray-300 transition-colors"
                        />
                    </Link>
                </div>
            </div>
        </footer>
    )
}
