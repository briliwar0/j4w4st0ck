import { Link } from "wouter";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  LinkedinIcon,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="text-primary">Jawa</span>
              <span className="text-white">Stock</span>
            </h3>
            <p className="text-neutral-400 mb-4">
              The premier marketplace for high-quality stock photos, videos, and
              digital assets.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <Youtube size={18} />
              </Link>
              <Link
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <LinkedinIcon size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Content</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/browse?type=photo"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Photos
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=video"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Videos
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=vector"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Vectors
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=illustration"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Illustrations
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=music"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Music
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Sound Effects
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  License Agreement
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Copyright Information
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  Cookies Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} JawaStock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
