import Link from "next/link";
import { type FC } from "react";

import { MARKETPLACE_NAME } from "~/constants";

const socialLinks = [
  {
    name: "Twitter",
    url: "https://twitter.com/pawthereum",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/pawthereum/",
  },
  {
    name: "Discord",
    url: "https://discord.gg/pawthereum",
  },
]

export const Footer: FC = () => {
  return (
    <div className="bg-neutral text-neutral-content mt-20">
      <div className="max-w-7xl mx-auto px-2 py-20">
        <div className="text-3xl font-bold mb-12">
          {MARKETPLACE_NAME}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">About</div>
            <div className="text-sm">About Us</div>
            <div className="text-sm">Careers</div>
            <div className="text-sm">Press</div>
            <div className="text-sm">Blog</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">Support</div>
            <div className="text-sm">Help Center</div>
            <div className="text-sm">FAQs</div>
            <Link href="mailto:contact@pawthereum.com" className="text-sm">
              Contact Us
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">Legal</div>
            <div className="text-sm">Terms of Service</div>
            <div className="text-sm">Privacy Policy</div>
            <div className="text-sm">Cookie Policy</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold">Social</div>
            {socialLinks.map((link) => (
              <Link
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
};

export default Footer;