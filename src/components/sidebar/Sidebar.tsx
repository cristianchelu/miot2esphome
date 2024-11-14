import { ReactElement, ReactNode } from "react";

import "./Sidebar.css";

interface HeaderProps {
  children: ReactNode;
}
const Header = ({ children }: HeaderProps) => {
  return <div className="header">{children}</div>;
};

interface BodyProps {
  children: ReactNode;
}
const Body = ({ children }: BodyProps) => {
  return (
    <div className="body-scroll-wrapper">
      <div className="body">{children}</div>
    </div>
  );
};

interface FooterProps {
  children: ReactNode;
}
const Footer = ({ children }: FooterProps) => {
  return <div className="footer">{children}</div>;
};

type SidebarChild = ReactElement<typeof Footer | typeof Header | typeof Body>;

interface SidebarProps {
  children?: SidebarChild | SidebarChild[];
}
const Sidebar = ({ children }: SidebarProps) => {
  return <aside className="sidebar">{children}</aside>;
};

Sidebar.Header = Header;
Sidebar.Body = Body;
Sidebar.Footer = Footer;

export default Sidebar;
