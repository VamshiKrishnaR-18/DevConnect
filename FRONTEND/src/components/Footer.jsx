import { Link } from "react-router-dom";

const links = {
  quick: [
    { to: "/feed", label: "Feed" },
    { to: "/about", label: "About Us" },
    { to: "/features", label: "Features" },
    { to: "/community", label: "Community" },
    { to: "/blog", label: "Blog" },
  ],
  support: [
    { to: "/help", label: "Help Center" },
    { to: "/contact", label: "Contact Us" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms of Service" },
    { to: "/security", label: "Security" },
  ],
};

const icons = [
  {
    label: "Twitter",
    path: "M23.953 4.57a10...",
  },
  {
    label: "GitHub",
    path: "M12 0c-6.626...",
  },
  {
    label: "LinkedIn",
    path: "M20.447 20.452h...",
  },
  {
    label: "Discord",
    path: "M20.317 4.3698a19...",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">DevConnect</h3>
              <p className="text-sm text-gray-400">Connect. Share. Grow.</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-md">
            DevConnect is a platform for developers to connect, share, and grow together.
          </p>
          <div className="flex space-x-4 mt-6">
            {icons.map((icon, idx) => (
              <a key={idx} href="#" aria-label={icon.label} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d={icon.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <FooterList title="Quick Links" items={links.quick} />
        {/* Support Links */}
        <FooterList title="Support" items={links.support} />
      </div>

      <div className="border-t border-gray-800 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 px-4">
          <p className="text-gray-400 text-sm">© {currentYear} DevConnect. All rights reserved.</p>
          <div className="text-xs text-gray-500 hidden md:flex items-center space-x-1">
            <span>Made with</span>
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            <span>by developer, for developers</span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <FooterBadge label="Secure" path
