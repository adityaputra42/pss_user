import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
    { label: 'Contact us', href: 'mailto:hello@aviata.example' },
  ],
};

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  // ==================================================
  // SCROLL
  // ==================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);

      // Close mobile menu when scrolling
      if (window.scrollY > 8 && menuOpen) {
        setMenuOpen(false);
      }
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menuOpen]);

  // ==================================================
  // CLOSE MOBILE MENU ON ROUTE CHANGE
  // ==================================================

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavClick = (href: string) => {
    setMenuOpen(false);

    if (href.startsWith('/#')) {
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
      return;
    }

    navigate(href);
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="min-h-screen flex flex-col">

      {/* ==================================================
          FLOATING NAVBAR
          ================================================== */}

      <header
        className={`
          fixed
          top-3
          left-1/2
          -translate-x-1/2
          z-50

          w-[calc(100%-1.5rem)]
          sm:w-[calc(100%-2rem)]
          max-w-6xl

          rounded-full

          transition-all
          duration-300
          ease-out

          ${
            scrolled
              ? `
                bg-bg/95
                backdrop-blur-xl
                border
                border-slate-200/70
                shadow-lg
                shadow-slate-900/5
              `
              : `
                bg-white/10
                backdrop-blur-md
                border
                border-white/20
              `
          }
        `}
      >

        {/* ==================================================
            NAVBAR MAIN
            ================================================== */}

        <div className="px-4 sm:px-5 md:px-7">
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
                  ${
                    scrolled
                      ? 'text-ink'
                      : 'text-white'
                  }
                `}
              >
                Aviata
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

                    ${
                      scrolled
                        ? `
                          text-ink
                          hover:bg-slate-900/5
                        `
                        : `
                          text-white
                          hover:bg-white/10
                        `
                    }
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

                      ${
                        scrolled
                          ? 'text-ink'
                          : 'text-white'
                      }
                    `}
                  >
                    <UserCircle
                      className="
                        w-4
                        h-4
                        text-primary
                      "
                    />

                    {user.full_name.split(' ')[0]}
                  </span>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={logout}
                    title="Log out"
                    className={`
                      w-9
                      h-9
                      rounded-full
                      flex
                      items-center
                      justify-center
                      transition-all

                      ${
                        scrolled
                          ? `
                            text-ink
                            hover:bg-slate-900/5
                          `
                          : `
                            text-white
                            hover:bg-white/10
                          `
                      }
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

                    text-sm
                    font-semibold

                    px-5
                    py-2.5

                    rounded-full

                    shadow-sm

                    transition-all
                    duration-200

                    hover:shadow-md
                  "
                >
                  <LogIn className="w-3.5 h-3.5" />
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
              aria-label="Toggle menu"
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
                  scrolled
                    ? `
                      border-slate-200
                      text-ink
                      hover:bg-slate-900/5
                    `
                    : `
                      border-white/30
                      text-white
                      hover:bg-white/10
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

        {/* ==================================================
            MOBILE MENU
            ================================================== */}

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -5,
              }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              className="md:hidden overflow-hidden"
            >

              {/* Menu Container */}
              <div
                className={`
                  mx-2
                  mb-2
                  p-2

                  rounded-2xl

                  border

                  ${
                    scrolled
                      ? `
                        bg-bg
                        border-slate-200/70
                      `
                      : `
                        bg-slate-950/90
                        border-white/10
                        backdrop-blur-xl
                      `
                  }
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

                        ${
                          scrolled
                            ? `
                              text-ink
                              hover:bg-slate-900/5
                            `
                            : `
                              text-white
                              hover:bg-white/10
                            `
                        }
                      `}
                    >
                      {link.label}
                    </button>
                  ))}

                </nav>


                <div
                  className={`
                    my-2
                    border-t

                    ${
                      scrolled
                        ? 'border-slate-200/70'
                        : 'border-white/10'
                    }
                  `}
                />


                {user ? (

                  <div className="flex items-center justify-between px-3 py-2">

                    <span
                      className={`
                        flex
                        items-center
                        gap-1.5

                        text-sm
                        font-semibold

                        ${
                          scrolled
                            ? 'text-ink'
                            : 'text-white'
                        }
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

                    <button
                      type="button"
                      onClick={logout}
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

                      rounded-4xl

                      shadow-sm
                    "
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Log in
                  </button>

                )}


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
                      scrolled
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

      </header>


      <main className="flex-1">

        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>

      </main>


      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />


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

              Aviata
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
                hello@aviata.example
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
              © {new Date().getFullYear()} Aviata.
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
