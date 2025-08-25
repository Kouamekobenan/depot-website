import CountdownClient from "./components/CountdownClient";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <CountdownClient />
    </div>
  );
}
