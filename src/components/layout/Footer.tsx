import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="inline-block mb-5">
            <span className="text-secondary text-2xl font-black">Cart</span>
            <span className="text-primary-foreground text-2xl font-black">Nest</span>
          </Link>
          <p className="text-sm text-primary-foreground/60 mb-5 leading-relaxed">
            Your trusted online shopping destination. Quality products, great prices, fast delivery.
          </p>
          <div className="flex gap-3">
            {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-200">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-secondary">Shop</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/60">
            {["All Products", "Electronics", "Fashion", "Home & Kitchen", "Deals"].map((item) => (
              <li key={item}><Link to="/products" className="hover:text-secondary transition-colors">{item}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-secondary">Support</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/60">
            {["Help Center", "Shipping Info", "Returns", "Track Order", "Contact Us"].map((item) => (
              <li key={item}><a href="#" className="hover:text-secondary transition-colors">{item}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-secondary">Newsletter</h4>
          <p className="text-sm text-primary-foreground/60 mb-4">Get exclusive offers and updates.</p>
          <div className="flex rounded-lg overflow-hidden">
            <input type="email" placeholder="Your email" className="flex-1 px-3 py-2.5 text-sm bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 border-0 outline-none" />
            <button className="px-4 py-2.5 bg-secondary text-secondary-foreground hover:opacity-90 transition-opacity font-semibold text-sm">
              <FiMail className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-5 space-y-2 text-sm text-primary-foreground/50">
            <div className="flex items-center gap-2"><FiMapPin className="w-3.5 h-3.5" /> New York, NY 10001</div>
            <div className="flex items-center gap-2"><FiPhone className="w-3.5 h-3.5" /> +1 (555) 123-4567</div>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10">
      <div className="container py-5 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-primary-foreground/40">
        <span>© 2026 CartNest. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-secondary transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
