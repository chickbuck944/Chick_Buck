"use strict";

const CHICK_BUCK_NAV_PREVIOUS_INDEX = "chickBuckNavPreviousIndex";
const CHICK_BUCK_THEME_KEY = "chickBuckTheme";

const applyChickBuckTheme = (theme) => {
    const isDarkTheme = theme === "dark";

    document.documentElement.toggleAttribute(
        "data-chickbuck-dark",
        isDarkTheme
    );

    return isDarkTheme;
};

try {
    applyChickBuckTheme(
        window.localStorage.getItem(CHICK_BUCK_THEME_KEY) === "dark"
            ? "dark"
            : "light"
    );
} catch (error) {
    applyChickBuckTheme("light");
}

const canUsePageTransition = (event, link) => {
    if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank" ||
        link.hasAttribute("download")
    ) {
        return false;
    }

    const destination = new URL(link.href, window.location.href);
    const currentLocation = new URL(window.location.href);
    const isSameSite =
        destination.origin === currentLocation.origin ||
        (destination.protocol === "file:" && currentLocation.protocol === "file:");

    if (!isSameSite || !["http:", "https:", "file:"].includes(destination.protocol)) {
        return false;
    }

    const isSameDocument =
        destination.pathname === currentLocation.pathname &&
        destination.search === currentLocation.search;

    return !isSameDocument;
};

const navigateWithPageTransition = (
    event,
    link,
    { previousIndex = null } = {}
) => {
    if (!canUsePageTransition(event, link)) {
        return false;
    }

    if (Number.isInteger(previousIndex)) {
        try {
            window.sessionStorage.setItem(
                CHICK_BUCK_NAV_PREVIOUS_INDEX,
                String(previousIndex)
            );
        } catch (error) {
           
        }
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return false;
    }

    event.preventDefault();
    document.body.classList.add("page-leaving");

    window.setTimeout(() => {
        window.location.href = link.href;
    }, 220);

    return true;
};

