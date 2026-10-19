"use strict";

(() => {
    const orderSettings = window.CHICK_BUCK_ORDER_PAGE;
    if (!orderSettings || orderSettings.enabled !== false) return;

    const message = orderSettings.closedMessage || "Online ordering is temporarily closed.";
    const isOrderPage = /(?:^|\/)order\.html$/i.test(window.location.pathname);

    document.querySelectorAll('a[href="order.html"]').forEach((link) => {
        link.href = "#";
        link.setAttribute("aria-disabled", "true");
        link.classList.add("ordering-is-closed-link");
        link.addEventListener("click", (event) => event.preventDefault());
    });

    if (!isOrderPage) return;

    document.querySelectorAll("button, input, textarea, select").forEach((element) => {
        element.disabled = true;
    });

    const notice = document.createElement("section");
    notice.className = "ordering-closed-notice";
    notice.setAttribute("role", "status");
    notice.innerHTML = `
        <div class="ordering-closed-notice__content">
            <p>Chick Buck online ordering</p>
            <h1>Ordering is temporarily closed</h1>
            <p>${message}</p>
            <a class="button button-yellow" href="mainmenu.html">Browse our menu</a>
            <a class="button button-outline" href="contact.html">Contact Chick Buck</a>
        </div>`;
    document.body.prepend(notice);
    document.body.classList.add("ordering-is-closed");
})();
