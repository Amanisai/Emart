import React from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiLogOut, FiMoon, FiSearch, FiShoppingCart, FiSun, FiUser } from "react-icons/fi";

import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [q, setQ] = React.useState(() => searchParams.get('q') || '')
  const searchRef = React.useRef(null)

  const shortcutHint = React.useMemo(() => {
    const platform = String(
      (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ""
    ).toLowerCase()
    const isMac = platform.includes('mac')
    return isMac ? '⌘K' : 'Ctrl K'
  }, [])

  React.useEffect(() => {
    const onKeyDown = (e) => {
      const key = String(e.key || '').toLowerCase()
      if (key !== 'k') return

      const isMac = shortcutHint.startsWith('⌘')
      const combo = isMac ? e.metaKey : e.ctrlKey
      if (!combo) return

      e.preventDefault()
      searchRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcutHint])

  const { cartCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const { wishlistCount } = useWishlist()
  const { isAuthed, user, logout } = useAuth()

  const activeGroup = React.useMemo(() => {
    const path = location.pathname

    const electronics = ['/mobiles', '/computers', '/ac', '/fridge', '/category/tv', '/category/speaker']
    const fashion = ['/men', '/woman', '/watch']
    const home = ['/kitchen', '/furniture', '/category/books']

    if (electronics.some((p) => path === p || path.startsWith(`${p}/`))) return 'electronics'
    if (fashion.some((p) => path === p || path.startsWith(`${p}/`))) return 'fashion'
    if (home.some((p) => path === p || path.startsWith(`${p}/`))) return 'home'
    return ''
  }, [location.pathname])

  const isAuthRoute = React.useMemo(() => {
    const p = location.pathname
    return p === '/login' || p === '/signup' || p === '/forgot'
  }, [location.pathname])

  return (
    <div className={isAuthRoute ? "navbar-section navbar-auth" : "navbar-section"}>

      <header className={isAuthRoute ? "navSection navSectionAuth" : "navSection"}>
        <Link to='/home' className="custom-link" aria-label="Go to homepage">
          <div className="title">
            <h2>E-Mart</h2>
          </div>
        </Link>

        {isAuthRoute ? (
          <div className="navActions navActionsAuth">
            <Link to="/home" className="custom-link navAction" aria-label="Back to home">
              <FiArrowLeft aria-hidden="true" />
              <span className="navActionText">Back to Home</span>
            </Link>

            <button
              type="button"
              className="themeToggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              {theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
            </button>
          </div>
        ) : (
          <>
            <form
              className="search premiumSearch"
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                const next = q.trim()
                navigate(next ? `/products?q=${encodeURIComponent(next)}` : '/products')
              }}
            >
              <FiSearch className="searchIcon" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search products"
              />
              <span className="searchHint" aria-hidden="true">{shortcutHint}</span>
            </form>

            <div className="navActions">
              <button
                type="button"
                className="themeToggle"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                title="Toggle dark mode"
              >
                {theme === "dark" ? <FiSun aria-hidden="true" /> : <FiMoon aria-hidden="true" />}
              </button>

              <Link to="/wishlist" className="custom-link navAction" aria-label="Wishlist">
                <FiHeart aria-hidden="true" />
                <span className="navActionText">Wishlist</span>
                <span className="navCount">({wishlistCount})</span>
              </Link>

              <Link to="/cart" className="custom-link navAction" aria-label="Cart">
                <FiShoppingCart aria-hidden="true" />
                <span className="navActionText">Cart</span>
                <span className="navCount">({cartCount})</span>
              </Link>

              {isAuthed ? (
                <Link
                  to={'/profile'}
                  className="custom-link navAction"
                  aria-label="Profile"
                >
                  <FiUser aria-hidden="true" />
                  <span className="navActionText">{user?.name || 'Profile'}</span>
                </Link>
              ) : (
                <Link to="/login" className="custom-link navAction navSignIn" aria-label="Sign in">
                  <FiUser aria-hidden="true" />
                  <span className="navActionText">Sign In</span>
                </Link>
              )}

              {isAuthed ? (
                <button type="button" className="navAction navLogout" onClick={logout} aria-label="Logout">
                  <FiLogOut aria-hidden="true" />
                  <span className="navActionText">Logout</span>
                </button>
              ) : null}
            </div>
          </>
        )}
      </header>
      {isAuthRoute ? null : (
      <nav className="subMenu" aria-label="Categories">
        <ul>
          <NavLink to="/products" className="custom-link">
            <li>Shop</li>
          </NavLink>

          <li className={`menuItem hasMega ${activeGroup === 'electronics' ? 'isActive' : ''}`}>
            <span className="menuLabel">Electronics</span>
            <div className="megaPanel" role="menu" aria-label="Electronics">
              <NavLink to="/mobiles" className="custom-link" role="menuitem">Mobiles</NavLink>
              <NavLink to="/computers" className="custom-link" role="menuitem">Laptops & Computers</NavLink>
              <NavLink to="/category/tv" className="custom-link" role="menuitem">TVs</NavLink>
              <NavLink to="/category/speaker" className="custom-link" role="menuitem">Speakers</NavLink>
              <NavLink to="/ac" className="custom-link" role="menuitem">AC</NavLink>
              <NavLink to="/fridge" className="custom-link" role="menuitem">Fridge</NavLink>
            </div>
          </li>

          <li className={`menuItem hasMega ${activeGroup === 'fashion' ? 'isActive' : ''}`}>
            <span className="menuLabel">Fashion</span>
            <div className="megaPanel" role="menu" aria-label="Fashion">
              <NavLink to="/men" className="custom-link" role="menuitem">Men</NavLink>
              <NavLink to="/woman" className="custom-link" role="menuitem">Women</NavLink>
              <NavLink to="/watch" className="custom-link" role="menuitem">Accessories (Watches)</NavLink>
            </div>
          </li>

          <li className={`menuItem hasMega ${activeGroup === 'home' ? 'isActive' : ''}`}>
            <span className="menuLabel">Home</span>
            <div className="megaPanel" role="menu" aria-label="Home">
              <NavLink to="/kitchen" className="custom-link" role="menuitem">Kitchen</NavLink>
              <NavLink to="/furniture" className="custom-link" role="menuitem">Furniture</NavLink>
              <NavLink to="/category/books" className="custom-link" role="menuitem">Books</NavLink>
            </div>
          </li>
        </ul>
      </nav>
      )}
    </div >
  );
};

export default Navbar;