document.addEventListener("DOMContentLoaded", () => {

    

    const glassNavbar = document.querySelector(".glass-navbar");
    const visitOutletButton = glassNavbar?.querySelector(
        ".glass-visit-button"
    );
    const mobileMenuButton = glassNavbar?.querySelector(
        ".glass-menu-toggle"
    );

    if (glassNavbar && visitOutletButton && mobileMenuButton) {
        const navigationActions = document.createElement("div");
        navigationActions.className = "glass-nav-actions";

        visitOutletButton.before(navigationActions);
        navigationActions.appendChild(visitOutletButton);

        const themeButton = document.createElement("button");
        themeButton.className = "glass-theme-toggle";
        themeButton.type = "button";
        themeButton.innerHTML = `
            <span class="glass-theme-icons" aria-hidden="true">
                <svg class="glass-theme-icon glass-theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path>
                </svg>
                <svg class="glass-theme-icon glass-theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"></path>
                </svg>
            </span>
            <span class="sr-only" data-theme-toggle-label></span>
        `;

        navigationActions.appendChild(themeButton);

        const updateThemeButton = () => {
            const isDarkTheme = document.documentElement.hasAttribute(
                "data-chickbuck-dark"
            );
            const themeLabel = themeButton.querySelector(
                "[data-theme-toggle-label]"
            );
            const nextThemeLabel = isDarkTheme
                ? "Switch to light mode"
                : "Switch to dark mode";

            themeButton.setAttribute("aria-label", nextThemeLabel);
            themeButton.setAttribute("title", nextThemeLabel);
            themeButton.setAttribute("aria-pressed", String(isDarkTheme));

            if (themeLabel) {
                themeLabel.textContent = nextThemeLabel;
            }
        };

        updateThemeButton();

        themeButton.addEventListener("click", () => {
            const nextTheme = document.documentElement.hasAttribute(
                "data-chickbuck-dark"
            )
                ? "light"
                : "dark";

            applyChickBuckTheme(nextTheme);

            try {
                window.localStorage.setItem(
                    CHICK_BUCK_THEME_KEY,
                    nextTheme
                );
            } catch (error) {
                // The theme still works if browser storage is unavailable.
            }

            updateThemeButton();
        });

    }

    

    const pageLoader = document.getElementById("pageLoader");
    const loaderVideo = document.getElementById("loaderVideo");
    const skipLoader = document.getElementById("skipLoader");

    let loaderClosed = false;
    let loaderSafetyTimer = 0;
    const loaderClosedEventName = "chickbuck:loader-closed";
    const loaderSessionKey = "chickbuck:loader-seen";
    const loaderEnabled = window.CHICK_BUCK_SEASONAL?.loader?.enabled !== false;
    const configuredLoaderSeconds = Number(
        window.CHICK_BUCK_SEASONAL?.loader?.maxDisplaySeconds
    );
    const loaderMaxDisplayMilliseconds =
        Number.isFinite(configuredLoaderSeconds) &&
        configuredLoaderSeconds >= 1 &&
        configuredLoaderSeconds <= 20
            ? configuredLoaderSeconds * 1000
            : 8000;
    const loaderFadeMilliseconds = 350;

    const unlockPage = () => {
        document.documentElement.classList.remove("loader-active");
        document.body.classList.remove("loader-active");
    };

    let loaderSeenThisSession = false;

    try {
        loaderSeenThisSession =
            window.sessionStorage.getItem(loaderSessionKey) === "true";
    } catch (error) {
        // The loader can still run when session storage is unavailable.
    }

    const shouldSkipLoader =
        !loaderEnabled ||
        loaderSeenThisSession ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (loaderEnabled && !loaderSeenThisSession) {
        try {
            window.sessionStorage.setItem(loaderSessionKey, "true");
        } catch (error) {
            // Navigation remains functional when storage is unavailable.
        }
    }

    const closeLoader = () => {
        if (!pageLoader || loaderClosed) return;

        loaderClosed = true;

        if (loaderSafetyTimer) {
            window.clearTimeout(loaderSafetyTimer);
            loaderSafetyTimer = 0;
        }

        pageLoader.classList.add("hide");

        window.setTimeout(() => {
            unlockPage();
            pageLoader.remove();
            document.dispatchEvent(new CustomEvent(loaderClosedEventName));
        }, loaderFadeMilliseconds);
    };

    const scheduleLoaderSafetyClose = (delay) => {
        if (loaderSafetyTimer) {
            window.clearTimeout(loaderSafetyTimer);
        }

        loaderSafetyTimer = window.setTimeout(closeLoader, delay);
    };

    if (pageLoader && shouldSkipLoader) {
        loaderClosed = true;
        pageLoader.remove();
        unlockPage();

        window.setTimeout(() => {
            document.dispatchEvent(new CustomEvent(loaderClosedEventName));
        }, 0);
    }

    if (loaderVideo && !loaderClosed) {
        const isPhoneViewport = window.matchMedia("(max-width: 767px)").matches;

        document.documentElement.dataset.loaderVariant = isPhoneViewport
            ? "mobile"
            : "desktop";

        // This only protects against a video that never starts loading. Once it is
        // playing, the loader stays visible until the full video has ended.
        scheduleLoaderSafetyClose(loaderMaxDisplayMilliseconds);

        const clearLoaderSafetyTimer = () => {
            if (loaderSafetyTimer) {
                window.clearTimeout(loaderSafetyTimer);
                loaderSafetyTimer = 0;
            }
        };

        let loaderStallTimer = 0;
        const clearLoaderStallTimer = () => {
            if (loaderStallTimer) {
                window.clearTimeout(loaderStallTimer);
                loaderStallTimer = 0;
            }
        };
        const scheduleLoaderStallClose = () => {
            clearLoaderStallTimer();
            loaderStallTimer = window.setTimeout(closeLoader, 4000);
        };

        const revealLoaderVideo = () => {
            pageLoader.classList.add("is-video-ready");
            // Keep the maximum-display timer running. A video can begin playing
            // and then stall on a slow connection (for example through a tunnel),
            // which previously left the whole page behind the loader forever.
        };

        loaderVideo.addEventListener("canplay", revealLoaderVideo, {
            once: true
        });
        loaderVideo.addEventListener("playing", () => {
            revealLoaderVideo();
            clearLoaderStallTimer();
        });
        loaderVideo.addEventListener("timeupdate", clearLoaderStallTimer);
        loaderVideo.addEventListener("waiting", scheduleLoaderStallClose);
        loaderVideo.addEventListener("ended", closeLoader);

        // The browser may have started loading before this script reaches the
        // bottom of the page, so account for events that have already fired.
        if (loaderVideo.readyState >= 3 || !loaderVideo.paused) {
            revealLoaderVideo();
        }

        loaderVideo.addEventListener("error", () => {
            clearLoaderStallTimer();
            window.setTimeout(closeLoader, 500);
        });

        const playPromise = loaderVideo.play();

        if (
            playPromise &&
            typeof playPromise.catch === "function"
        ) {
            playPromise.catch(() => {
                window.setTimeout(closeLoader, 2500);
            });
        }
    }

    skipLoader?.addEventListener("click", closeLoader);

    if (pageLoader && !loaderClosed && !loaderVideo) {
        scheduleLoaderSafetyClose(1500);
    } else if (!pageLoader || loaderClosed) {
        unlockPage();
    }


    

    const header = document.getElementById("siteHeader");
    const menuButton = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");

    const updateHeader = () => {
        header?.classList.toggle(
            "scrolled",
            window.scrollY > 50
        );
    };

    const closeMobileMenu = () => {
        if (!menuButton || !navMenu) return;

        menuButton.classList.remove("open");
        navMenu.classList.remove("open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Open navigation"
        );

        document.body.classList.remove("menu-open");
    };

    menuButton?.addEventListener("click", () => {
        if (!navMenu) return;

        const isOpen =
            navMenu.classList.toggle("open");

        menuButton.classList.toggle(
            "open",
            isOpen
        );

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation"
                : "Open navigation"
        );

        document.body.classList.toggle(
            "menu-open",
            isOpen
        );

        if (isOpen) {
            window.setTimeout(() => {
                navMenu.querySelector("a")?.focus();
            }, 80);
        }
    });

    navMenu?.querySelectorAll("a").forEach((link) => {
        link.addEventListener(
            "click",
            closeMobileMenu
        );
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            navMenu?.classList.contains("open")
        ) {
            closeMobileMenu();
            menuButton?.focus();
        }
    });

    document.addEventListener("pointerdown", (event) => {
        if (
            navMenu?.classList.contains("open") &&
            !navMenu.contains(event.target) &&
            !menuButton?.contains(event.target)
        ) {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMobileMenu();
        }
    });

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

    updateHeader();


    

    const primaryNavigationLinks = navMenu
        ? Array.from(navMenu.querySelectorAll("a"))
        : [];

    const currentNavigationLink =
        primaryNavigationLinks.find(
            (link) =>
                link.classList.contains("active") ||
                link.getAttribute("aria-current") === "page"
        ) || primaryNavigationLinks[0];

    if (navMenu && currentNavigationLink) {
        const navigationIndicator = document.createElement("span");
        navigationIndicator.className = "nav-liquid-indicator no-transition";
        navigationIndicator.setAttribute("aria-hidden", "true");
        navMenu.prepend(navigationIndicator);

        const positionNavigationIndicator = (
            link = currentNavigationLink,
            moveImmediately = false
        ) => {
            if (window.innerWidth <= 900 || !link) {
                navigationIndicator.style.opacity = "0";
                return;
            }

            navigationIndicator.classList.toggle(
                "no-transition",
                moveImmediately
            );
            navigationIndicator.style.width = `${link.offsetWidth}px`;
            navigationIndicator.style.height = `${link.offsetHeight}px`;
            navigationIndicator.style.transform =
                `translate3d(${link.offsetLeft}px, ${link.offsetTop}px, 0)`;
            navigationIndicator.style.opacity = "1";
        };

        window.requestAnimationFrame(() => {
            positionNavigationIndicator(currentNavigationLink, true);
            navMenu.classList.add("is-liquid-ready");

            window.requestAnimationFrame(() => {
                navigationIndicator.classList.remove("no-transition");
            });
        });

        primaryNavigationLinks.forEach((link, index) => {
            link.addEventListener("pointerenter", () => {
                positionNavigationIndicator(link);
            });

            link.addEventListener("focus", () => {
                positionNavigationIndicator(link);
            });

            link.addEventListener("click", (event) => {
                if (link === currentNavigationLink) {
                    event.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)"
                        ).matches
                            ? "auto"
                            : "smooth"
                    });
                    return;
                }

                positionNavigationIndicator(link);
                navigateWithPageTransition(event, link, {
                    previousIndex: primaryNavigationLinks.indexOf(
                        currentNavigationLink
                    )
                });
            });

            link.style.setProperty("--nav-item-index", String(index));
        });

        navMenu.addEventListener("pointerleave", () => {
            positionNavigationIndicator(currentNavigationLink);
        });

        navMenu.addEventListener("focusout", (event) => {
            if (!navMenu.contains(event.relatedTarget)) {
                positionNavigationIndicator(currentNavigationLink);
            }
        });

        let navigationResizeFrame = null;

        window.addEventListener("resize", () => {
            if (navigationResizeFrame) {
                window.cancelAnimationFrame(navigationResizeFrame);
            }

            navigationResizeFrame = window.requestAnimationFrame(() => {
                positionNavigationIndicator(currentNavigationLink, true);
                navigationResizeFrame = null;
            });
        });
    }


    

    const revealItems =
        document.querySelectorAll(
            ".reveal-up, .reveal-left, .reveal-right, .reveal-item"
        );

    const prefersReducedMotion = window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

    document.querySelectorAll(
        ".specials-grid, .about-statistics-grid, .about-purpose-grid, " +
        ".about-values-grid, .outlet-media-grid, .contact-info-list, " +
        ".outlet-location-grid, .contact-regions-grid, .menu-products-grid, " +
        ".quality-list, .reviews-track"
    ).forEach((group) => {
        Array.from(group.children).forEach((item, index) => {
            item.style.setProperty(
                "--reveal-delay",
                `${Math.min(index % 4, 3) * 85}ms`
            );
        });
    });

    if (prefersReducedMotion) {

        revealItems.forEach((item) => {
            item.classList.add("visible", "is-visible");
        });

    } else if ("IntersectionObserver" in window) {

        const revealObserver =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        entry.target.classList.add(
                            "visible",
                            "is-visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    });

                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -35px 0px"
                }
            );

        revealItems.forEach((item) => {
            revealObserver.observe(item);
        });

    } else {

        revealItems.forEach((item) => {
            item.classList.add(
                "visible",
                "is-visible"
            );
        });

    }


    

    const scrollProgress = document.createElement("div");
    scrollProgress.className = "scroll-progress";
    scrollProgress.setAttribute("aria-hidden", "true");
    document.body.appendChild(scrollProgress);

    let progressFrame = null;

    const updateScrollProgress = () => {
        const scrollable =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress = scrollable > 0
            ? Math.min(window.scrollY / scrollable, 1)
            : 0;

        scrollProgress.style.transform =
            `scaleX(${progress})`;

        progressFrame = null;
    };

    window.addEventListener("scroll", () => {
        if (progressFrame === null) {
            progressFrame = window.requestAnimationFrame(
                updateScrollProgress
            );
        }
    }, { passive: true });

    updateScrollProgress();


    

    const backToTop =
        document.getElementById("backToTop");

    const updateBackToTop = () => {

        backToTop?.classList.toggle(
            "show",
            window.scrollY > 500
        );

    };

    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive: true }
    );

    updateBackToTop();

    backToTop?.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );


    

    const currentYear =
        document.getElementById("currentYear");

    if (currentYear) {

        currentYear.textContent =
            String(
                new Date().getFullYear()
            );

    }


    

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );

    // Menu cards are generated by menu.html. Query them when filtering rather
    // than capturing an empty list if this file executes before card creation.
    const getMenuCards = () => document.querySelectorAll(".menu-card");

    const menuSearch =
        document.getElementById("menuSearch");

    const menuResultsCount =
        document.getElementById("menuResultsCount");

    const menuEmptyState =
        document.getElementById("menuEmptyState");

    let selectedCategory = "all";

    try {
        const requestedCategory = new URLSearchParams(
            window.location.search
        ).get("category");

        if (
            requestedCategory &&
            Array.from(filterButtons).some(
                (button) =>
                    button.dataset.filter === requestedCategory
            )
        ) {
            selectedCategory = requestedCategory;
        }
    } catch (error) {
        selectedCategory = "all";
    }

    const showImageFallback = (image) => {
        const imageFrame = image.closest(".menu-card-image");

        if (!imageFrame || imageFrame.classList.contains("image-unavailable")) {
            return;
        }

        image.hidden = true;
        imageFrame.classList.add("image-unavailable");

        const fallback = document.createElement("div");
        fallback.className = "menu-image-fallback";

        const logo = document.createElement("img");
        logo.src = "asset/image/logo2.png";
        logo.alt = "";
        logo.setAttribute("aria-hidden", "true");

        const label = document.createElement("span");
        label.textContent = image.alt || "Freshly prepared";

        fallback.append(logo, label);
        imageFrame.appendChild(fallback);
    };

    document.querySelectorAll(".menu-card-image > img").forEach((image) => {
        image.addEventListener("error", () => showImageFallback(image));

        if (image.complete && image.naturalWidth === 0) {
            showImageFallback(image);
        }
    });

    const updateMenu = (animateCards = false) => {
        const query = (menuSearch?.value || "")
            .trim()
            .toLowerCase();

        let visibleCount = 0;

        getMenuCards().forEach((card) => {
            const matchesCategory =
                selectedCategory === "all" ||
                card.dataset.category === selectedCategory;

            const matchesSearch =
                !query ||
                card.textContent.toLowerCase().includes(query);

            const shouldShow = matchesCategory && matchesSearch;

            card.classList.toggle("hide", !shouldShow);
            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount += 1;
            }

            if (
                shouldShow &&
                animateCards &&
                !prefersReducedMotion &&
                typeof card.animate === "function"
            ) {
                card.animate(
                    [
                        {
                            opacity: 0,
                            transform: "translateY(18px) scale(0.985)"
                        },
                        {
                            opacity: 1,
                            transform: "translateY(0) scale(1)"
                        }
                    ],
                    {
                        duration: 360,
                        easing: "cubic-bezier(.2,.75,.3,1)"
                    }
                );
            }
        });

        if (menuResultsCount) {
            menuResultsCount.textContent =
                `${visibleCount} ${visibleCount === 1 ? "item" : "items"}`;
        }

        if (menuEmptyState) {
            menuEmptyState.hidden = visibleCount !== 0;
        }
    };

    filterButtons.forEach((button) => {

        const isInitial =
            button.dataset.filter === selectedCategory;

        button.classList.toggle("active", isInitial);
        button.setAttribute("aria-pressed", String(isInitial));

        button.addEventListener(
            "click",
            () => {

                selectedCategory =
                    button.dataset.filter ||
                    "all";

                filterButtons.forEach(
                    (filterButton) => {

                        filterButton.classList.toggle(
                            "active",
                            filterButton === button
                        );

                        filterButton.setAttribute(
                            "aria-pressed",
                            String(filterButton === button)
                        );

                    }
                );

                try {
                    const url = new URL(window.location.href);

                    if (selectedCategory === "all") {
                        url.searchParams.delete("category");
                    } else {
                        url.searchParams.set("category", selectedCategory);
                    }

                    history.replaceState({}, "", url);
                } catch (error) {
                    // Filtering still works when URL updates are unavailable.
                }

                updateMenu(true);

            }
        );

    });

    menuSearch?.addEventListener("input", () => {
        updateMenu(true);
    });

    updateMenu();
    // Re-run once every page asset has loaded. This covers menu cards that
    // are created by an inline script later in the document.
    window.addEventListener("load", () => updateMenu());


    

    const reviewsSlider = document.getElementById("reviewsSlider");
    const reviewsTrack = document.getElementById("reviewsTrack");
    const reviewPrevious = document.getElementById("reviewPrevious");
    const reviewNext = document.getElementById("reviewNext");
    const reviewDots = document.getElementById("reviewDots");
    const reviewCards = reviewsTrack
        ? Array.from(reviewsTrack.querySelectorAll(".review-card"))
        : [];

    if (reviewsSlider && reviewsTrack && reviewCards.length > 0) {
        const reviewReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );
        let activeReviewPage = 0;
        let reviewAutoplayTimer = null;
        let reviewPointerStart = null;
        let reviewsInViewport = !("IntersectionObserver" in window);

        const reviewsPerView = () =>
            window.matchMedia("(max-width: 768px)").matches ? 1 : 2;

        const getReviewPageStarts = () => {
            const perView = reviewsPerView();
            const lastStart = Math.max(0, reviewCards.length - perView);
            const starts = [];

            for (let index = 0; index <= lastStart; index += perView) {
                starts.push(Math.min(index, lastStart));
            }

            if (starts[starts.length - 1] !== lastStart) {
                starts.push(lastStart);
            }

            return [...new Set(starts)];
        };

        const stopReviewAutoplay = () => {
            if (reviewAutoplayTimer) {
                window.clearInterval(reviewAutoplayTimer);
                reviewAutoplayTimer = null;
            }
        };

        const showReviewPage = (pageIndex) => {
            const pageStarts = getReviewPageStarts();
            activeReviewPage =
                (pageIndex + pageStarts.length) % pageStarts.length;

            const firstVisibleCard = pageStarts[activeReviewPage];
            const cardWidth = reviewCards[0].getBoundingClientRect().width;
            const trackStyles = window.getComputedStyle(reviewsTrack);
            const cardGap = Number.parseFloat(trackStyles.gap) || 0;

            reviewsTrack.style.transform =
                `translate3d(-${firstVisibleCard * (cardWidth + cardGap)}px, 0, 0)`;

            const lastVisibleCard =
                firstVisibleCard + reviewsPerView() - 1;

            reviewCards.forEach((card, index) => {
                card.setAttribute(
                    "aria-hidden",
                    String(index < firstVisibleCard || index > lastVisibleCard)
                );
            });

            reviewDots?.querySelectorAll(".review-dot").forEach((dot, index) => {
                const isActive = index === activeReviewPage;
                dot.classList.toggle("active", isActive);
                dot.setAttribute("aria-current", isActive ? "true" : "false");
            });
        };

        const startReviewAutoplay = () => {
            stopReviewAutoplay();

            if (
                reviewReducedMotion.matches ||
                document.hidden ||
                !reviewsInViewport ||
                (pageLoader && !loaderClosed) ||
                getReviewPageStarts().length < 2
            ) {
                return;
            }

            reviewAutoplayTimer = window.setInterval(() => {
                showReviewPage(activeReviewPage + 1);
            }, 5000);
        };

        const selectReviewPage = (pageIndex) => {
            showReviewPage(pageIndex);
            startReviewAutoplay();
        };

        const buildReviewDots = () => {
            if (!reviewDots) return;

            reviewDots.replaceChildren();

            getReviewPageStarts().forEach((_, index) => {
                const dot = document.createElement("button");
                dot.type = "button";
                dot.className = "review-dot";
                dot.setAttribute("aria-label", `Show review page ${index + 1}`);
                dot.addEventListener("click", () => selectReviewPage(index));
                reviewDots.appendChild(dot);
            });
        };

        reviewCards.forEach((card, index) => {
            card.setAttribute("aria-label", `Customer review ${index + 1} of ${reviewCards.length}`);
        });

        reviewPrevious?.addEventListener("click", () => {
            selectReviewPage(activeReviewPage - 1);
        });

        reviewNext?.addEventListener("click", () => {
            selectReviewPage(activeReviewPage + 1);
        });

        reviewsSlider.addEventListener("pointerdown", (event) => {
            if (event.isPrimary) {
                reviewPointerStart = event.clientX;
            }
        });

        reviewsSlider.addEventListener("pointerup", (event) => {
            if (reviewPointerStart === null || !event.isPrimary) return;

            const pointerDistance = event.clientX - reviewPointerStart;
            reviewPointerStart = null;

            if (Math.abs(pointerDistance) >= 45) {
                selectReviewPage(
                    activeReviewPage + (pointerDistance < 0 ? 1 : -1)
                );
            }
        });

        reviewsSlider.addEventListener("pointercancel", () => {
            reviewPointerStart = null;
        });

        reviewsSlider.addEventListener("mouseenter", stopReviewAutoplay);
        reviewsSlider.addEventListener("mouseleave", startReviewAutoplay);
        reviewsSlider.addEventListener("focusin", stopReviewAutoplay);
        reviewsSlider.addEventListener("focusout", (event) => {
            if (!reviewsSlider.contains(event.relatedTarget)) {
                startReviewAutoplay();
            }
        });

        window.addEventListener("resize", () => {
            buildReviewDots();
            showReviewPage(0);
            startReviewAutoplay();
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopReviewAutoplay();
            } else {
                startReviewAutoplay();
            }
        });

        if ("IntersectionObserver" in window) {
            const reviewViewportObserver = new IntersectionObserver(
                ([entry]) => {
                    reviewsInViewport = entry.isIntersecting;

                    if (reviewsInViewport) {
                        startReviewAutoplay();
                    } else {
                        stopReviewAutoplay();
                    }
                },
                {
                    threshold: 0.01,
                    rootMargin: "140px 0px"
                }
            );

            reviewViewportObserver.observe(reviewsSlider);
        }

        buildReviewDots();
        showReviewPage(0);

        if (pageLoader && !loaderClosed) {
            document.addEventListener(
                loaderClosedEventName,
                startReviewAutoplay,
                { once: true }
            );
        } else {
            startReviewAutoplay();
        }
    }


    

    const faqQuestions = Array.from(
        document.querySelectorAll(".faq-question")
    );

    const setFaqState = (question, isOpen) => {
        const item = question.closest(".faq-item");
        const answerId = question.getAttribute("aria-controls");
        const answer = answerId
            ? document.getElementById(answerId)
            : null;

        item?.classList.toggle("is-open", isOpen);
        question.setAttribute("aria-expanded", String(isOpen));
        answer?.setAttribute("aria-hidden", String(!isOpen));
    };

    faqQuestions.forEach((question) => {
        question.addEventListener("click", () => {
            const shouldOpen =
                question.getAttribute("aria-expanded") !== "true";

            faqQuestions.forEach((otherQuestion) => {
                setFaqState(
                    otherQuestion,
                    shouldOpen && otherQuestion === question
                );
            });
        });
    });


    

    const heroVideo =
        document.getElementById(
            "heroPromoVideo"
        );

    const soundButton =
        document.getElementById(
            "heroSoundToggle"
        );

    const heroVideoFrame =
        document.getElementById(
            "heroVideoFrame"
        );

    const heroPriceTag =
        document.querySelector(
            "#heroVideoShell > .hero-price-badge"
        );

    const mobileSoundButton =
        soundButton
            ? soundButton.cloneNode(true)
            : null;

    if (mobileSoundButton) {

        mobileSoundButton.removeAttribute("id");
        mobileSoundButton.classList.add(
            "hero-sound-toggle--mobile"
        );
        mobileSoundButton.setAttribute(
            "aria-hidden",
            "true"
        );
        mobileSoundButton.tabIndex = -1;
        document.body.appendChild(
            mobileSoundButton
        );

    }

    const mobilePriceTag =
        heroPriceTag
            ? heroPriceTag.cloneNode(true)
            : null;

    if (mobilePriceTag) {

        mobilePriceTag.classList.add(
            "hero-price-badge--mobile"
        );
        mobilePriceTag.setAttribute(
            "aria-hidden",
            "true"
        );
        document.body.appendChild(
            mobilePriceTag
        );

    }

    const soundButtons =
        [soundButton, mobileSoundButton]
            .filter(Boolean);

    const mobileSoundMedia =
        window.matchMedia(
            "(max-width: 768px)"
        );

    let mobileSoundVideoInView = false;

    const updateMobileSoundButtonVisibility = () => {

        if (
            !mobileSoundButton &&
            !mobilePriceTag
        ) return;

        const videoSlide =
            heroVideo?.closest(
                ".hero-slide"
            );

        const videoSlideIsActive =
            !videoSlide ||
            videoSlide.classList.contains(
                "is-active"
            );

        const shouldShow =
            mobileSoundMedia.matches &&
            mobileSoundVideoInView &&
            videoSlideIsActive;

        if (mobileSoundButton) {

            mobileSoundButton.classList.toggle(
                "is-visible",
                shouldShow
            );
            mobileSoundButton.setAttribute(
                "aria-hidden",
                String(!shouldShow)
            );
            mobileSoundButton.tabIndex =
                shouldShow ? 0 : -1;

        }

        if (mobilePriceTag) {

            mobilePriceTag.classList.toggle(
                "is-visible",
                shouldShow
            );
            mobilePriceTag.setAttribute(
                "aria-hidden",
                String(!shouldShow)
            );

        }

    };


    const updateSoundButton = () => {

        if (
            !heroVideo ||
            soundButtons.length === 0
        ) {
            return;
        }

        const soundIsOn =
            !heroVideo.muted;

        soundButtons.forEach((button) => {

            button.textContent =
                soundIsOn
                    ? "Sound On"
                    : "Sound Off";

            button.setAttribute(
                "aria-pressed",
                String(soundIsOn)
            );

            button.setAttribute(
                "aria-label",
                soundIsOn
                    ? "Turn video sound off"
                    : "Turn video sound on"
            );

        });

    };


    const toggleHeroSound =
        async () => {

            if (!heroVideo) return;

            heroVideo.muted =
                !heroVideo.muted;

            try {

                await heroVideo.play();

            } catch (error) {

                heroVideo.muted = true;

            }

            updateSoundButton();

        };

    soundButtons.forEach((button) => {
        button.addEventListener(
            "click",
            toggleHeroSound
        );
    });


    if (
        (mobileSoundButton || mobilePriceTag) &&
        heroVideoFrame
    ) {

        if (
            "IntersectionObserver" in window
        ) {

            const mobileSoundObserver =
                new IntersectionObserver(
                    ([entry]) => {

                        mobileSoundVideoInView =
                            entry.isIntersecting;
                        updateMobileSoundButtonVisibility();

                    },
                    {
                        threshold: 0,
                        rootMargin:
                            "0px 0px -90px 0px"
                    }
                );

            mobileSoundObserver.observe(
                heroVideoFrame
            );

        } else {

            mobileSoundVideoInView = true;
            updateMobileSoundButtonVisibility();

        }

        if (
            typeof mobileSoundMedia.addEventListener === "function"
        ) {
            mobileSoundMedia.addEventListener(
                "change",
                updateMobileSoundButtonVisibility
            );
        } else {
            mobileSoundMedia.addListener(
                updateMobileSoundButtonVisibility
            );
        }

    }


    if (heroVideo) {

        heroVideo.addEventListener(
            "error",
            () => {

                soundButtons.forEach((button) => {

                    button.setAttribute(
                        "disabled",
                        ""
                    );
                    button.textContent =
                        "Video unavailable";

                });

            }
        );

        updateSoundButton();


        if (
            "IntersectionObserver" in window
        ) {

            const videoObserver =
                new IntersectionObserver(
                    (entries) => {

                        entries.forEach(
                            (entry) => {

                                if (
                                    entry.isIntersecting &&
                                    (
                                        !heroVideo.closest(".hero-slide") ||
                                        heroVideo.closest(".hero-slide").classList.contains("is-active")
                                    )
                                ) {

                                    heroVideo
                                        .play()
                                        .catch(
                                            () => {}
                                        );

                                } else {

                                    heroVideo.pause();

                                }

                            }
                        );

                    },
                    {
                        threshold: 0.12
                    }
                );

            videoObserver.observe(
                heroVideo
            );

        }

    }


    

    const heroCarousel = document.getElementById("heroCarousel");
    const seasonalSettings = window.CHICK_BUCK_SEASONAL || {};
    const seasonalSlide = heroCarousel?.querySelector("[data-seasonal-slide]");
    const seasonalSlideControl = heroCarousel?.querySelector(
        "[data-seasonal-slide-control]"
    );
    const seasonalContent =
        seasonalSettings.content && typeof seasonalSettings.content === "object"
            ? seasonalSettings.content
            : {};

    const setSeasonalText = (selector, value) => {
        if (!seasonalSlide || typeof value !== "string") return;

        const element = seasonalSlide.querySelector(selector);
        if (!element) return;

        element.textContent = value;
        element.hidden = value.trim() === "";
    };

    const setSeasonalLink = (selector, linkSettings) => {
        if (
            !seasonalSlide ||
            !linkSettings ||
            typeof linkSettings !== "object"
        ) {
            return;
        }

        const link = seasonalSlide.querySelector(selector);
        if (!link) return;

        if (typeof linkSettings.label === "string") {
            link.textContent = linkSettings.label;
            link.hidden = linkSettings.label.trim() === "";
        }

        if (
            typeof linkSettings.href === "string" &&
            linkSettings.href.trim() !== ""
        ) {
            link.setAttribute("href", linkSettings.href.trim());
        }
    };

    if (seasonalSlide) {
        const appearance = seasonalSettings.appearance && typeof seasonalSettings.appearance === "object"
            ? seasonalSettings.appearance
            : {};
        if (/^#[0-9a-f]{6}$/i.test(appearance.backgroundStart || "") && /^#[0-9a-f]{6}$/i.test(appearance.backgroundEnd || "")) {
            seasonalSlide.style.setProperty("--admin-season-start", appearance.backgroundStart);
            seasonalSlide.style.setProperty("--admin-season-end", appearance.backgroundEnd);
        }
        if (/^#[0-9a-f]{6}$/i.test(appearance.titleColor || "")) seasonalSlide.style.setProperty("--admin-season-title", appearance.titleColor);
        if (Number.isInteger(appearance.titleWeight) && appearance.titleWeight >= 400 && appearance.titleWeight <= 900) seasonalSlide.style.setProperty("--admin-season-weight", appearance.titleWeight);
        if (
            typeof seasonalContent.slideName === "string" &&
            seasonalContent.slideName.trim() !== ""
        ) {
            const slideName = seasonalContent.slideName.trim();
            seasonalSlide.dataset.slideName = slideName;
            seasonalSlideControl?.setAttribute(
                "aria-label",
                `Show ${slideName} slide`
            );
        }

        setSeasonalText("[data-seasonal-eyebrow]", seasonalContent.eyebrow);
        setSeasonalText("[data-seasonal-label]", seasonalContent.label);
        setSeasonalText(
            "[data-seasonal-title-small]",
            seasonalContent.titleSmall
        );
        setSeasonalText(
            "[data-seasonal-title-main]",
            seasonalContent.titleMain
        );
        setSeasonalText(
            "[data-seasonal-title-local]",
            seasonalContent.titleLocal
        );
        setSeasonalText(
            "[data-seasonal-description]",
            seasonalContent.description
        );
        setSeasonalText(
            "[data-seasonal-footer-label]",
            seasonalContent.footerLabel
        );
        setSeasonalText(
            "[data-seasonal-footer-value]",
            seasonalContent.footerValue
        );
        setSeasonalText(
            "[data-seasonal-image-caption]",
            seasonalContent.imageCaption
        );

        setSeasonalLink(
            "[data-seasonal-primary]",
            seasonalContent.primaryButton
        );
        setSeasonalLink(
            "[data-seasonal-secondary]",
            seasonalContent.secondaryButton
        );

        const localTitle = seasonalSlide.querySelector(
            "[data-seasonal-title-local]"
        );
        if (localTitle) {
            if (
                typeof seasonalContent.localLanguage === "string" &&
                seasonalContent.localLanguage.trim() !== ""
            ) {
                localTitle.setAttribute(
                    "lang",
                    seasonalContent.localLanguage.trim()
                );
            }

            if (
                ["ltr", "rtl", "auto"].includes(
                    seasonalContent.localDirection
                )
            ) {
                localTitle.setAttribute(
                    "dir",
                    seasonalContent.localDirection
                );
            }
        }

        const seasonalImage = seasonalSlide.querySelector(
            "[data-seasonal-image]"
        );
        if (seasonalImage) {
            if (
                typeof seasonalContent.image === "string" &&
                seasonalContent.image.trim() !== ""
            ) {
                seasonalImage.setAttribute("src", seasonalContent.image.trim());
            }

            if (typeof seasonalContent.imageAlt === "string") {
                seasonalImage.setAttribute("alt", seasonalContent.imageAlt);
            }
        }
    }

    const parseSeasonDate = (value, useEndOfDay = false) => {
        if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return null;
        }

        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(
            year,
            month - 1,
            day,
            useEndOfDay ? 23 : 0,
            useEndOfDay ? 59 : 0,
            useEndOfDay ? 59 : 0,
            useEndOfDay ? 999 : 0
        );

        return Number.isNaN(date.getTime()) ? null : date;
    };

    const seasonStartDate = parseSeasonDate(seasonalSettings.startDate);
    const seasonEndDate = parseSeasonDate(seasonalSettings.endDate, true);
    const seasonNow = new Date();
    const seasonalSlideIsActive =
        seasonalSettings.enabled === true &&
        (!seasonStartDate || seasonNow >= seasonStartDate) &&
        (!seasonEndDate || seasonNow <= seasonEndDate);

    if (heroCarousel) {
        heroCarousel.dataset.seasonalActive = String(seasonalSlideIsActive);
    }

    if (seasonalSlide && !seasonalSlideIsActive) {
        seasonalSlide.remove();
        seasonalSlideControl?.remove();
    }

    const heroSlides = heroCarousel
        ? Array.from(heroCarousel.querySelectorAll(".hero-slide"))
        : [];
    const heroDots = heroCarousel
        ? Array.from(heroCarousel.querySelectorAll("[data-hero-slide]"))
        : [];
    const heroPreviousButton = document.getElementById("heroSlidePrev");
    const heroNextButton = document.getElementById("heroSlideNext");
    const heroAutoplayButton = document.getElementById("heroSlideAutoplay");
    const heroSlideStatus = document.getElementById("heroSlideStatus");
    const heroCarouselControls = heroCarousel?.querySelector(
        ".hero-carousel-controls"
    );

    if (heroSlides.length < 2) {
        if (heroCarouselControls) {
            heroCarouselControls.hidden = true;
        }

        if (heroSlides[0]) {
            heroSlides[0].setAttribute("aria-label", "1 of 1");
        }

        if (heroDots[0]) {
            heroDots[0].dataset.heroSlide = "0";
        }

        if (heroSlideStatus && heroSlides[0]) {
            const onlySlideName =
                heroSlides[0].dataset.slideName || "Featured promotion";
            heroSlideStatus.textContent = `${onlySlideName}, slide 1 of 1`;
        }
    }

    if (heroCarousel && heroSlides.length > 0) {
        const heroCarouselSettings =
            seasonalSettings.heroCarousel &&
            typeof seasonalSettings.heroCarousel === "object"
                ? seasonalSettings.heroCarousel
                : {};
        const heroAutoAdvanceEnabled =
            typeof heroCarouselSettings.enabled === "boolean"
                ? heroCarouselSettings.enabled
                : true;
        const configuredHeroIntervalSeconds = Number(
            heroCarouselSettings.intervalSeconds
        );
        const heroAutoplayInterval =
            Number.isFinite(configuredHeroIntervalSeconds) &&
            configuredHeroIntervalSeconds >= 3 &&
            configuredHeroIntervalSeconds <= 120
                ? configuredHeroIntervalSeconds * 1000
                : 10500;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const preferredInitialHeroSlide =
            seasonalSlideIsActive && heroSlides.includes(seasonalSlide)
                ? seasonalSlide
                : heroSlides.find((slide) => slide.classList.contains("is-active"));
        let activeHeroSlide = Math.max(
            0,
            heroSlides.indexOf(preferredInitialHeroSlide)
        );
        let heroAutoplayTimer = null;
        let autoplayPausedByUser = false;
        let pointerInsideCarousel = false;
        let focusInsideCarousel = false;
        let heroCarouselInViewport = !("IntersectionObserver" in window);

        const updateAutoplayButton = () => {
            if (!heroAutoplayButton) return;

            heroAutoplayButton.setAttribute(
                "aria-pressed",
                String(autoplayPausedByUser)
            );
            heroAutoplayButton.setAttribute(
                "aria-label",
                autoplayPausedByUser
                    ? "Resume automatic slide rotation"
                    : "Pause automatic slide rotation"
            );

            const icon = heroAutoplayButton.querySelector("span");
            if (icon) icon.textContent = autoplayPausedByUser ? "▶" : "Ⅱ";
        };

        const syncHeroVideo = () => {
            if (!heroVideo) return;

            const activeSlide = heroSlides[activeHeroSlide];
            const videoIsActive = activeSlide?.contains(heroVideo);

            if (videoIsActive && !document.hidden && heroCarouselInViewport) {
                heroVideo.play().catch(() => {});
            } else {
                heroVideo.pause();
            }
        };

        const showHeroSlide = (requestedIndex, announce = true) => {
            activeHeroSlide =
                (requestedIndex + heroSlides.length) % heroSlides.length;

            heroSlides.forEach((slide, index) => {
                const isActive = index === activeHeroSlide;
                slide.classList.toggle("is-active", isActive);
                slide.setAttribute("aria-hidden", String(!isActive));
                slide.toggleAttribute("inert", !isActive);
            });

            heroDots.forEach((dot) => {
                const dotSlideIndex = Number(dot.dataset.heroSlide);
                const isActive = dotSlideIndex === activeHeroSlide;
                dot.classList.toggle("is-active", isActive);
                dot.setAttribute("aria-current", String(isActive));
            });

            if (announce && heroSlideStatus) {
                const slideName =
                    heroSlides[activeHeroSlide].dataset.slideName ||
                    `Slide ${activeHeroSlide + 1}`;
                const slidePosition =
                    heroDots.findIndex(
                        (dot) => Number(dot.dataset.heroSlide) === activeHeroSlide
                    ) + 1;
                heroSlideStatus.textContent =
                    `${slideName}, slide ${slidePosition} of ${heroSlides.length}`;
            }

            syncHeroVideo();
            updateMobileSoundButtonVisibility();
        };

        const stopHeroAutoplay = () => {
            if (heroAutoplayTimer) {
                window.clearInterval(heroAutoplayTimer);
                heroAutoplayTimer = null;
            }
        };

        const startHeroAutoplay = () => {
            stopHeroAutoplay();

            if (
                !heroAutoAdvanceEnabled ||
                autoplayPausedByUser ||
                reducedMotion.matches ||
                pointerInsideCarousel ||
                focusInsideCarousel ||
                document.hidden ||
                !heroCarouselInViewport ||
                (pageLoader && !loaderClosed) ||
                heroSlides.length < 2
            ) {
                return;
            }

            heroAutoplayTimer = window.setInterval(() => {
                showHeroSlide(activeHeroSlide + 1, false);
            }, heroAutoplayInterval);
        };

        const selectHeroSlide = (index) => {
            showHeroSlide(index);
            startHeroAutoplay();
        };

        heroPreviousButton?.addEventListener("click", () => {
            selectHeroSlide(activeHeroSlide - 1);
        });

        heroNextButton?.addEventListener("click", () => {
            selectHeroSlide(activeHeroSlide + 1);
        });

        heroDots.forEach((dot) => {
            dot.addEventListener("click", () => {
                selectHeroSlide(Number(dot.dataset.heroSlide));
            });
        });

        heroAutoplayButton?.addEventListener("click", () => {
            autoplayPausedByUser = !autoplayPausedByUser;
            updateAutoplayButton();
            startHeroAutoplay();
        });

        heroCarousel.addEventListener("pointerenter", () => {
            pointerInsideCarousel = true;
            stopHeroAutoplay();
        });

        heroCarousel.addEventListener("pointerleave", () => {
            pointerInsideCarousel = false;
            startHeroAutoplay();
        });

        heroCarousel.addEventListener("focusin", () => {
            focusInsideCarousel = true;
            stopHeroAutoplay();
        });

        heroCarousel.addEventListener("focusout", (event) => {
            if (!heroCarousel.contains(event.relatedTarget)) {
                focusInsideCarousel = false;
                startHeroAutoplay();
            }
        });

        heroCarousel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                selectHeroSlide(activeHeroSlide - 1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                selectHeroSlide(activeHeroSlide + 1);
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopHeroAutoplay();
            } else {
                syncHeroVideo();
                startHeroAutoplay();
            }
        });

        if ("IntersectionObserver" in window) {
            const heroViewportObserver = new IntersectionObserver(
                ([entry]) => {
                    heroCarouselInViewport = entry.isIntersecting;
                    syncHeroVideo();

                    if (heroCarouselInViewport) {
                        startHeroAutoplay();
                    } else {
                        stopHeroAutoplay();
                    }
                },
                {
                    threshold: 0.01,
                    rootMargin: "120px 0px"
                }
            );

            heroViewportObserver.observe(heroCarousel);
        }

        if (reducedMotion.matches && heroAutoplayButton) {
            autoplayPausedByUser = true;
            heroAutoplayButton.hidden = true;
        }

        showHeroSlide(activeHeroSlide, true);
        updateAutoplayButton();

        if (pageLoader && !loaderClosed) {
            document.addEventListener(
                loaderClosedEventName,
                startHeroAutoplay,
                { once: true }
            );
        } else {
            startHeroAutoplay();
        }
    }


    

    if (
        heroVideoFrame &&
        window
            .matchMedia(
                "(pointer: fine)"
            )
            .matches &&
        !window
            .matchMedia(
                "(prefers-reduced-motion: reduce)"
            )
            .matches
    ) {

        heroVideoFrame.addEventListener(
            "pointermove",
            (event) => {

                const rect =
                    heroVideoFrame
                        .getBoundingClientRect();

                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                        rect.width -
                    0.5;

                const y =
                    (
                        event.clientY -
                        rect.top
                    ) /
                        rect.height -
                    0.5;

                heroVideoFrame.style.setProperty(
                    "--video-rotate-y",
                    `${x * 7}deg`
                );

                heroVideoFrame.style.setProperty(
                    "--video-rotate-x",
                    `${y * -7}deg`
                );

            }
        );


        heroVideoFrame.addEventListener(
            "pointerleave",
            () => {

                heroVideoFrame.style.setProperty(
                    "--video-rotate-x",
                    "0deg"
                );

                heroVideoFrame.style.setProperty(
                    "--video-rotate-y",
                    "0deg"
                );

            }
        );

    }


    

    const inaugurationSlider = document.querySelector(
        "[data-inauguration-slider]"
    );

    if (inaugurationSlider) {
        const sliderTrack = inaugurationSlider.querySelector(
            "[data-slider-track]"
        );

        const slides = Array.from(
            inaugurationSlider.querySelectorAll(".inauguration-slide")
        );

        const previousButton = inaugurationSlider.querySelector(
            "[data-slider-previous]"
        );

        const nextButton = inaugurationSlider.querySelector(
            "[data-slider-next]"
        );

        const dotsContainer = inaugurationSlider.querySelector(
            "[data-slider-dots]"
        );

        const currentLabel = inaugurationSlider.querySelector(
            "[data-slider-current]"
        );

        const totalLabel = inaugurationSlider.querySelector(
            "[data-slider-total]"
        );

        const dots = [];
        let currentSlide = 0;
        let autoAdvanceTimer = null;
        let pointerStartX = null;
        let suppressSliderClick = false;

        const formatSlideNumber = (value) =>
            String(value).padStart(2, "0");

        if (totalLabel) {
            totalLabel.textContent = formatSlideNumber(slides.length);
        }

        const setSlideMediaState = (slide, isReady) => {
            const videoButton = slide.querySelector(
                ".outlet-video-trigger"
            );

            const mediaLabel = slide.querySelector(
                "[data-media-label]"
            );

            const slideName =
                slide.dataset.slideName ||
                "Shop inauguration";

            slide.classList.toggle("is-media-pending", !isReady);

            if (videoButton) {
                videoButton.disabled = !isReady;
                videoButton.setAttribute(
                    "aria-label",
                    isReady
                        ? `Play ${slideName} inauguration video`
                        : `${slideName} photo and video pending upload`
                );
            }

            if (mediaLabel) {
                mediaLabel.textContent = isReady
                    ? "Watch Inauguration"
                    : "Upload Pending";
            }
        };

        slides.forEach((slide) => {
            const thumbnail = slide.querySelector(
                ".inauguration-thumbnail"
            );

            if (!thumbnail) {
                setSlideMediaState(slide, false);
                return;
            }

            thumbnail.addEventListener("load", () => {
                setSlideMediaState(slide, true);
            });

            thumbnail.addEventListener("error", () => {
                setSlideMediaState(slide, false);
            });

            if (thumbnail.complete) {
                setSlideMediaState(
                    slide,
                    thumbnail.naturalWidth > 0
                );
            }
        });

        slides.forEach((slide, index) => {
            const dot = document.createElement("button");
            const slideName =
                slide.dataset.slideName ||
                `Inauguration video ${index + 1}`;

            dot.type = "button";
            dot.setAttribute("aria-label", `Show ${slideName}`);

            dot.addEventListener("click", () => {
                showSlide(index, true);
            });

            dotsContainer?.appendChild(dot);
            dots.push(dot);
        });

        const stopAutoAdvance = () => {
            if (autoAdvanceTimer !== null) {
                window.clearInterval(autoAdvanceTimer);
                autoAdvanceTimer = null;
            }
        };

        const startAutoAdvance = () => {
            stopAutoAdvance();

            if (slides.length <= 1 || prefersReducedMotion) {
                return;
            }

            autoAdvanceTimer = window.setInterval(() => {
                showSlide(currentSlide + 1, false);
            }, 6500);
        };

        function showSlide(index, restartTimer = false) {
            if (!sliderTrack || slides.length === 0) {
                return;
            }

            currentSlide =
                (index + slides.length) % slides.length;

            sliderTrack.style.transform =
                `translateX(-${currentSlide * 100}%)`;

            slides.forEach((slide, slideIndex) => {
                const isCurrent = slideIndex === currentSlide;
                const videoButton = slide.querySelector(
                    ".outlet-video-trigger"
                );

                slide.setAttribute("aria-hidden", String(!isCurrent));

                if (videoButton) {
                    videoButton.tabIndex = isCurrent ? 0 : -1;
                }
            });

            dots.forEach((dot, dotIndex) => {
                const isCurrent = dotIndex === currentSlide;
                dot.classList.toggle("is-active", isCurrent);
                dot.setAttribute("aria-pressed", String(isCurrent));
            });

            if (currentLabel) {
                currentLabel.textContent = formatSlideNumber(
                    currentSlide + 1
                );
            }

            const hasMultipleSlides = slides.length > 1;

            if (previousButton) {
                previousButton.disabled = !hasMultipleSlides;
            }

            if (nextButton) {
                nextButton.disabled = !hasMultipleSlides;
            }

            if (restartTimer) {
                startAutoAdvance();
            }
        }

        previousButton?.addEventListener("click", () => {
            showSlide(currentSlide - 1, true);
        });

        nextButton?.addEventListener("click", () => {
            showSlide(currentSlide + 1, true);
        });

        inaugurationSlider.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showSlide(currentSlide - 1, true);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showSlide(currentSlide + 1, true);
            }
        });

        inaugurationSlider.addEventListener("pointerdown", (event) => {
            if (slides.length > 1 && event.isPrimary) {
                pointerStartX = event.clientX;
            }
        });

        inaugurationSlider.addEventListener("pointerup", (event) => {
            if (pointerStartX === null || !event.isPrimary) {
                return;
            }

            const distance = event.clientX - pointerStartX;
            pointerStartX = null;

            if (Math.abs(distance) < 55) {
                return;
            }

            suppressSliderClick = true;

            window.setTimeout(() => {
                suppressSliderClick = false;
            }, 400);

            showSlide(
                distance > 0
                    ? currentSlide - 1
                    : currentSlide + 1,
                true
            );
        });

        inaugurationSlider.addEventListener("click", (event) => {
            if (!suppressSliderClick) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            suppressSliderClick = false;
        }, true);

        inaugurationSlider.addEventListener(
            "pointercancel",
            () => {
                pointerStartX = null;
            }
        );

        inaugurationSlider.addEventListener(
            "mouseenter",
            stopAutoAdvance
        );

        inaugurationSlider.addEventListener(
            "mouseleave",
            startAutoAdvance
        );

        inaugurationSlider.addEventListener(
            "focusin",
            stopAutoAdvance
        );

        inaugurationSlider.addEventListener("focusout", () => {
            window.setTimeout(() => {
                if (!inaugurationSlider.contains(document.activeElement)) {
                    startAutoAdvance();
                }
            }, 0);
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                stopAutoAdvance();
            } else {
                startAutoAdvance();
            }
        });

        document.addEventListener(
            "chickbuck:video-open",
            stopAutoAdvance
        );

        document.addEventListener(
            "chickbuck:video-close",
            startAutoAdvance
        );

        showSlide(0);
        startAutoAdvance();
    }


    

    const outletCarousel = document.querySelector(
        "[data-outlet-carousel]"
    );

    if (outletCarousel) {
        const outletViewport = outletCarousel.querySelector(
            "[data-outlet-viewport]"
        );

        const outletTrack = outletCarousel.querySelector(
            "[data-outlet-track]"
        );

        const outletCards = Array.from(
            outletCarousel.querySelectorAll("[data-outlet-card]")
        );

        const outletPrevious = outletCarousel.querySelector(
            "[data-outlet-previous]"
        );

        const outletNext = outletCarousel.querySelector(
            "[data-outlet-next]"
        );

        const outletCurrent = outletCarousel.querySelector(
            "[data-outlet-current]"
        );

        const outletTotal = outletCarousel.querySelector(
            "[data-outlet-total]"
        );

        let outletPage = 0;
        let outletCardsPerPage = 1;
        let outletPageCount = 1;
        let outletPointerStart = null;
        let suppressOutletClick = false;

        const formatOutletNumber = (value) =>
            String(value).padStart(2, "0");

        const setOutletMediaState = (
            card,
            {
                photoReady = false,
                videoReady = false
            } = {}
        ) => {
            const videoButton = card.querySelector(
                ".outlet-video-trigger"
            );

            const thumbnail = card.querySelector(
                ".outlet-inauguration-thumbnail"
            );

            const mediaLabel = card.querySelector(
                "[data-media-label]"
            );

            const uploadMessage = card.querySelector(
                ".inauguration-media-placeholder span"
            );

            const title =
                videoButton?.dataset.title ||
                "Shop inauguration";

            card.classList.toggle("is-media-pending", !videoReady);
            card.classList.toggle("has-uploaded-photo", photoReady);
            card.classList.toggle("has-uploaded-video", videoReady);

            if (thumbnail) {
                thumbnail.hidden = !photoReady;
                thumbnail.setAttribute(
                    "aria-hidden",
                    String(!photoReady)
                );
            }

            if (videoButton) {
                videoButton.disabled = !videoReady;
                videoButton.setAttribute(
                    "aria-label",
                    videoReady
                        ? `Play ${title} inauguration video`
                        : `${title} photo and video pending upload`
                );
            }

            if (mediaLabel) {
                mediaLabel.textContent = videoReady
                    ? "Watch Inauguration"
                    : "Upload Pending";
            }

            if (uploadMessage) {
                if (!uploadMessage.dataset.pendingText) {
                    uploadMessage.dataset.pendingText =
                        uploadMessage.textContent.trim();
                }

                if (videoReady && !photoReady) {
                    uploadMessage.textContent =
                        "Inauguration video ready";
                } else if (!videoReady && photoReady) {
                    uploadMessage.textContent =
                        "Photo ready • add inauguration video";
                } else {
                    uploadMessage.textContent =
                        uploadMessage.dataset.pendingText;
                }
            }
        };

        outletCards.forEach((card) => {
            const thumbnail = card.querySelector(
                ".outlet-inauguration-thumbnail"
            );

            const videoButton = card.querySelector(
                ".outlet-video-trigger"
            );

            const mediaState = {
                photoReady: false,
                videoReady: false
            };

            const updateMediaState = () => {
                setOutletMediaState(card, mediaState);
            };

            if (thumbnail) {
                thumbnail.hidden = true;

                thumbnail.addEventListener("load", () => {
                    mediaState.photoReady = true;
                    updateMediaState();
                });

                thumbnail.addEventListener("error", () => {
                    mediaState.photoReady = false;
                    updateMediaState();
                });

                if (thumbnail.complete) {
                    mediaState.photoReady =
                        thumbnail.naturalWidth > 0;
                }
            }

            const videoSource = videoButton?.dataset.video;

            if (videoSource) {
                // The source is loaded only after the visitor chooses to play it.
                // This prevents every large outlet video from downloading metadata
                // during the initial About-page load.
                mediaState.videoReady = true;
            }

            updateMediaState();
        });

        const showOutletPage = (page) => {
            if (
                !outletTrack ||
                outletCards.length === 0
            ) {
                return;
            }

            outletPage = Math.max(
                0,
                Math.min(page, outletPageCount - 1)
            );

            const firstVisibleIndex = Math.min(
                outletPage * outletCardsPerPage,
                outletCards.length - 1
            );

            const firstCard = outletCards[0];
            const targetCard = outletCards[firstVisibleIndex];
            const offset = targetCard.offsetLeft - firstCard.offsetLeft;

            outletTrack.style.transform =
                `translateX(-${offset}px)`;

            outletCards.forEach((card, index) => {
                const isVisible =
                    index >= firstVisibleIndex &&
                    index < firstVisibleIndex + outletCardsPerPage;

                card.setAttribute("aria-hidden", String(!isVisible));

                const videoButton = card.querySelector(
                    ".outlet-video-trigger"
                );

                if (videoButton) {
                    videoButton.tabIndex = isVisible ? 0 : -1;
                }
            });

            if (outletCurrent) {
                outletCurrent.textContent = formatOutletNumber(
                    outletPage + 1
                );
            }

            if (outletPrevious) {
                outletPrevious.disabled = outletPage === 0;
            }

            if (outletNext) {
                outletNext.disabled = outletPage >= outletPageCount - 1;
            }
        };

        const measureOutletCarousel = () => {
            if (
                !outletViewport ||
                outletCards.length === 0
            ) {
                return;
            }

            const cardWidth = outletCards[0]
                .getBoundingClientRect().width;

            const trackStyles = window.getComputedStyle(outletTrack);
            const gap = parseFloat(trackStyles.columnGap) || 0;

            outletCardsPerPage = Math.max(
                1,
                Math.round(
                    (outletViewport.clientWidth + gap) /
                    (cardWidth + gap)
                )
            );

            outletPageCount = Math.max(
                1,
                Math.ceil(outletCards.length / outletCardsPerPage)
            );

            if (outletTotal) {
                outletTotal.textContent = formatOutletNumber(
                    outletPageCount
                );
            }

            showOutletPage(
                Math.min(outletPage, outletPageCount - 1)
            );
        };

        outletPrevious?.addEventListener("click", () => {
            showOutletPage(outletPage - 1);
        });

        outletNext?.addEventListener("click", () => {
            showOutletPage(outletPage + 1);
        });

        outletCarousel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                showOutletPage(outletPage - 1);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                showOutletPage(outletPage + 1);
            }
        });

        outletCarousel.addEventListener("pointerdown", (event) => {
            if (event.isPrimary) {
                outletPointerStart = event.clientX;
            }
        });

        outletCarousel.addEventListener("pointerup", (event) => {
            if (outletPointerStart === null || !event.isPrimary) {
                return;
            }

            const distance = event.clientX - outletPointerStart;
            outletPointerStart = null;

            if (Math.abs(distance) < 55) {
                return;
            }

            suppressOutletClick = true;

            window.setTimeout(() => {
                suppressOutletClick = false;
            }, 400);

            showOutletPage(
                distance > 0
                    ? outletPage - 1
                    : outletPage + 1
            );
        });

        outletCarousel.addEventListener("click", (event) => {
            if (!suppressOutletClick) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            suppressOutletClick = false;
        }, true);

        window.addEventListener("resize", () => {
            window.requestAnimationFrame(measureOutletCarousel);
        });

        measureOutletCarousel();
    }


    

    const outletModal =
        document.getElementById(
            "outletVideoModal"
        );

    const outletModalVideo =
        document.getElementById(
            "outletModalVideo"
        );

    const outletModalTitle =
        document.getElementById(
            "outletModalTitle"
        );

    const outletVideoStatus =
        document.getElementById(
            "outletVideoStatus"
        );

    const outletTriggers =
        document.querySelectorAll(
            ".outlet-video-trigger"
        );

    const outletCloseButtons =
        document.querySelectorAll(
            "[data-close-video]"
        );

    let lastOutletTrigger = null;


    const showOutletStatus = (
        message = ""
    ) => {

        if (!outletVideoStatus) {
            return;
        }

        outletVideoStatus.textContent =
            message;

        outletVideoStatus.classList.toggle(
            "is-visible",
            Boolean(message)
        );

    };


    const closeOutletModal = () => {

        if (!outletModal) return;

        outletModal.classList.remove(
            "is-open"
        );

        outletModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "outlet-modal-open"
        );

        if (outletModalVideo) {

            outletModalVideo.pause();

            outletModalVideo.removeAttribute(
                "src"
            );

            outletModalVideo.load();

        }

        showOutletStatus("");

        lastOutletTrigger?.focus();

        document.dispatchEvent(
            new CustomEvent("chickbuck:video-close")
        );

    };


    outletTriggers.forEach(
        (trigger) => {

            trigger.addEventListener(
                "click",
                async () => {

                    if (
                        !outletModal ||
                        !outletModalVideo
                    ) {
                        return;
                    }

                    const videoSource =
                        trigger.dataset.video;

                    const videoTitle =
                        trigger.dataset.title ||
                        "Outlet Video";

                    if (!videoSource) {
                        return;
                    }

                    lastOutletTrigger = trigger;

                    document.dispatchEvent(
                        new CustomEvent("chickbuck:video-open")
                    );

                    if (outletModalTitle) {

                        outletModalTitle.textContent =
                            videoTitle;

                    }

                    outletModalVideo.src =
                        videoSource;

                    outletModalVideo.load();

                    outletModal.classList.add(
                        "is-open"
                    );

                    outletModal.setAttribute(
                        "aria-hidden",
                        "false"
                    );

                    document.body.classList.add(
                        "outlet-modal-open"
                    );

                    showOutletStatus("");

                    outletModal
                        .querySelector("button[data-close-video]")
                        ?.focus();

                    try {

                        await outletModalVideo.play();

                    } catch (error) {

                        // Browser may block autoplay.

                    }

                }
            );

        }
    );


    outletModalVideo?.addEventListener(
        "error",
        () => {

            showOutletStatus(
                "This outlet video could not be loaded. Check the video filename and folder."
            );

        }
    );


    outletCloseButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                closeOutletModal
            );

        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                outletModal?.classList.contains(
                    "is-open"
                )
            ) {

                closeOutletModal();

            }

            if (
                event.key === "Tab" &&
                outletModal?.classList.contains("is-open")
            ) {
                const focusable = Array.from(
                    outletModal.querySelectorAll(
                        "button:not([disabled]), video[controls], a[href]"
                    )
                );

                if (focusable.length === 0) {
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }

        }
    );

});



