(function () {
  const termsPolicyUrl =
    window.termsPolicyUrl || "https://example.com/privacy-policy"; // fallback

  const consentCookieName = "cookie_consent";
  const acceptedValue = "accepted";
  const declinedValue = "declined";

  function setConsent(value) {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6);
    document.cookie = `${consentCookieName}=${value}; expires=${expiry.toUTCString()}; path=/`;
  }

  function getConsent() {
    const match = document.cookie.match(
      new RegExp(`${consentCookieName}=([^;]+)`)
    );
    return match ? match[1] : null;
  }
  //
  function enableTrackingScripts() {
    const scripts = document.querySelectorAll(
      'script[type="text/plain"][data-cookieconsent="tracking"]'
    );
    scripts.forEach((original) => {
      const newScript = document.createElement("script");
      if (original.src) {
        newScript.src = original.src;
      } else {
        newScript.innerHTML = original.innerHTML;
      }
      newScript.type = "text/javascript";
      document.head.appendChild(newScript);
    });
  }

  window.showBanner = function () {
    if (document.getElementById("gdpr-banner")) return;

    const bannerHtml = `
      <div id="gdpr-banner" style="position:fixed; bottom:0; right:0; z-index:100000; padding:10px;">
        <div style="width:100%; border-radius: 16px; max-width:520px; background-color:#0e0e0e; background:url(https://images.clickfunnels.com/9f/db7f8363154ca0819be8bd088a6333/Background-Testimonials-1-.jpg); background-size: cover; color:#fff; padding:30px; text-align:left; font-family:sans-serif; z-index:100000; box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;">
          <h3 style="margin-top: 0px">🍪 Cookie Settings</h3>
          <p style="font-size:14px; color:#ccc; margin: 10px 0px; line-height: 1.4">
            We use Cookies to process personal data & improve your experience on our site. By clicking “Accept All”, you accept these Cookies. For more details  on how we collect & use data, please see our <a style="color: #fff; opacity: 0.9;" href="${termsPolicyUrl}" target="_blank" rel="noopener">privacy policy</a>.
          </p>
          <div style="margin-top: 20px; text-align:right">
            <button id="declineCookies" style="background:transparent; color:#ccc; border:none; padding:8px 12px; cursor:pointer;">Decline</button>
            <button id="acceptCookies" style="background:#fff; color:#0e0e0e; border:none; padding:8px 20px; border-radius:6px; cursor:pointer;">Accept All</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", bannerHtml);

    document
      .getElementById("acceptCookies")
      .addEventListener("click", function () {
        setConsent(acceptedValue);
        document.getElementById("gdpr-banner").remove();
        enableTrackingScripts();
      });

    document
      .getElementById("declineCookies")
      .addEventListener("click", function () {
        setConsent(declinedValue);
        document.getElementById("gdpr-banner").remove();
      });
  };

  const consent = getConsent();
  if (consent === acceptedValue) {
    enableTrackingScripts();
  } else if (!consent) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", window.showBanner);
    } else {
      window.showBanner();
    }
  }
})();
