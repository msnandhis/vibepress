import type { SVGProps } from "react";
import { Facebook, Linkedin, Pin, Music2, Youtube, X } from "lucide-react";

type IconType = React.ComponentType<SVGProps<SVGSVGElement>>;

interface SocialItem {
  name: string;
  icon: IconType;
  count: string;
  label: string;
  color: string;
  href: string;
}

const socialItems: SocialItem[] = [
  {
    name: "Facebook",
    icon: Facebook,
    count: "23k",
    label: "Likes",
    color: "bg-[#4267B2]",
    href: "#",
  },
  {
    name: "Twitter",
    icon: X,
    count: "93k",
    label: "Follows",
    color: "bg-black",
    href: "#",
  },
  {
    name: "Pinterest",
    icon: Pin,
    count: "42k",
    label: "Pin",
    color: "bg-[#c8232c]",
    href: "#",
  },
  {
    name: "YouTube",
    icon: Youtube,
    count: "100k",
    label: "Subscribers",
    color: "bg-[#ff0000]",
    href: "#",
  },
  {
    name: "Spotify",
    icon: Music2,
    count: "65k",
    label: "Followers",
    color: "bg-[#1db954]",
    href: "#",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    count: "21k",
    label: "Followers",
    color: "bg-[#0077b5]",
    href: "#",
  },
];

const SidebarSocial = () => {
  return (
    <ul className="space-y-2">
      {socialItems.map((item) => (
        <li key={item.name}>
          <a
            href={item.href}
            className={`${item.color} flex items-center p-3 rounded-lg text-white hover:opacity-90 transition-opacity`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow us on ${item.name}`}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <div className="ml-auto flex items-baseline space-x-2 text-right">
              <span className="font-bold text-sm tracking-tight">{item.count}</span>
              <span className="text-xs">{item.label}</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default SidebarSocial;