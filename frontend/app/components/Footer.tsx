import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0B0C10] border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-black font-orbitron text-white mb-3">
              THE F1 <span className="text-red-600">APEX</span>
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-md">
              The ultimate Formula 1 prediction league. Predict race results, compete with friends, 
              and prove you know F1 better than anyone else.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/standings" className="text-gray-500 hover:text-white transition">
                  F1 Standings
                </Link>
              </li>
              <li>
                <Link href="/results" className="text-gray-500 hover:text-white transition">
                  League Results
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links (Required for AdSense) */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-500 hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">
              © {currentYear} F1 Apex Predictions. All rights reserved.
            </p>
            <p className="text-gray-700 text-xs">
              Not affiliated with Formula 1® or FIA. F1® is a trademark of Formula One Licensing BV.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
