import React from 'react';

export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, children, ...props }, ref) => {
  return (
    <a href={typeof to === 'string' ? to : '#'} ref={ref} {...props}>
      {children}
    </a>
  );
});

Link.displayName = 'Link';

export const useNavigate = () => {
  return (to: any) => {
    if (typeof to === 'string') {
      window.location.href = to;
    }
  };
};

export const useLocation = () => ({
  pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
  search: typeof window !== 'undefined' ? window.location.search : '',
  hash: typeof window !== 'undefined' ? window.location.hash : '',
  state: null,
  key: 'default',
});

export const useHref = (to: any) => (typeof to === 'string' ? to : '#');
export const useResolvedPath = (to: any) => ({ pathname: typeof to === 'string' ? to : '' });
export const Route = ({ children }: any) => children;
export const Routes = ({ children }: any) => children;
export const BrowserRouter = ({ children }: any) => children;
export const HashRouter = ({ children }: any) => children;
export const Router = ({ children }: any) => children;
export const NavLink = Link;

// Mock any UNSAFE internal react-router-dom exports that might be referenced by packages
export const UNSAFE_NavigationContext = React.createContext(null);
export const UNSAFE_LocationContext = React.createContext(null);
export const UNSAFE_RouteContext = React.createContext(null);
export const UNSAFE_logV6DeprecationWarnings = () => {};
export const UNSAFE_mapRouteProperties = () => {};
export const UNSAFE_useRoutesImpl = () => null;
export const UNSAFE_useRouteId = () => null;
export const UNSAFE_DataRouterContext = React.createContext(null);
export const UNSAFE_DataRouterStateContext = React.createContext(null);

export const useMatches = () => [];
export const useNavigation = () => ({ state: 'idle' });
export const useBlocker = () => null;
export const createPath = (loc: any) => loc?.pathname || '';
export class AbortedDeferredError extends Error {}
