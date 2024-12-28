import { Github, Twitter, Linkedin } from "lucide-react"
import Link from "next/link"

export function Footer() {
    return (
        <footer className="w-full border-t bg-gradient-to-r from-purple-500 to-indigo-600">
            <div className="container max-w-7xl mx-auto flex flex-col items-center justify-between gap-4 py-8 md:flex-row md:py-6">
                <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                    <p className="text-center text-sm leading-loose text-white md:text-left">
                        Predict the future with{" "}
                        <span className="font-bold text-xl">vMARKET</span>
                    </p>
                </div>
                <div className="flex flex-col items-center gap-4 md:flex-row">
                    <Link
                        href="/about"
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        About
                    </Link>
                    <Link
                        href="/terms"
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        Terms
                    </Link>
                    <Link
                        href="vdao.online"
                        className="text-white hover:text-gray-200 transition-colors"
                    >
                        Website
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="https://github.com/yourusername/vmarket"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="GitHub"
                    >
                        <Github className="h-5 w-5 text-white hover:text-gray-200 transition-colors" />
                    </Link>
                    <Link
                        href="https://twitter.com/vestadao"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Twitter"
                    >
                        <img
                            src="/vMARKETbuild/vmarket/public/twitterLogo.svg"
                            alt="twitter/x logo for predictions market vMARKET"
                            className="h-5 w-5 text-white hover:text-gray-200 transition-colors"
                        />
                    </Link>
                </div>
            </div>
        </footer>
    )
}
