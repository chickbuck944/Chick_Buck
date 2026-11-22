"use strict";

(() => {
    const orderSettings = window.CHICK_BUCK_ORDER_PAGE;
    if (!orderSettings || orderSettings.enabled !== false) return;

    const message = orderSettings.closedMessage || "Online ordering is temporarily closed.";
    let closeTimer;

    const hideClosedNotice = () => {
        document.querySelector(".ordering-closed-notice")?.classList.remove("is-visible");
    };

    const showClosedNotice = () => {
        let notice = document.querySelector(".ordering-closed-notice");
        if (!notice) {
            notice = document.createElement("section");
            notice.className = "ordering-closed-notice";
            notice.setAttribute("role", "status");
            notice.setAttribute("aria-live", "polite");
            notice.innerHTML = `
                <div class="ordering-closed-notice__content">
                    <button class="ordering-closed-notice__close" type="button" aria-label="Close message">×</button>
                    <p>Chick Buck online ordering</p>
                    <h2>Ordering is temporarily closed</h2>
                    <p class="ordering-closed-notice__message"></p>
                    <a class="button button-yellow" href="mainmenu.html">Browse our menu</a>
                    <a class="button button-outline" href="contact.html">Contact Chick Buck</a>
                </div>`;
            notice.querySelector(".ordering-closed-notice__message").textContent = message;
            document.body.append(notice);
            notice.querySelector(".ordering-closed-notice__close").addEventListener("click", hideClosedNotice);
        }

        notice.classList.add("is-visible");
        window.clearTimeout(closeTimer);
        closeTimer = window.setTimeout(hideClosedNotice, 6000);
    };

    // Capture before the order page's own button listeners can open checkout or submit payment.
    document.addEventListener("click", (event) => {
        const placeButton = event.target.closest("#btnCartPlaceOrder, #btnFinalPlaceOrder");
        const link = event.target.closest("a[href]");
        let goesToOrderPage = false;
        if (link) {
            const destination = new URL(link.href, window.location.href);
            goesToOrderPage = destination.origin === window.location.origin &&
                /\/order\.html$/i.test(destination.pathname);
        }
        if (!placeButton && !goesToOrderPage) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        showClosedNotice();
    }, true);

    document.querySelectorAll("#btnCartPlaceOrder, #btnFinalPlaceOrder").forEach((button) => {
        button.setAttribute("aria-disabled", "true");
        button.title = "Online ordering is temporarily closed";
    });

    if (/(?:^|\/)order\.html$/i.test(window.location.pathname)) {
        window.setTimeout(showClosedNotice, 250);
    }
})();
