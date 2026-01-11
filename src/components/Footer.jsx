import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 flex items-start space-x-6">
            <img src="/silaimartlogo.png" alt="SilaiMart" className="h-32 w-auto flex-shrink-0" />
            <p className="text-gray-400 max-w-md">
              Bringing divine art to your doorstep. Handcrafted sculptures and spiritual artifacts 
              for your sacred spaces.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-gray-400 hover:text-bronze">Shop</Link></li>
              <li><Link to="/blogs" className="text-gray-400 hover:text-bronze">Blogs</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-bronze">About Us</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-bronze">Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-6">Categories</h3>
            <ul className="space-y-3">
              <li><Link to="/shop?category=vinayagar" className="text-gray-400 hover:text-bronze">Vinayagar</Link></li>
              <li><Link to="/shop?category=murugar" className="text-gray-400 hover:text-bronze">Murugar</Link></li>
              <li><Link to="/shop?category=buddha" className="text-gray-400 hover:text-bronze">Buddha</Link></li>
              <li><Link to="/shop?category=home-decor" className="text-gray-400 hover:text-bronze">Home Decor</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-6">Policies</h3>
            <ul className="space-y-3">
              <li><Link to="/policy/terms" className="text-gray-400 hover:text-bronze">Terms & Conditions</Link></li>
              <li><Link to="/policy/return" className="text-gray-400 hover:text-bronze">Return Policy</Link></li>
              <li><Link to="/policy/cancellation" className="text-gray-400 hover:text-bronze">Cancellation Policy</Link></li>
              <li><Link to="/policy/privacy" className="text-gray-400 hover:text-bronze">Privacy Policy</Link></li>
              <li><Link to="/policy/shipping" className="text-gray-400 hover:text-bronze">Shipping Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2024 SilaiMart. All rights reserved.</p>
            <div className="flex space-x-4 text-sm">
              <Link to="/policy/terms" className="text-gray-500 hover:text-bronze">Terms</Link>
              <Link to="/policy/privacy" className="text-gray-500 hover:text-bronze">Privacy</Link>
              <Link to="/policy/return" className="text-gray-500 hover:text-bronze">Returns</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;