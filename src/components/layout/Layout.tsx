import { useEffect, useState } from 'react';
import {  Link, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PlaneTakeoff,
  ShieldCheck,
  Menu,
  X,
  Share2,
  MessageCircle,
  AtSign,
  Mail,
  Phone,
  LogIn,
  LogOut,
  UserCircle,
  Wallet,
} from 'lucide-react';

import PageTransition from '../animations/PageTransition';
import LoginModal from '../auth/LoginModal';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'Search flights', href: '/#search' },
];

const footerLinks = {
  Company: [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'No-account promise', href: '/#search' },
  ],
  Support: [
    { label: 'Track a booking', href: '/' },
    { label: 'Refunds & changes', href: '/' },
    { label: 'Contact us', href: 'mailto:hello@airafly.example' },
  ],
};

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const outlet = useOutlet();
  const user = useAuth((state) => state.user);
  const logout = useAuth((state) => state.logout);


  const isHomePage = location.pathname === '/';


  const isTransparentHome = isHomePage && !scrolled;
  const isSolidNavbar = !isTransparentHome;

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(false);
      return;
    }

    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 8;

      setScrolled(shouldBeScrolled);

      if (shouldBeScrolled) {
        setMenuOpen(false);
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);

    if (!href.startsWith('/#')) {
      navigate(href);
      return;
    }

    const id = href.substring(2);


    if (location.pathname === '/') {
      const element = document.getElementById(id);

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return;
    }

    navigate(href);
  };

  const navbarClassName = isTransparentHome
    ? `
      bg-white/10
      backdrop-blur-md
      border
      border-white/20
    `
    : `
      bg-bg/95
      backdrop-blur-xl
      border
      border-slate-200/70
      shadow-lg
      shadow-slate-900/5
    `;

  const navbarTextClassName = isTransparentHome
    ? 'text-white'
    : 'text-ink';

  const interactiveTextClassName = isTransparentHome
    ? `
      text-white
      hover:bg-white/10
    `
    : `
      text-ink
      hover:bg-slate-900/5
    `;


  const mobileMenuClassName = isTransparentHome
    ? `
      bg-slate-950/90
      backdrop-blur-xl
      border-white/10
    `
    : `
      bg-bg/95
      backdrop-blur-xl
      border-slate-200/70
    `;

  const mobileMenuTextClassName = isTransparentHome
    ? `
      text-white
      hover:bg-white/10
    `
    : `
      text-ink
      hover:bg-slate-900/5
    `;

  const mobileDividerClassName = isTransparentHome
    ? 'border-white/10'
    : 'border-slate-200/70';

  /**
   * ==================================================
   * RENDER
   * ==================================================
   */

  return (
    <div className="min-h-screen flex flex-col">

      {/* ==================================================
          FIXED NAVBAR
          ================================================== */}

      <div
        className={
          isHomePage
            ? `
              fixed
              top-3
              left-1/2
              -translate-x-1/2
              z-50
              w-[calc(100%-1.5rem)]
              sm:w-[calc(100%-2rem)]
              max-w-6xl
            `
            : `
              fixed
              top-0
              left-0
              z-50
              w-full
            `
        }
      >

        {/* ==================================================
            NAVBAR
            ================================================== */}

        <header
          className={`
            w-full
            ${isHomePage ? 'rounded-full' : ''}
            transition-all
            duration-300
            ease-out
            ${navbarClassName}
          `}
        >
          <div
            className={
              isHomePage
                ? 'px-4 sm:px-5 md:px-7'
                : 'max-w-6xl mx-auto px-4 sm:px-5 md:px-7'
            }
          >
            <div className="h-14 md:h-16 flex items-center justify-between">

              {/* ==================================================
                  LOGO
                  ================================================== */}

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="
                  flex
                  items-center
                  gap-2
                  font-display
                  font-bold
                  text-lg
                  tracking-tight
                  shrink-0
                "
              >
                <span
                  className="
                    w-8
                    h-8
                    rounded-full
                    bg-primary
                    text-white
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <PlaneTakeoff className="w-4 h-4" />
                </span>

                <span
                  className={`
                    transition-colors
                    duration-300
                    ${navbarTextClassName}
                  `}
                >
                  Aira Fly
                </span>
              </Link>

              {/* ==================================================
                  DESKTOP NAVIGATION
                  ================================================== */}

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleNavClick(link.href)}
                    className={`
                      px-4
                      py-2
                      rounded-full
                      text-sm
                      font-medium
                      transition-all
                      duration-200
                      ${interactiveTextClassName}
                    `}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* ==================================================
                  DESKTOP AUTH
                  ================================================== */}

              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <div className="flex items-center gap-2">

                    {/* User */}

                    <span
                      className={`
                        flex
                        items-center
                        gap-1.5
                        text-sm
                        font-semibold
                        transition-colors
                        ${navbarTextClassName}
                      `}
                    >
                      <UserCircle
                        className=
                          {`
                            w-4
                            h-4
                            ${navbarTextClassName}
                          `}
                      />

                      {user.full_name.split(' ')[0]}
                    </span>

                    {/* Wallet */}

                    <button
                      type="button"
                      onClick={() => navigate('/wallet')}
                      title="My wallet"
                      aria-label="My wallet"
                      className={`
                        w-9
                        h-9
                        rounded-full
                        flex
                        items-center
                        justify-center
                        transition-all
                        ${interactiveTextClassName}
                      `}
                    >
                      <Wallet className="w-4 h-4" />
                    </button>

                    {/* Logout */}

                    <button
                      type="button"
                      onClick={logout}
                      title="Log out"
                      aria-label="Log out"
                      className={`
                        w-9
                        h-9
                        rounded-full
                        flex
                        items-center
                        justify-center
                        transition-all
                        ${interactiveTextClassName}
                      `}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLoginOpen(true)}
                    className="
                      btn-secondary
                      flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      py-2.5
                      rounded-full
                      text-sm
                      font-semibold
                      shadow-sm
                      transition-all
                      duration-200
                      hover:shadow-md
                    "
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Log in
                  </button>
                )}
              </div>

              {/* ==================================================
                  MOBILE TOGGLE
                  ================================================== */}

              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className={`
                  md:hidden
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  transition-all
                  duration-200
                  ${
                    isTransparentHome
                      ? `
                        border-white/30
                        text-white
                        hover:bg-white/10
                      `
                      : `
                        border-slate-200
                        text-ink
                        hover:bg-slate-900/5
                      `
                  }
                `}
              >
                {menuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================
            MOBILE MENU

            Separate from header so opening the menu does not
            change the navbar height.
            ================================================== */}

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.98,
              }}
              transition={{
                duration: 0.18,
                ease: 'easeOut',
              }}
              className="
                md:hidden
                absolute
                top-full
                left-0
                right-0
                mt-2
              "
            >
              <div
                className={`
                  w-full
                  p-2
                  rounded-2xl
                  border
                  shadow-xl
                  ${mobileMenuClassName}
                `}
              >

                {/* ==================================================
                    MOBILE NAV LINKS
                    ================================================== */}

                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => handleNavClick(link.href)}
                      className={`
                        w-full
                        flex
                        items-center
                        text-left
                        px-4
                        py-3
                        rounded-lg
                        text-sm
                        font-medium
                        transition-all
                        duration-200
                        ${mobileMenuTextClassName}
                      `}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>

                {/* Divider */}

                <div
                  className={`
                    my-2
                    border-t
                    ${mobileDividerClassName}
                  `}
                />

                {/* ==================================================
                    MOBILE AUTH
                    ================================================== */}

                {user ? (
                  <div className="flex items-center justify-between px-3 py-2">

                    <span
                      className={`
                        flex
                        items-center
                        gap-1.5
                        text-sm
                        font-semibold
                        ${navbarTextClassName}
                      `}
                    >
                      <UserCircle
                        className="
                          w-4
                          h-4
                          text-primary
                        "
                      />

                      {user.full_name}
                    </span>

                    <div className="flex items-center gap-1.5">

                      {/* Wallet */}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate('/wallet');
                        }}
                        className="
                          btn-ghost
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          px-3
                          py-2
                          rounded-lg
                        "
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        Wallet
                      </button>

                      {/* Logout */}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          logout();
                        }}
                        className="
                          btn-ghost
                          flex
                          items-center
                          gap-1.5
                          text-xs
                          px-3
                          py-2
                          rounded-lg
                        "
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setLoginOpen(true);
                    }}
                    className="
                      btn-secondary
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      text-sm
                      font-semibold
                      px-4
                      py-2.5
                      mt-1
                      rounded-full
                      shadow-sm
                    "
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Log in
                  </button>
                )}

                {/* ==================================================
                    NO ACCOUNT
                    ================================================== */}

                <div
                  className={`
                    flex
                    items-center
                    gap-1.5
                    text-xs
                    font-medium
                    px-3
                    pt-3
                    pb-1
                    ${
                      isSolidNavbar
                        ? 'text-muted'
                        : 'text-white/60'
                    }
                  `}
                >
                  <ShieldCheck
                    className="
                      w-3.5
                      h-3.5
                      text-primary
                      shrink-0
                    "
                  />

                  No account needed
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================================================
          MAIN CONTENT
          ================================================== */}

      <main
        className={`
          flex-1
          ${!isHomePage ? 'pt-14 md:pt-16' : ''}
        `}
      >
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {outlet}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* ==================================================
          LOGIN MODAL
          ================================================== */}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />

      {/* ==================================================
          FOOTER
          ================================================== */}

      <footer className="mt-16 bg-ink text-white/70">
        <div
          className="
            max-w-6xl
            mx-auto
            px-5
            md:px-8
            py-14
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-4
            gap-10
          "
        >

          {/* ==================================================
              BRAND
              ================================================== */}

          <div className="md:col-span-2">
            <Link
              to="/"
              className="
                flex
                items-center
                gap-2
                font-display
                font-bold
                text-lg
                text-white
                tracking-tight
              "
            >
              <span
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-primary
                  text-white
                  flex
                  items-center
                  justify-center
                "
              >
                <PlaneTakeoff className="w-4 h-4" />
              </span>

              Aira Fly
            </Link>

            <p
              className="
                text-sm
                mt-4
                max-w-xs
                leading-relaxed
              "
            >
              Search real fares, pick your seat and pay --
              start to finish, in one visit. Nothing to sign
              up for, nothing saved after you close the tab.
            </p>

            {/* Social */}

            <div className="flex items-center gap-3 mt-5">
              {[AtSign, MessageCircle, Share2].map(
                (Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    aria-label={`Social link ${index + 1}`}
                    className="
                      w-8
                      h-8
                      rounded-full
                      border
                      border-white/15
                      flex
                      items-center
                      justify-center
                      hover:border-white/40
                      hover:text-white
                      transition-colors
                    "
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* ==================================================
              FOOTER LINKS
              ================================================== */}

          {Object.entries(footerLinks).map(
            ([heading, links]) => (
              <div key={heading}>
                <h4
                  className="
                    font-display
                    font-semibold
                    text-white
                    text-sm
                    mb-4
                  "
                >
                  {heading}
                </h4>

                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith('/#') ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleNavClick(link.href)
                          }
                          className="
                            text-sm
                            hover:text-white
                            transition-colors
                            text-left
                          "
                        >
                          {link.label}
                        </button>
                      ) : link.href.startsWith('/') ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleNavClick(link.href)
                          }
                          className="
                            text-sm
                            hover:text-white
                            transition-colors
                            text-left
                          "
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className="
                            text-sm
                            hover:text-white
                            transition-colors
                          "
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}

          {/* ==================================================
              CONTACT
              ================================================== */}

          <div>
            <h4
              className="
                font-display
                font-semibold
                text-white
                text-sm
                mb-4
              "
            >
              Get in touch
            </h4>

            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                hello@airafly.example
              </li>

              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                +62 21 5000 1234
              </li>
            </ul>
          </div>
        </div>

        {/* ==================================================
            FOOTER BOTTOM
            ================================================== */}

        <div className="border-t border-white/10">
          <div
            className="
              max-w-6xl
              mx-auto
              px-5
              md:px-8
              py-6
              flex
              flex-col
              sm:flex-row
              items-center
              justify-between
              gap-3
              text-xs
            "
          >
            <span>
              © {new Date().getFullYear()} Aira Fly.
              Search, book and pay without an account.
            </span>

            <span>
              Payments processed securely via DOKU.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

