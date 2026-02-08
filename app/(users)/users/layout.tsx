import UserNavbar from "./components/User_Navbar";
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserNavbar />
      <main className="max mx-auto p-1">{children}</main>
    </>
  );
}
