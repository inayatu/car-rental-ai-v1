import { LogoMark } from "./LogoMark.jsx";
import { BRAND } from "../../lib/brand.js";

/**
 * Full-viewport boot splash: logo + two rolling wheel dots (echoing “g” and “b”).
 */
export function GbTripSiteLoader() {
  return (
    <div
      className="gb-site-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading ${BRAND.domain}`}
    >
      <div className="gb-site-loader-inner">
        <div className="gb-site-loader-mark-wrap">
          <div className="gb-site-loader-logo">
            <LogoMark size={92} title={`${BRAND.domain} logo`} />
          </div>
          <div className="gb-site-loader-wheels" aria-hidden>
            <span className="gb-loader-wheel" />
            <span className="gb-loader-wheel" />
          </div>
        </div>
        <p className="gb-site-loader-caption">{BRAND.domain}</p>
      </div>
    </div>
  );
}
