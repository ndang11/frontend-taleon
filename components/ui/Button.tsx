export default function Button({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="w-full rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
    >
      {children}
    </button>
  );
}
