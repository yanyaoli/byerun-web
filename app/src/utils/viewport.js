function readCssViewportHeight() {
  const rawValue = getComputedStyle(document.documentElement).getPropertyValue('--app-vh');
  const parsed = Number.parseFloat(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return parsed;
}

export function getViewportBaseHeight() {
  const cssHeight = readCssViewportHeight();
  if (cssHeight > 0) return cssHeight;
  return window.innerHeight || document.documentElement?.clientHeight || 0;
}

export function getViewportMetrics() {
  const layoutHeight = Math.max(0, getViewportBaseHeight());
  const viewport = window.visualViewport;
  const visibleHeight = Math.max(0, Math.min(layoutHeight, viewport?.height || layoutHeight));
  const offsetTop = Math.max(0, viewport?.offsetTop || 0);
  const visibleBottom = Math.max(0, Math.min(layoutHeight, offsetTop + visibleHeight));
  const keyboardInset = Math.max(0, layoutHeight - visibleBottom);

  return {
    layoutHeight,
    visibleHeight,
    offsetTop,
    visibleBottom,
    keyboardInset,
  };
}

export function restoreViewportPosition() {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
