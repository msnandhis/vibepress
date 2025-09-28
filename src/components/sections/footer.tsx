import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube, FaSpotify, FaTiktok, FaQuora } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const getToKnowUsLinks = [
  { name: 'Home', href: '#' },
  { name: 'Advertise With Us', href: '#' },
  { name: 'Contact', href: '#' },
  { name: 'Entertainment', href: '#' },
  { name: 'My account', href: '#' },
  { name: 'License Summary', href: '#' },
];

const moreLinks = [
  { name: 'About Us', href: '#' },
  { name: 'Submit a News Tip', href: '#' },
  { name: 'Culture', href: '#' },
  { name: 'Subscription Plans', href: '#' },
  { name: 'Technology', href: '#' },
  { name: 'Terms of Service', href: '#' },
];

const articlesData = [
  {
    title: '7 food myths dietitians wish people would stop believing',
    date: 'May 24, 2024',
    imageUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Cozy-Minimalist-Table-e1748420710846-200x120-30.jpeg',
    href: '#',
  },
  {
    title: 'Outdoor Photo Shooting With clean and Beautiful',
    date: 'May 24, 2024',
    imageUrl: null,
    href: '#',
  },
];

const socialLinks = [
  { name: 'facebook', icon: <FaFacebookF className="h-4 w-4 text-white" />, color: 'bg-[#3b5998]', href: '#' },
  { name: 'twitter', icon: <FaXTwitter className="h-4 w-4 text-white" />, color: 'bg-black', href: '#' },
  { name: 'instagram', icon: <FaInstagram className="h-4 w-4 text-white" />, color: 'bg-[#c32aa3]', href: '#' },
  { name: 'youtube', icon: <FaYoutube className="h-4 w-4 text-white" />, color: 'bg-[#ff0000]', href: '#' },
  { name: 'spotify', icon: <FaSpotify className="h-4 w-4 text-white" />, color: 'bg-[#1ed760]', href: '#' },
  { name: 'tiktok', icon: <FaTiktok className="h-4 w-4 text-white" />, color: 'bg-black', href: '#' },
  { name: 'quora', icon: <FaQuora className="h-4 w-4 text-white" />, color: 'bg-[#b92b27]', href: '#' },
];

const subFooterLinks = [
  { name: 'About Us', href: '#' },
  { name: 'Private policy', href: '#' },
  { name: 'Forums', href: '#' },
];

const Footer = () => {
  return (
    <footer className="font-body">
      <div className="bg-muted pt-[70px] pb-[40px]">
        <div className="container mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            
            {/* Column 1: Logo, Text, Social */}
            <div className="flex flex-col">
              <Link href="/">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/logo_n01-1.png"
                  alt="VIBEPRESS Logo"
                  width={112}
                  height={28}
                  className="h-auto"
                />
              </Link>
              <p className="text-muted-foreground text-[14px] leading-6 mt-5">
                More details around Apple Intelligence features, how they work and what devices will actually get them.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {socialLinks.map((social) => (
                  <a key={social.name} href={social.href} className={`w-9 h-9 rounded-md flex items-center justify-center ${social.color} transition-opacity hover:opacity-80`}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Get to Know Us */}
            <div>
              <h3 className="text-foreground font-['Inter',_sans-serif] text-[16px] font-extrabold uppercase tracking-wider mb-6">Get to Know Us</h3>
              <ul className="space-y-3">
                {getToKnowUsLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground text-[14px] hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: More Links */}
            <div className="lg:mt-[46px]">
              <ul className="space-y-3">
                {moreLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground text-[14px] hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Find Out More */}
            <div>
              <h3 className="text-foreground font-['Inter',_sans-serif] text-[16px] font-extrabold uppercase tracking-wider mb-6">Find Out More</h3>
              <div className="space-y-4">
                {articlesData.map((article, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Link href={article.href} className="flex-shrink-0">
                      <div>
                        {article.imageUrl ? (
                          <Image
                            src={article.imageUrl}
                            alt={article.title}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-lg"></div>
                        )}
                      </div>
                    </Link>
                    <div>
                      <h4 className="text-foreground text-[14px] font-bold leading-5">
                        <Link
                          href={article.href}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h4>
                      <p className="text-muted-foreground text-xs mt-1">{article.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Sub-footer */}
      <div className="bg-background border-t border-border py-5">
        <div className="container mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs text-center md:text-left">
            © Copyright 2024 Jellywp. All rights reserved powered by <a href="https://jellywp.com/" className="text-foreground hover:text-primary transition-colors">Jellywp.com</a>
          </p>
          <ul className="flex items-center gap-6">
            {subFooterLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-muted-foreground text-xs hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;