"use strict";

document.addEventListener("DOMContentLoaded", () => {

    

    const contactForm =
        document.getElementById("chickBuckContactForm");

    const formStatus =
        document.getElementById("contactFormStatus");

    const subjectField =
        document.getElementById("contactSubject");

    const messageField =
        document.getElementById("contactMessage");

    const regionButtons =
        document.querySelectorAll(".contact-region-button");


    const updateStatus = (message, type = "") => {

        if (!formStatus) {
            return;
        }

        formStatus.textContent = message;

        formStatus.classList.remove(
            "is-success",
            "is-error"
        );

        if (type) {
            formStatus.classList.add(`is-${type}`);
        }
    };


    const showExternalFallback = (
        message,
        url,
        linkLabel
    ) => {
        updateStatus(message, "error");

        if (!formStatus) {
            return;
        }

        const fallbackLink = document.createElement("a");
        fallbackLink.href = url;
        fallbackLink.target = "_blank";
        fallbackLink.rel = "noopener noreferrer";
        fallbackLink.textContent = linkLabel;

        formStatus.append(
            document.createTextNode(" "),
            fallbackLink
        );
    };


    const openExternal = (
        url,
        successMessage,
        fallbackLabel
    ) => {
        let externalWindow = null;

        try {
            externalWindow = window.open(url, "_blank");
        } catch (error) {
            externalWindow = null;
        }

        if (externalWindow) {
            try {
                externalWindow.opener = null;
            } catch (error) {
                // The destination still opened safely in a separate tab.
            }

            updateStatus(successMessage, "success");
            return true;
        }

        showExternalFallback(
            "Your browser blocked the new tab.",
            url,
            fallbackLabel
        );

        return false;
    };


    const clearInvalidState = (field) => {
        field.classList.remove("is-invalid");
    };


    contactForm
        ?.querySelectorAll("input, select, textarea")
        .forEach((field) => {

            field.addEventListener("input", () => {
                clearInvalidState(field);
                updateStatus("");
            });

            field.addEventListener("change", () => {
                clearInvalidState(field);
                updateStatus("");
            });

        });


    
    const contactDestinations = Object.freeze({
        email: "infochickbuck@gmail.com",
        whatsapp: "917510144244"
    });


    const prepareEnquiry = () => {
        if (!contactForm) {
            return null;
        }

        const fieldsToValidate = Array.from(
            contactForm.querySelectorAll("input, select, textarea")
        ).filter(
            (field) =>
                field.required ||
                String(field.value || "").trim() !== ""
        );

        const invalidFields = fieldsToValidate.filter(
            (field) => !field.checkValidity()
        );

        fieldsToValidate.forEach((field) => {
            field.classList.toggle(
                "is-invalid",
                !field.checkValidity()
            );
        });

        if (invalidFields.length > 0) {
            updateStatus(
                "Please complete the required fields correctly.",
                "error"
            );

            invalidFields[0].focus();
            return null;
        }

        const formData = new FormData(contactForm);
        const name = String(formData.get("name") || "").trim();
        const phone = String(formData.get("phone") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const subject = String(formData.get("subject") || "").trim();
        const message = String(formData.get("message") || "").trim();

        return {
            subject: `Chick Buck Enquiry - ${subject}`,
            message: [
                "Chick Buck Enquiry",
                `Name: ${name}`,
                phone ? `Phone: ${phone}` : "",
                email ? `Email: ${email}` : "",
                `Enquiry: ${subject}`,
                "",
                message
            ].filter(Boolean).join("\n")
        };
    };


    contactForm?.addEventListener("submit", (event) => {

        event.preventDefault();

        const enquiry = prepareEnquiry();

        if (!enquiry) {
            return;
        }

        const method =
            event.submitter?.dataset.contactMethod ||
            "email";

        if (method === "whatsapp") {
            const whatsappURL =
                `https://wa.me/${contactDestinations.whatsapp}` +
                `?text=${encodeURIComponent(enquiry.message)}`;

            openExternal(
                whatsappURL,
                "WhatsApp opened with your enquiry ready to send.",
                "Open WhatsApp"
            );
            return;
        }

        const emailURL =
            "https://mail.google.com/mail/?view=cm&fs=1" +
            `&to=${encodeURIComponent(contactDestinations.email)}` +
            `&su=${encodeURIComponent(enquiry.subject)}` +
            `&body=${encodeURIComponent(enquiry.message)}`;

        openExternal(
            emailURL,
            "Gmail opened with your enquiry ready to send.",
            "Open Gmail"
        );

    });



    

    regionButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const inquiry =
                button.dataset.contactInquiry ||
                "Outlet Enquiry";

            const message =
                button.dataset.contactMessage || "";


            if (subjectField) {

                subjectField.value = inquiry;

                subjectField.classList.remove(
                    "is-invalid"
                );

            }


            if (messageField) {

                messageField.value = message;

                messageField.classList.remove(
                    "is-invalid"
                );

            }


            document
                .getElementById("contactForm")
                ?.scrollIntoView({

                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches
                        ? "auto"
                        : "smooth",

                    block: "start"

                });


            window.setTimeout(() => {

                messageField?.focus();

            }, 550);

        });

    });



    

    const nearestButtons =
        document.querySelectorAll(".js-find-nearest");

    const locatorStatus =
        document.getElementById("outletLocatorStatus");


    const updateLocatorStatus = (
        message,
        type = ""
    ) => {

        if (!locatorStatus) {
            return;
        }


        locatorStatus.textContent = message;


        locatorStatus.classList.remove(
            "is-success",
            "is-error"
        );


        if (type) {

            locatorStatus.classList.add(
                `is-${type}`
            );

        }

    };


    const setLoadingState = (isLoading) => {

        nearestButtons.forEach((button) => {

            button.classList.toggle(
                "is-loading",
                isLoading
            );


            if ("disabled" in button) {

                button.disabled = isLoading;

            }

        });

    };

    const showLocatorMapLink = (message, url, type = "error") => {
        updateLocatorStatus(message, type);

        if (!locatorStatus) return;

        const mapLink = document.createElement("a");
        mapLink.href = url;
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapLink.textContent = "Open Chick Buck in Google Maps";

        locatorStatus.append(document.createTextNode(" "), mapLink);
    };

    const openLocatorMap = (url, message, type = "success") => {
        updateLocatorStatus(message, type);

        
        
        window.location.assign(url);
    };


    const openNearestOutletSearch = () => {

        const fallbackURL =
            "https://www.google.com/maps/search/?api=1&query=Chick%20Buck";


        

        if (!navigator.geolocation) {

            showLocatorMapLink(
                "Location is not supported on this device.",
                fallbackURL
            );

            return;
        }


        updateLocatorStatus(
            "Getting your location..."
        );


        setLoadingState(true);


        navigator.geolocation.getCurrentPosition(

            

            (position) => {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                const mapsURL =
                    `https://www.google.com/maps/search/?api=1&query=Chick%20Buck&center=${latitude},${longitude}`;


                openLocatorMap(
                    mapsURL,
                    "Opening Chick Buck outlets near your location."
                );


                setLoadingState(false);

            },


            

            () => {

                openLocatorMap(
                    fallbackURL,
                    "We could not access your location. Opening Chick Buck in Google Maps instead.",
                    "error"
                );


                setLoadingState(false);

            },


            

            {

                enableHighAccuracy: false,

                timeout: 10000,

                maximumAge: 300000

            }

        );

    };



    

    nearestButtons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                document
                    .getElementById(
                        "outletLocator"
                    )
                    ?.scrollIntoView({

                        behavior:
                            window.matchMedia(
                                "(prefers-reduced-motion: reduce)"
                            ).matches
                                ? "auto"
                                : "smooth",

                        block: "start"

                    });


                openNearestOutletSearch();

            }
        );

    });


    

    const outletSlides = Object.freeze({
        vengara: {
            name: "Vengara",
            region: "Kerala outlet",
            address: "SS Road, Vettuthode, Vengara",
            query: "Chick Buck Vengara",
            whatsapp: "919745944944"
        },
        parappanangadi: {
            name: "Parappanangadi",
            region: "Kerala outlet",
            address: "Parappanangadi, Malappuram, Kerala",
            query: "Chick Buck Parappanangadi",
            whatsapp: "917025204501"
        },
        malappuram: {
            name: "Malappuram",
            region: "Kerala outlet",
            address: "Malappuram, Kerala",
            query: "Chick Buck Malappuram",
            whatsapp: "919656200606"
        },
        puthanathani: {
            name: "Puthanathani",
            region: "Kerala outlet",
            address: "Puthanathani, Malappuram, Kerala",
            query: "Chick Buck Puthanathani",
            whatsapp: "919846312316"
        },
        kadappadi: {
            name: "Kadappadi",
            region: "Kerala outlet",
            address: "Kadappadi, Malappuram, Kerala",
            query: "Chick Buck Kadappadi",
            whatsapp: "919744030378"
        },
        tirur: {
            name: "Tirur",
            region: "Kerala outlet",
            address: "Tirur, Kerala",
            // Google Maps coordinates resolved from the official Tirur map link.
            // Short maps.app links cannot be embedded in an iframe.
            query: "10.9306216,75.932719",
            map: "https://maps.app.goo.gl/LN4kVhTub9RVVKZt6",
            whatsapp: "919744354373"
        },
        "ksa-shop-1": {
            name: "Jeddah Shop 1",
            region: "Kingdom of Saudi Arabia",
            address: "Chick Buck, Jeddah — 21.4158058, 39.2791672",
            query: "21.41580581665039,39.27916717529297",
            map: "https://maps.google.com/maps/search/Chick%20Buck/@21.41580581665039,39.27916717529297,17z?hl=en",
            whatsapp: "966538489145"
        },
        "ksa-shop-2": {
            name: "Jeddah Shop 2",
            region: "Kingdom of Saudi Arabia",
            address: "Chick Buck, Jeddah",
            query: "Chick Buck Jeddah Saudi Arabia",
            map: "https://maps.app.goo.gl/89ZrRMgK2Ho7My5h6?g_st=ipc",
            whatsapp: "966538865706"
        },
        uae: {
            name: "Abu Dhabi",
            region: "United Arab Emirates",
            address: "Abu Dhabi, United Arab Emirates",
            query: "Chick Buck Abu Dhabi",
            whatsapp: "97125555119"
        }
    });

    const outletOrder = Object.keys(outletSlides);
    const outletDetail = document.getElementById("outletDetails");
    const outletName = document.getElementById("outletDetailName");
    const outletRegion = document.getElementById("outletDetailRegion");
    const outletAddress = document.getElementById("outletDetailAddress");
    const outletStatus = document.getElementById("outletDetailStatus");
    const outletMapLink = document.getElementById("outletDetailMapLink");
    const outletWhatsAppLink = document.getElementById("outletDetailWhatsAppLink");
    const outletWhatsAppLabel = document.getElementById("outletDetailWhatsAppLabel");
    const outletCallLink = document.getElementById("outletDetailCallLink");
    const outletCallLabel = document.getElementById("outletDetailCallLabel");
    const outletMapFrame = document.getElementById("outletDetailMapFrame");
    const outletMapContainer = outletMapFrame?.closest(".outlet-detail-map");
    const outletPrevious = document.getElementById("outletDetailPrevious");
    const outletNext = document.getElementById("outletDetailNext");
    const outletSelectors = document.querySelectorAll("[data-outlet-select]");

    let activeOutlet = "vengara";

    const outletURLs = (outlet) => {
        const query = outlet.query ? encodeURIComponent(outlet.query) : "";
        const message = encodeURIComponent(
            `Hello Chick Buck, I would like information about your ${outlet.name} outlet.`
        );

        return {
            map: outlet.map || `https://www.google.com/maps/search/?api=1&query=${query}`,
            embed: `https://www.google.com/maps?q=${query}&output=embed`,
            whatsapp: `https://wa.me/${outlet.whatsapp || contactDestinations.whatsapp}?text=${message}`,
            call: `tel:+${outlet.whatsapp || contactDestinations.whatsapp}`
        };
    };

    const updateOutletURL = (slug, mode) => {
        if (!window.history || !mode) {
            return;
        }

        try {
            const url = new URL(window.location.href);
            url.searchParams.set("outlet", slug);
            url.hash = "outletDetails";
            window.history[mode](
                { outlet: slug },
                "",
                url
            );
        } catch (error) {
            
        }
    };

    const showOutlet = (
        slug,
        { scroll = false, historyMode = "" } = {}
    ) => {
        if (!outletDetail) {
            return;
        }

        const safeSlug = outletSlides[slug] ? slug : "vengara";
        const outlet = outletSlides[safeSlug];
        const urls = outletURLs(outlet);
        const position = outletOrder.indexOf(safeSlug);

        activeOutlet = safeSlug;

        if (outletName) outletName.textContent = outlet.name;
        if (outletRegion) outletRegion.textContent = outlet.region;
        if (outletAddress) outletAddress.textContent = outlet.address;
        if (outletStatus) outletStatus.textContent = `${position + 1} of ${outletOrder.length}`;

        const hasMap = Boolean(outlet.query || outlet.map);
        if (outletMapLink) {
            outletMapLink.href = urls.map;
            outletMapLink.hidden = !hasMap;
        }
        if (outletMapContainer) outletMapContainer.hidden = !hasMap;
        if (outletWhatsAppLink) outletWhatsAppLink.href = urls.whatsapp;
        if (outletWhatsAppLabel) outletWhatsAppLabel.textContent = "WhatsApp";
        if (outletCallLink) outletCallLink.href = urls.call;
        if (outletCallLabel) outletCallLabel.textContent = "Call";

        if (hasMap && outletMapFrame && outletMapFrame.src !== urls.embed) {
            outletMapFrame.src = urls.embed;
            outletMapFrame.title = `Map showing Chick Buck ${outlet.name}`;
        }

        outletSelectors.forEach((selector) => {
            const isSelected = selector.dataset.outletSelect === safeSlug;
            selector.classList.toggle("is-selected", isSelected);

            if (isSelected) {
                selector.setAttribute("aria-current", "true");
            } else {
                selector.removeAttribute("aria-current");
            }
        });

        updateOutletURL(safeSlug, historyMode);

        if (scroll) {
            outletDetail.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                block: "start"
            });
        }
    };

    outletSelectors.forEach((selector) => {
        selector.addEventListener("click", (event) => {
            event.preventDefault();
            showOutlet(selector.dataset.outletSelect, {
                scroll: true,
                historyMode: "pushState"
            });
        });
    });

    const showAdjacentOutlet = (direction) => {
        const currentIndex = outletOrder.indexOf(activeOutlet);
        const nextIndex =
            (currentIndex + direction + outletOrder.length) % outletOrder.length;

        showOutlet(outletOrder[nextIndex], {
            scroll: false,
            historyMode: "pushState"
        });
    };

    outletPrevious?.addEventListener("click", () => showAdjacentOutlet(-1));
    outletNext?.addEventListener("click", () => showAdjacentOutlet(1));

    window.addEventListener("popstate", () => {
        const slug = new URLSearchParams(window.location.search).get("outlet");
        showOutlet(slug || "vengara");
    });

    const requestedOutlet =
        new URLSearchParams(window.location.search).get("outlet");

    showOutlet(requestedOutlet || "vengara");

});
