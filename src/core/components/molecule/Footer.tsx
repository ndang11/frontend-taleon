import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex justify-center space-x-6">
          <Link href="/about" className="text-gray-600 hover:text-black">
            About
          </Link>
          <Link href="/terms" className="text-gray-600 hover:text-black">
            Terms
          </Link>
          <Link href="/privacy" className="text-gray-600 hover:text-black">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
