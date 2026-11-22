/* Keyboard-friendly, user-controlled Chick Buck journey. */
(() => {
    'use strict';
    const root = document.querySelector('#homeGallery.cb-journey');
    if (!root) return;
    const timeline = root.querySelector('.cb-journey__timeline');
    const steps = [...root.querySelectorAll('.cb-journey__step')];
    const panels = [...root.querySelectorAll('.cb-journey__panel')];
    const previous = root.querySelector('#cbJourneyPrevious');
    const next = root.querySelector('#cbJourneyNext');
    const status = root.querySelector('#cbJourneyStatus');
    if (!timeline || steps.length !== 5 || panels.length !== steps.length || !previous || !next) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const verticalTimeline = window.matchMedia('(max-width: 800px)');
    let selected = 0;
    timeline.setAttribute('role', 'tablist');
    const updateOrientation = () => timeline.setAttribute('aria-orientation', verticalTimeline.matches ? 'vertical' : 'horizontal');
    updateOrientation();
    verticalTimeline.addEventListener?.('change', updateOrientation);
    steps.forEach((step, index) => {
        step.setAttribute('role', 'tab');
        step.setAttribute('aria-selected', String(index === 0));
        step.tabIndex = index === 0 ? 0 : -1;
        panels[index].setAttribute('role', 'tabpanel');
        panels[index].tabIndex = 0;
        panels[index].hidden = index !== 0;
    });
    previous.hidden = false;
    next.hidden = false;

    const show = (index, focusTab = false, announce = true) => {
        selected = (index + steps.length) % steps.length;
        steps.forEach((step, i) => {
            const active = i === selected;
            step.setAttribute('aria-selected', String(active));
            step.tabIndex = active ? 0 : -1;
            panels[i].hidden = !active;
        });
        const step = steps[selected];
        if (announce) status.textContent = `Chapter ${selected + 1} of ${steps.length}: ${step.querySelector('strong').textContent}.`;
        if (focusTab) step.focus({ preventScroll: true });
        if (timeline.scrollWidth > timeline.clientWidth) {
            const tabBox = step.getBoundingClientRect();
            const listBox = timeline.getBoundingClientRect();
            timeline.scrollTo({
                left: timeline.scrollLeft + tabBox.left - listBox.left -
                    (timeline.clientWidth - tabBox.width) / 2,
                behavior: reducedMotion.matches ? 'auto' : 'smooth'
            });
        }
    };

    steps.forEach((step, index) => {
        step.addEventListener('click', () => show(index));
        step.addEventListener('keydown', event => {
            const target = {
                ArrowRight: index + 1,
                ArrowLeft: index - 1,
                ArrowDown: index + 1,
                ArrowUp: index - 1,
                Home: 0,
                End: steps.length - 1
            }[event.key];
            if (target === undefined) return;
            event.preventDefault();
            show(target, true);
        });
    });
    previous.addEventListener('click', () => show(selected - 1));
    next.addEventListener('click', () => show(selected + 1));
})();
