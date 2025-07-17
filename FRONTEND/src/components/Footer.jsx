import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <div>
          <h3 className="text-white text-lg font-semibold mb-2">DevConnect</h3>
          <p>Connect. Share. Grow.</p>
          <p className="mt-2">© {currentYear} DevConnect</p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-medium mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li><Link to="/feed" className="hover:text-white">Feed</Link></li>
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/features" className="hover:text-white">Features</Link></li>
            <li><Link to="/community" className="hover:text-white">Community</Link></li>
            <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="text-white font-medium mb-2">Support</h4>
          <ul className="space-y-1">
            <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
            <li><Link to="/security" className="hover:text-white">Security</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
