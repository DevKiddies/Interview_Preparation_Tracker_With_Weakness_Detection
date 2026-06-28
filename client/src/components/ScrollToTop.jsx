// ScrollToTop.jsx — resets the scroll position to the top on every route change.
// Without this, navigating to a new page would keep the previous scroll position.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null; // purely behavioural — renders nothing
}
