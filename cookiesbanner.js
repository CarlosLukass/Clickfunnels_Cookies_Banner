(function () {
  const termsPolicyUrl =
    window.termsPolicyUrl || "https://example.com/privacy-policy";
  const consentCookieName = "cookie_consent";
  const acceptedValue = "accepted";
  const declinedValue = "declined";

  function setConsent(value) {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6); // 6-month expiration
    document.cookie = `${consentCookieName}=${value}; expires=${expiry.toUTCString()}; path=/`;
  }

  function getConsent() {
    const match = document.cookie.match(
      new RegExp(`${consentCookieName}=([^;]+)`)
    );
    return match ? match[1] : null;
  }

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
        <div style="width:100%; border-radius: 16px; max-width:520px; background-color:#0e0e0e; background:url(https://images.clickfunnels.com/9f/db7f8363154ca0819be8bd088a6333/Background-Testimonials-1-.jpg); background-size: cover; color:#fff; padding:15px; text-align:left; font-family:sans-serif; z-index:100000; box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;">
          <p style="font-size:14px; color:#ccc; margin: 10px 0px; line-height: 1.4">
            <b>We use Cookies</b> to process personal data & improve your experience on our site. By clicking “Accept All”, you accept these Cookies. For more details on how we collect & use data, please see our <a style="color: #fff; opacity: 0.9;" href="${termsPolicyUrl}" target="_blank" rel="noopener">privacy policy</a>.
          </p>
          <div style="margin-top: 0px; text-align:right">
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
        startAffiliateTracker();
      });
  };

  // --- Affiliate Tracker Logic (runs only if NOT accepted) ---
  function startAffiliateTracker() {
    function getSnowplowDuid() {
      try {
        const cookie = document.cookie.match(/_sp_id\..*?=([^;]+)/);
        const value = cookie ? decodeURIComponent(cookie[1]) : null;
        const parts = value ? value.split(".") : [];
        return {
          domain_userid: parts[0] || "",
          domain_sessionidx: parts[6] || "",
          domain_sessionid: parts[7] || "",
        };
      } catch (e) {
        return {
          domain_userid: "",
          domain_sessionidx: "",
          domain_sessionid: "",
        };
      }
    }

    window.timout_aff = setInterval(function () {
      const form = document.forms["cfAR"];
      const here = new URL(location);
      const urlAff = here.searchParams.get("a");
      const urlSource = here.searchParams.get("source");
      const locAff = localStorage.getItem("affiliate");
      const affiliate_id = urlAff || locAff;

      if (form) {
        fetch("https://tracking.mastermind.com/ping/")
          .then((res) => res.json())
          .then((data) => {
            const snowplowData = getSnowplowDuid();
            const affData = {
              affiliate_id: affiliate_id || "",
              sub_id: source || "",
              domain_userid: snowplowData.domain_userid || "",
              domain_sessionidx: snowplowData.domain_sessionidx || "",
              domain_sessionid: snowplowData.domain_sessionid || "",
              IP: data.ip,
            };

            form.elements["contact[cart_affiliate_id]"].value =
              JSON.stringify(affData);

            try {
              const parsed = JSON.parse(
                form.elements["contact[cart_affiliate_id]"].value
              );
              if (typeof parsed === "object") {
                console.log("System Ready...");
                clearInterval(window.timout_aff);
              } else {
                console.log("System Not Ready...", "Cart Not An Object");
              }
            } catch (e) {
              console.log("System Not Ready...", "JSON Parse Error");
            }
          });
      } else {
        console.log("System Not Ready...", "cfAR Not Created");
      }
    }, 2000);
  }

  // --- Consent Logic ---
  const consent = getConsent();
  if (consent === acceptedValue) {
    enableTrackingScripts();
  } else {
    if (!consent) {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", window.showBanner);
      } else {
        window.showBanner();
      }
    }
  }
})();
