import { useEffect, useRef } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface HotkeyOption {
  keys: string;
  callback: KeyHandler;
  enableInInput?: boolean;
}

export function useHotkeys(hotkeys: HotkeyOption[]) {
  const hotkeysRef = useRef(hotkeys);

  // Keep ref synchronized with latest array, without causing useEffect to re-run
  useEffect(() => {
    hotkeysRef.current = hotkeys;
  }, [hotkeys]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if shortcuts are globally disabled
      const shortcutsEnabled = localStorage.getItem('klavora-shortcuts-enabled') !== 'false';
      if (!shortcutsEnabled) return;

      const target = e.target as HTMLElement;
      
      const isInputFocused = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT' || 
        target.isContentEditable;

      for (const hotkey of hotkeysRef.current) {
        if (isInputFocused && !hotkey.enableInInput) {
          continue;
        }

        const keys = hotkey.keys.toLowerCase().split('+').map(k => k.trim());
        
        const requiresCtrl = keys.includes('ctrl');
        const requiresShift = keys.includes('shift');
        const requiresAlt = keys.includes('alt');
        const requiresMeta = keys.includes('meta');
        
        const mainKey = keys.find(k => !['ctrl', 'shift', 'alt', 'meta'].includes(k));

        const isCtrlMatch = requiresCtrl ? e.ctrlKey : !e.ctrlKey;
        const isShiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
        const isAltMatch = requiresAlt ? e.altKey : !e.altKey;
        const isMetaMatch = requiresMeta ? e.metaKey : !e.metaKey;
        
        const eventKey = e.key.toLowerCase();
        let isMainKeyMatch = false;
        
        if (mainKey === 'enter' && eventKey === 'enter') isMainKeyMatch = true;
        else if (mainKey === 'escape' && eventKey === 'escape') isMainKeyMatch = true;
        else if (mainKey === 'esc' && eventKey === 'escape') isMainKeyMatch = true;
        else if (mainKey === eventKey) isMainKeyMatch = true;
        
        if (isCtrlMatch && isShiftMatch && isAltMatch && isMetaMatch && isMainKeyMatch) {
          e.preventDefault();
          hotkey.callback(e);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