document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector("[data-vengara-gallery]");
    const toggleButton = document.querySelector("[data-vengara-gallery-toggle]");
    const toggleLabel = document.querySelector("[data-vengara-gallery-toggle-label]");
    const status = document.querySelector("[data-vengara-gallery-status]");
    const total = document.querySelector("[data-vengara-gallery-total]");

    if (!gallery || !toggleButton || !toggleLabel || !status) {
        return;
    }

    const photoDetails = [
        ["asset/image/first-shop-under-construction.webp", "The Beginning", "Workers installing the facade of Chick Buck's first Kerala shop"],
        ["asset/image/first-shop-opening-front.webp", "Opening Day", "The first Chick Buck storefront prepared for opening day"],
        ["asset/image/first-shop-interior-wide.webp", "Inside the Shop", "Dining area inside Chick Buck's first shop with red chairs and wooden tables"],
        ["asset/image/first-shop-counter.webp", "The Counter", "The original Chick Buck service counter ready for the first orders"],
        ["asset/image/first-shop-dining-room.webp", "Dining Room", "Wide view of the dining room at Chick Buck's first shop"],
        ["asset/image/first-shop-opening-day.webp", "Community", "Guests gathered outside Chick Buck's first shop on opening day"],
        ["asset/image/vengara-opening/vengara-opening-01.jpg", "Team", "The Chick Buck Vengara team together behind the service counter"],
        ["asset/image/vengara-opening/vengara-opening-07.jpg", "First Orders", "A young guest receiving a Chick Buck meal at the counter"],
        ["asset/image/vengara-opening/vengara-opening-11.jpg", "First Orders", "Opening-day guests placing orders at the Chick Buck counter"],
        ["asset/image/vengara-opening/vengara-opening-16.jpg", "Community", "Neighbours waiting together near the Vengara opening venue"],
        ["asset/image/vengara-opening/vengara-opening-23.jpg", "Celebration", "Opening lights framing the crowd outside the Vengara shop"],
        ["asset/image/vengara-opening/vengara-opening-24.jpg", "Hospitality", "Welcome refreshments and Chick Buck packaging at the counter"],
        ["asset/image/vengara-opening/vengara-opening-26.jpg", "Kitchen", "Chick Buck team preparing fresh wraps in the Vengara kitchen"],
        ["asset/image/vengara-opening/vengara-opening-28.jpg", "Kitchen", "A Chick Buck cook coating marinated chicken by hand"],
        ["asset/image/vengara-opening/vengara-opening-29.jpg", "Kitchen", "Fresh chicken cooking in the Chick Buck fryer"],
        ["asset/image/vengara-opening/vengara-opening-30.jpg", "Kitchen", "Guests touring the stainless-steel Vengara kitchen"],
        ["asset/image/vengara-opening/vengara-opening-31.jpg", "Opening Ceremony", "Community leaders and guests arriving for the Vengara inauguration"],
        ["asset/image/vengara-opening/vengara-opening-34.jpg", "First Welcome", "The inaugural guest entering the new Chick Buck Vengara shop"],
        ["asset/image/vengara-opening/vengara-opening-37.jpg", "Opening Ceremony", "A prayer moment at the Chick Buck Vengara counter"],
        ["asset/image/vengara-opening/vengara-opening-39.jpg", "Recognition", "An award presented during the Chick Buck Vengara opening day"],
        ["asset/image/vengara-opening/vengara-opening-40.jpg", "Celebration", "A lively crowd filling the Vengara dining room"],
        ["asset/image/vengara-opening/vengara-opening-44.jpg", "Community", "Street view of the Chick Buck Vengara celebration"],
        ["asset/image/vengara-opening/vengara-opening-45.jpg", "Hospitality", "Guests enjoying welcome refreshments at the counter"],
        ["asset/image/vengara-opening/vengara-opening-46.jpg", "Our Guests", "A young guest with community leaders inside Chick Buck"],
        ["asset/image/vengara-opening/vengara-opening-48.jpg", "Opening Ceremony", "Community leaders meeting beside the Chick Buck counter"],
        ["asset/image/vengara-opening/vengara-opening-49.jpg", "First Orders", "Freshly wrapped Chick Buck meals ready to be served"],
        ["asset/image/vengara-opening/vengara-opening-52.jpg", "Opening Ceremony", "The inaugural guest speaking with community members"],
        ["asset/image/vengara-opening/vengara-opening-54.jpg", "Community", "Local guests gathered across the road from Chick Buck Vengara"],
        ["asset/image/vengara-opening/vengara-opening-56.jpg", "Our Guests", "A family gathered outside Chick Buck Vengara on opening day"],
        ["asset/image/vengara-opening/vengara-opening-58.jpg", "Community", "Local visitors meeting outside the Vengara outlet"],
        ["asset/image/vengara-opening/vengara-opening-59.jpg", "Community", "Community representatives together at the inauguration"],
        ["asset/image/vengara-opening/vengara-opening-60.jpg", "Media", "Chick Buck representatives speaking to local media"],
        ["asset/image/vengara-opening/vengara-opening-63.jpg", "Media", "Chick Buck founders interviewed inside the Vengara outlet"],
        ["asset/image/vengara-opening/vengara-opening-64.jpg", "Our Guests", "Guests relaxing around the dining tables after the ceremony"]
    ];
    const totalPhotoCount = photoDetails.length;
    const initialPhotoCount = Math.min(8, totalPhotoCount);

    if (total) {
        total.textContent = String(totalPhotoCount);
    }

    const imageObserver = "IntersectionObserver" in window
        ? new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const image = entry.target;
                if (image.dataset.src && !image.hasAttribute("src")) {
                    image.src = image.dataset.src;
                }
                observer.unobserve(image);
            });
        }, { rootMargin: "320px 0px" })
        : null;

    const loadImage = (image) => {
        if (!image.dataset.src || image.hasAttribute("src")) {
            return;
        }

        if (imageObserver) {
            imageObserver.observe(image);
        } else {
            image.src = image.dataset.src;
        }
    };

    photoDetails.forEach(([fileName, category, altText], index) => {
        const displayNumber = String(index + 1).padStart(2, "0");
        const button = document.createElement("button");
        const image = document.createElement("img");
        const shade = document.createElement("span");
        const meta = document.createElement("span");
        const copy = document.createElement("span");
        const label = document.createElement("small");
        const title = document.createElement("strong");
        const openIcon = document.createElement("span");

        button.type = "button";
        button.className = "vengara-photo";
        button.dataset.vengaraPhoto = "";
        button.dataset.photoGallery = "first-shop-vengara";
        button.dataset.src = fileName;
        button.dataset.caption = altText;
        button.setAttribute("aria-label", `Open photo ${displayNumber}: ${altText}`);
        button.hidden = index >= initialPhotoCount;

        image.alt = altText;
        image.dataset.src = fileName;
        image.decoding = "async";
        image.loading = "lazy";
        image.width = 1600;
        image.height = 1066;

        if (index < initialPhotoCount) {
            image.src = fileName;
        }

        shade.className = "vengara-photo-shade";
        shade.setAttribute("aria-hidden", "true");
        meta.className = "vengara-photo-meta";
        copy.append(label, title);
        label.textContent = `${displayNumber} / ${category}`;
        title.textContent = category;
        openIcon.className = "vengara-photo-open";
        openIcon.setAttribute("aria-hidden", "true");
        openIcon.textContent = "↗";
        meta.append(copy, openIcon);
        button.append(image, shade, meta);
        gallery.append(button);
    });

    const extraPhotos = Array.from(gallery.children).slice(initialPhotoCount);
    let expanded = false;

    const updateGallery = () => {
        extraPhotos.forEach((photo) => {
            photo.hidden = !expanded;
            if (expanded) {
                const image = photo.querySelector("img");
                if (image) {
                    loadImage(image);
                }
            }
        });

        toggleButton.setAttribute("aria-expanded", String(expanded));
        toggleLabel.textContent = expanded ? "Show fewer photos" : `View all ${totalPhotoCount} photos`;
        status.textContent = expanded
            ? `Showing all ${totalPhotoCount} photographs.`
            : `Showing ${initialPhotoCount} of ${totalPhotoCount} photographs.`;
    };

    updateGallery();

    toggleButton.addEventListener("click", () => {
        expanded = !expanded;
        updateGallery();

        if (!expanded) {
            document.getElementById("vengaraGalleryTitle")?.scrollIntoView({
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
                block: "start"
            });
        }
    });
});



