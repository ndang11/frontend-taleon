import { PenTool, User } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "../../components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div></div>
            <div className="flex items-center space-x-4">
              <Link
                href="/editor"
                className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </Link>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
