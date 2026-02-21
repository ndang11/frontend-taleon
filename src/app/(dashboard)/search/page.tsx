import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full" />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
