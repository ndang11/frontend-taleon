import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-black">Taleon</span>
    </Link>
  );
}