document.addEventListener("DOMContentLoaded", () => {
    const photoButtons = Array.from(
        document.querySelectorAll("[data-first-shop-photo], [data-vengara-photo]")
    );
    const lightbox = document.getElementById("firstShopLightbox");
    const lightboxImage = document.getElementById("firstShopLightboxImage");
    const lightboxCaption = document.getElementById("firstShopLightboxCaption");
    const lightboxCount = document.getElementById("firstShopLightboxCount");
    const closeButtons = lightbox?.querySelectorAll("[data-first-shop-close]") || [];
    const previousButton = lightbox?.querySelector("[data-first-shop-prev]");
    const nextButton = lightbox?.querySelector("[data-first-shop-next]");
    const closeButton = lightbox?.querySelector(".first-shop-lightbox-close");

    if (
        photoButtons.length === 0 ||
        !lightbox ||
        !lightboxImage ||
        !lightboxCaption ||
        !lightboxCount
    ) {
        return;
    }

    let activeIndex = 0;
    let activePhotoButtons = photoButtons;
    let lastPhotoTrigger = null;

    const renderPhoto = (index) => {
        activeIndex = (index + activePhotoButtons.length) % activePhotoButtons.length;

        const photoButton = activePhotoButtons[activeIndex];
        const sourceImage = photoButton.querySelector("img");

        lightboxImage.src = photoButton.dataset.src || sourceImage?.src || "";
        lightboxImage.alt = sourceImage?.alt || "Chick Buck photograph";
        lightboxCaption.textContent = photoButton.dataset.caption || sourceImage?.alt || "";
        lightboxCount.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(activePhotoButtons.length).padStart(2, "0")}`;
    };

    const openLightbox = (trigger) => {
        const galleryName = trigger.dataset.photoGallery || "first-shop";
        activePhotoButtons = photoButtons.filter((button) =>
            (button.dataset.photoGallery || "first-shop") === galleryName
        );
        const index = activePhotoButtons.indexOf(trigger);
        lastPhotoTrigger = trigger;
        renderPhoto(index);
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("first-shop-lightbox-open");

        window.setTimeout(() => {
            if (lightbox.classList.contains("is-open")) {
                closeButton?.focus({ preventScroll: true });
            }
        }, 80);
    };

    const closeLightbox = () => {
        if (!lightbox.classList.contains("is-open")) {
            return;
        }

        lightbox.classList.remove("is-open");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("first-shop-lightbox-open");
        lightboxImage.removeAttribute("src");
        lastPhotoTrigger?.focus();
    };

    photoButtons.forEach((photoButton, index) => {
        photoButton.style.setProperty(
            "--reveal-delay",
            `${Math.min(index % 4, 3) * 85}ms`
        );

        photoButton.addEventListener("click", () => {
            openLightbox(photoButton);
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener("click", closeLightbox);
    });

    previousButton?.addEventListener("click", () => {
        renderPhoto(activeIndex - 1);
    });

    nextButton?.addEventListener("click", () => {
        renderPhoto(activeIndex + 1);
    });

    document.addEventListener("keydown", (event) => {
        if (!lightbox.classList.contains("is-open")) {
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            closeLightbox();
            return;
        }

        if (event.key === "ArrowLeft") {
            event.preventDefault();
            renderPhoto(activeIndex - 1);
            return;
        }

        if (event.key === "ArrowRight") {
            event.preventDefault();
            renderPhoto(activeIndex + 1);
            return;
        }

        if (event.key !== "Tab") {
            return;
        }

        const focusable = Array.from(
            lightbox.querySelectorAll("button:not([disabled])")
        );

        if (focusable.length === 0) {
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

});



document.addEventListener("DOMContentLoaded", () => {

    const addMobileBottomNavigation = () => {
        if (document.querySelector(".mobile-bottom-nav")) {
            return;
        }

        const currentFile = decodeURIComponent(window.location.pathname)
            .split("/")
            .filter(Boolean)
            .pop()
            ?.toLowerCase() || "index.html";

        const mobileNavigationItems = [
            {
                href: "index.html",
                label: "Home",
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M3 10.6 12 3l9 7.6v9.1a1.3 1.3 0 0 1-1.3 1.3h-4.9v-6.2H9.2V21H4.3A1.3 1.3 0 0 1 3 19.7Z" />
                    </svg>
                `
            },
            {
                href: "mainmenu.html",
                label: "Menu",
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M5 4.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z" />
                        <path d="M7.5 8h9M7.5 12h9M7.5 16h5" />
                    </svg>
                `
            },
            {
                href: "about.html",
                label: "About",
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5.5 20c.4-4 2.7-6 6.5-6s6.1 2 6.5 6" />
                    </svg>
                `
            },
            {
                href: "contact.html",
                label: "Contact",
                icon: `
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M4 5.8A2.8 2.8 0 0 1 6.8 3h10.4A2.8 2.8 0 0 1 20 5.8v7.4a2.8 2.8 0 0 1-2.8 2.8H10l-4.8 4v-4.3A2.8 2.8 0 0 1 4 13.2Z" />
                        <path d="M8 8.5h8M8 11.8h5.5" />
                    </svg>
                `
            }
        ];

        const navigation = document.createElement("nav");
        navigation.className = "mobile-bottom-nav";
        navigation.setAttribute("aria-label", "Primary mobile navigation");

        const navigationInner = document.createElement("div");
        navigationInner.className = "mobile-bottom-nav__inner";

        const navigationIndicator = document.createElement("span");
        navigationIndicator.className =
            "mobile-bottom-nav__indicator no-transition";
        navigationIndicator.setAttribute("aria-hidden", "true");
        navigationInner.appendChild(navigationIndicator);

        const mobileNavigationLinks = [];
        const activeIndex = Math.max(
            0,
            mobileNavigationItems.findIndex(
                (item) => item.href === currentFile
            )
        );

        mobileNavigationItems.forEach((item, index) => {
            const isCurrentPage = currentFile === item.href;
            const link = document.createElement("a");

            link.className = `mobile-bottom-nav__item${isCurrentPage ? " is-active" : ""}`;
            link.href = item.href;
            link.setAttribute("aria-label", item.label);

            if (isCurrentPage) {
                link.setAttribute("aria-current", "page");
            }

            link.innerHTML = `${item.icon}<span class="mobile-bottom-nav__label">${item.label}</span>`;
            link.addEventListener("click", (event) => {
                if (isCurrentPage) {
                    event.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)"
                        ).matches
                            ? "auto"
                            : "smooth"
                    });
                    return;
                }

                mobileNavigationLinks.forEach((navigationLink, linkIndex) => {
                    const willBeActive = linkIndex === index;
                    navigationLink.classList.toggle(
                        "is-active",
                        willBeActive
                    );

                    if (willBeActive) {
                        navigationLink.setAttribute(
                            "aria-current",
                            "page"
                        );
                    } else {
                        navigationLink.removeAttribute("aria-current");
                    }
                });

                positionMobileIndicator(index);
                navigateWithPageTransition(event, link, {
                    previousIndex: activeIndex
                });
            });

            navigationInner.appendChild(link);
            mobileNavigationLinks.push(link);
        });

        const mobileThemeButton = document.createElement("button");
        mobileThemeButton.className =
            "mobile-bottom-nav__item mobile-bottom-nav__theme";
        mobileThemeButton.type = "button";
        mobileThemeButton.innerHTML = `
            <span class="mobile-bottom-nav__theme-icon" aria-hidden="true">
                <svg class="mobile-theme-icon mobile-theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"></path>
                </svg>
                <svg class="mobile-theme-icon mobile-theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"></path>
                </svg>
            </span>
            <span class="mobile-bottom-nav__label" data-mobile-theme-label>Dark</span>
        `;

        const updateMobileThemeButton = () => {
            const isDarkTheme = document.documentElement.hasAttribute(
                "data-chickbuck-dark"
            );
            const nextThemeLabel = isDarkTheme ? "Light" : "Dark";

            mobileThemeButton.setAttribute(
                "aria-label",
                `Switch to ${nextThemeLabel.toLowerCase()} mode`
            );
            mobileThemeButton.setAttribute(
                "aria-pressed",
                String(isDarkTheme)
            );

            const label = mobileThemeButton.querySelector(
                "[data-mobile-theme-label]"
            );

            if (label) {
                label.textContent = nextThemeLabel;
            }
        };

        mobileThemeButton.addEventListener("click", () => {
            const nextTheme = document.documentElement.hasAttribute(
                "data-chickbuck-dark"
            )
                ? "light"
                : "dark";

            applyChickBuckTheme(nextTheme);

            try {
                window.localStorage.setItem(
                    CHICK_BUCK_THEME_KEY,
                    nextTheme
                );
            } catch (error) {
                // The theme still works if browser storage is unavailable.
            }

            updateMobileThemeButton();
        });

        updateMobileThemeButton();
        navigationInner.appendChild(mobileThemeButton);

        const positionMobileIndicator = (
            index,
            moveImmediately = false
        ) => {
            const targetLink = mobileNavigationLinks[index];

            if (!targetLink) {
                return;
            }

            navigationIndicator.classList.toggle(
                "no-transition",
                moveImmediately
            );
            navigationIndicator.style.width = `${targetLink.offsetWidth}px`;
            navigationIndicator.style.transform =
                `translate3d(${targetLink.offsetLeft}px, 0, 0)`;
        };

        navigation.appendChild(navigationInner);
        document.body.appendChild(navigation);
        document.body.classList.add("has-mobile-bottom-nav");

        let previousIndex = activeIndex;

        try {
            const storedIndex = Number(
                window.sessionStorage.getItem(
                    CHICK_BUCK_NAV_PREVIOUS_INDEX
                )
            );

            if (
                Number.isInteger(storedIndex) &&
                storedIndex >= 0 &&
                storedIndex < mobileNavigationLinks.length
            ) {
                previousIndex = storedIndex;
            }

            window.sessionStorage.removeItem(
                CHICK_BUCK_NAV_PREVIOUS_INDEX
            );
        } catch (error) {
            previousIndex = activeIndex;
        }

        window.requestAnimationFrame(() => {
            positionMobileIndicator(previousIndex, true);

            window.requestAnimationFrame(() => {
                navigationIndicator.classList.remove("no-transition");
                positionMobileIndicator(activeIndex);
            });
        });

        let mobileNavigationResizeFrame = null;

        window.addEventListener("resize", () => {
            if (mobileNavigationResizeFrame) {
                window.cancelAnimationFrame(mobileNavigationResizeFrame);
            }

            mobileNavigationResizeFrame = window.requestAnimationFrame(() => {
                positionMobileIndicator(activeIndex, true);
                mobileNavigationResizeFrame = null;
            });
        });
    };

    addMobileBottomNavigation();
});



