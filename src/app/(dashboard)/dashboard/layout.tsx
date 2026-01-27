import { PenTool, User } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "../../components/Sidebar";
import { getUser } from "../../lib/auth";

function getDisplayName(user: any) {
  if (user?.name) return user.name;
  if (user?.email) {
    const emailName = user.email.split("@")[0];
    return emailName
      .split(".")
      .map(
        (part: string) =>
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
      )
      .join(" ");
  }
  return "User";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getUser();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {user && (
                <h1 className="text-lg font-semibold text-gray-900">
                  Welcome back, {getDisplayName(user)}!
                </h1>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/editor"
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Write
              </Link>
              <Link
                href="/dashboard/profile"
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
              >
                <User className="w-4 h-4 text-gray-600" />
              </Link>
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
