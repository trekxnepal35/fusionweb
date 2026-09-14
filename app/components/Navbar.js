import NavbarClient from "./NavbarClient";

export default function Navbar({ menus = [] }) {
  return <NavbarClient menus={menus} />;
}