"use strict";

// Google Analytics is loaded only after a visitor opts in.
(() => {
    const consentKey = "chickbuck_analytics_consent";
    const measurementId = "G-Y1CP7LSM52";
    const currentConsent = localStorage.getItem(consentKey);

    const loadGoogleAnalytics = () => {
        if (document.querySelector("script[data-chickbuck-ga]")) return;

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };
        window.gtag("js", new Date());
        window.gtag("config", measurementId, {
            anonymize_ip: true
        });

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        script.dataset.chickbuckGa = "true";
        document.head.appendChild(script);
    };

    const removeBanner = () => {
        document.getElementById("cookieConsentBanner")?.remove();
    };

    const showBanner = () => {
        if (document.getElementById("cookieConsentBanner")) return;

        const banner = document.createElement("section");
        banner.id = "cookieConsentBanner";
        banner.className = "cookie-consent-banner";
        banner.setAttribute("role", "dialog");
        banner.setAttribute("aria-label", "Cookie preferences");
        banner.innerHTML = `
            <div>
                <strong>Cookie preferences</strong>
                <p>We use Google Analytics only with your permission to understand website visits. Read our <a href="cookies.html">Cookie Policy</a>.</p>
            </div>
            <div class="cookie-consent-actions">
                <button type="button" class="cookie-consent-reject">Reject</button>
                <button type="button" class="cookie-consent-accept">Accept analytics</button>
            </div>
        `;

        banner.querySelector(".cookie-consent-reject").addEventListener("click", () => {
            localStorage.setItem(consentKey, "denied");
            removeBanner();
        });
        banner.querySelector(".cookie-consent-accept").addEventListener("click", () => {
            localStorage.setItem(consentKey, "granted");
            loadGoogleAnalytics();
            removeBanner();
        });

        document.body.appendChild(banner);
        banner.querySelector(".cookie-consent-accept").focus();
    };

    const addSettingsButton = () => {
        if (document.getElementById("cookieSettingsButton")) return;

        const button = document.createElement("button");
        button.id = "cookieSettingsButton";
        button.type = "button";
        button.className = "cookie-settings-button";
        button.textContent = "Cookie settings";
        button.addEventListener("click", () => {
            localStorage.removeItem(consentKey);
            showBanner();
        });
        document.body.appendChild(button);
    };

    document.addEventListener("DOMContentLoaded", () => {
        if (currentConsent === "granted") loadGoogleAnalytics();
        if (!currentConsent) showBanner();
        addSettingsButton();
    });
})();
