import { Send } from "lucide-react"
import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full bg-gradient-to-r from-black to-gray-800 border-t">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 px-4 md:px-8">
                <p className="text-center text-sm text-teal-400">
                    Predict the future with{" "}
                        <span className="font-bold text-xl">vMARKET</span>
                </p>
                
            <div className="flex items-center gap-4">
                <Link href="/about" className="text-teal-400 hover:text-gray-300">
                    About
                </Link>
                <Link href="https://vdao.online/" target="_blank" className="text-teal-400 hover:text-gray-300">
                    Website
                </Link>
            </div>
                
                <div className="flex items-center gap-4">
                <Link href="https://t.me/+cEis7ManxyJkODc0" target="_blank" aria-label="Telegram">
                    <Send className="h-5 w-5 text-teal-400 hover:text-gray-300" />
                </Link>
                <Link href="https://twitter.com/vestadao" target="_blank" aria-label="Twitter">
                    <img
                    src="/twitterLogo.svg"
                    alt="Twitter/X"
                    className="h-6 w-6 text-teal-400 hover:text-gray-300"
                    />
                </Link>
                </div>
            </div>
            </footer>
    )
}
