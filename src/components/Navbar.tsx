import React, { useEffect, useRef } from 'react';
import { NavTab } from '../types';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

const links: { id: NavTab; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'archive', label: 'Việt phục Archive' },
  { id: 'studio', label: 'Styling Studio' },
  { id: 'manifesto', label: 'Manifesto' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, open, onOpenChange, disabled = false }) => {
  const panel = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number>();
  const cancelClose = () => window.clearTimeout(closeTimer.current);
  useEffect(() => {
    cancelClose();
    if (open) panel.current?.removeAttribute('inert');
    else panel.current?.setAttribute('inert', '');
    return cancelClose;
  }, [open]);

  return (
    <div
      className={`navbar-shell${open ? ' is-open' : ''}`}
      onPointerEnter={(event) => {
        cancelClose();
        // The trigger has its own click action; hover must not toggle it twice.
        if (event.pointerType === 'mouse' && !disabled && !trigger.current?.contains(event.target as Node)) onOpenChange(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse' || panel.current?.contains(document.activeElement)) return;
        cancelClose();
        closeTimer.current = window.setTimeout(() => onOpenChange(false), 220);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) onOpenChange(false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onOpenChange(false);
          trigger.current?.focus();
        }
        if (event.key === 'Tab' && open) {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
          const first = buttons[0], last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}
    >
      <button
        ref={trigger}
        className="navbar-trigger"
        aria-label={open ? 'Đóng menu' : 'Mở menu điều hướng'}
        aria-expanded={open}
        aria-controls="atelier-navigation"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
      >
        <span className="navbar-trigger__hint" aria-hidden="true" />
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <header ref={panel} id="atelier-navigation" className="navbar-panel" aria-hidden={!open}>
        <button className="navbar-brand" onClick={() => onSelectTab('explore')}>V-Styler Atelier</button>
        <nav aria-label="Điều hướng chính">
          {links.map(link => (
            <button
              key={link.id}
              aria-current={activeTab === link.id ? 'page' : undefined}
              onClick={() => onSelectTab(link.id)}
            >{link.label}</button>
          ))}
        </nav>
      </header>
    </div>
  );
};