document.addEventListener("DOMContentLoaded", () => {
    const morphTextElements = document.querySelectorAll("[data-morph-words]");

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        morphTextElements.forEach((element) => {
            const words = (element.dataset.morphWords || "")
                .split("|")
                .map((word) => word.trim())
                .filter(Boolean);
            if (words.length < 2) return;

            let wordIndex = Math.max(0, words.indexOf(element.textContent.trim()));
            window.setInterval(() => {
                element.classList.add("is-morphing-out");
                window.setTimeout(() => {
                    wordIndex = (wordIndex + 1) % words.length;
                    element.textContent = words[wordIndex];
                    element.classList.remove("is-morphing-out");
                    element.classList.add("is-morphing-in");
                    window.setTimeout(() => element.classList.remove("is-morphing-in"), 380);
                }, 180);
            }, 4500);
        });
    }

    const statCounters = document.querySelectorAll("[data-stat-counter]");

    if (statCounters.length) {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const animateCounter = (element) => {
            if (element.dataset.counted === "true") return;

            element.dataset.counted = "true";
            const target = Number(element.dataset.statCounter);
            const decimals = Math.max(0, Number(element.dataset.statDecimals) || 0);
            const suffix = element.dataset.statSuffix || "";

            if (!Number.isFinite(target) || reduceMotion) {
                element.textContent = `${target.toFixed(decimals)}${suffix}`;
                return;
            }

            const duration = 1500;
            const startedAt = performance.now();
            const render = (now) => {
                const progress = Math.min((now - startedAt) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                element.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
                if (progress < 1) window.requestAnimationFrame(render);
            };
            window.requestAnimationFrame(render);
        };

        if (!("IntersectionObserver" in window) || reduceMotion) {
            statCounters.forEach(animateCounter);
        } else {
            const observer = new IntersectionObserver((entries, instance) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    animateCounter(entry.target);
                    instance.unobserve(entry.target);
                });
            }, { threshold: 0.35 });
            statCounters.forEach((counter) => observer.observe(counter));
        }
    }

    const gallery = document.querySelector("[data-home-gallery]");

    if (!gallery) {
        return;
    }

    gallery.classList.add("home-gallery-motion");

    const revealGallery = () => {
        gallery.classList.add("is-revealed");
    };

    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !("IntersectionObserver" in window)
    ) {
        revealGallery();
        return;
    }

    const galleryObserver = new IntersectionObserver(
        (entries, observer) => {
            if (!entries[0]?.isIntersecting) {
                return;
            }

            revealGallery();
            observer.disconnect();
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -45px 0px"
        }
    );

    galleryObserver.observe(gallery);
});
