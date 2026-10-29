"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { buttonStyles } from "@/shared/components/ui/button";
import { LOGIN_HREF, NAV_ITEMS, type NavItem } from "./nav-items";

const MOBILE_MENU_ID = "mobile-menu";

const LINK_CLASSES =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900";
const ACTIVE_LINK_CLASSES = "bg-brand-50 text-brand-800";

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavLinkProps {
  href: string;
  pathname: string;
  // Children of a group match their own path only, so "/jobs" is not active on "/jobs/new".
  exact?: boolean;
  block?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}

function NavLink({
  href,
  pathname,
  exact = false,
  block = false,
  onNavigate,
  children,
}: NavLinkProps) {
  const active = isActive(pathname, href, exact);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(LINK_CLASSES, block && "block", active && ACTIVE_LINK_CLASSES)}
    >
      {children}
    </Link>
  );
}

function DesktopGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          LINK_CLASSES,
          "inline-flex items-center gap-1",
          isActive(pathname, item.href, false) && ACTIVE_LINK_CLASSES,
        )}
      >
        {item.label}
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul
          id={menuId}
          className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
        >
          {item.children?.map((child) => (
            <li key={child.href}>
              <NavLink
                href={child.href}
                pathname={pathname}
                exact
                block
                onNavigate={() => setOpen(false)}
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobilePanel({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div
      id={MOBILE_MENU_ID}
      className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-slate-200 bg-white px-4 pb-4 shadow-lg md:hidden"
    >
      <ul className="flex flex-col gap-1 pt-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            {item.children ? (
              <>
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </p>
                <ul className="flex flex-col gap-1">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <NavLink
                        href={child.href}
                        pathname={pathname}
                        exact
                        block
                        onNavigate={onNavigate}
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <NavLink
                href={item.href}
                pathname={pathname}
                block
                onNavigate={onNavigate}
              >
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
      {/* D2 replaces this with the session-aware account menu. */}
      <Link
        href={LOGIN_HREF}
        onClick={onNavigate}
        className={buttonStyles({ className: "mt-3 w-full" })}
      >
        Ingresar a mi cuenta
      </Link>
    </div>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) =>
          item.children ? (
            <DesktopGroup key={item.href} item={item} pathname={pathname} />
          ) : (
            <NavLink key={item.href} href={item.href} pathname={pathname}>
              {item.label}
            </NavLink>
          ),
        )}
        {/* D2 replaces this with the session-aware account menu. */}
        <Link
          href={LOGIN_HREF}
          className={buttonStyles({ size: "sm", className: "ml-2" })}
        >
          Ingresar a mi cuenta
        </Link>
      </nav>

      <button
        type="button"
        aria-expanded={mobileOpen}
        aria-controls={MOBILE_MENU_ID}
        aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setMobileOpen((current) => !current)}
        className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
      >
        {mobileOpen ? (
          <X aria-hidden className="size-6" />
        ) : (
          <Menu aria-hidden className="size-6" />
        )}
      </button>
      {/* No wrapper: the panel is absolute, so it stays out of the header's flex row. */}
      {mobileOpen && (
        <MobilePanel
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
