/**
 * Placeholder ad slot. Renders nothing visible and takes no space until ads are enabled.
 * When AdSense is approved: give `.ad-slot` a min-height matching the unit (prevents
 * layout shift) and insert the <ins class="adsbygoogle"> tag here.
 */
export function AdSlot({ id }: { id: string }) {
  return <div className="ad-slot" data-ad-slot={id} aria-hidden="true" />;
}
