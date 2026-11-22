(() => {
    const section = document.getElementById('chickBuckNetwork');
    if (!section) return;

    const stage = section.querySelector('.home-network__stage');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0;
    let inView = false;

    const updateMotion = () => {
        section.classList.toggle('is-active', inView && !reducedMotion.matches);
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            inView = entries[0].isIntersecting;
            updateMotion();
        }, { rootMargin: '80px 0px', threshold: 0 });
        observer.observe(section);
    } else {
        inView = true;
        updateMotion();
    }

    reducedMotion.addEventListener?.('change', updateMotion);

    stage?.addEventListener('pointermove', (event) => {
        if (!finePointer.matches || reducedMotion.matches || !section.classList.contains('is-active') || frame) return;
        const x = event.clientX;
        const y = event.clientY;
        frame = requestAnimationFrame(() => {
            frame = 0;
            const bounds = stage.getBoundingClientRect();
            stage.style.setProperty('--network-x', `${((x - bounds.left) / bounds.width - .5) * 18}px`);
            stage.style.setProperty('--network-y', `${((y - bounds.top) / bounds.height - .5) * 12}px`);
        });
    }, { passive: true });

    stage?.addEventListener('pointerleave', () => {
        stage.style.removeProperty('--network-x');
        stage.style.removeProperty('--network-y');
    });

    const dialog = section.querySelector('#networkLocationDialog');
    const details = {
        saudi: { title: 'Saudi Arabia', copy: 'Explore Chick Buck in Jeddah and find directions, contact details and opening hours.' },
        uae: { title: 'United Arab Emirates', copy: 'Find our Abu Dhabi outlet, with directions, contact details and opening hours.' },
        kerala: { title: 'Kerala', copy: 'Discover our Kerala outlets and choose the Chick Buck location nearest to you.' }
    };

    section.querySelectorAll('.home-network__location').forEach((pin) => {
        pin.addEventListener('click', (event) => {
            if (!dialog?.showModal) return;
            const location = details[pin.dataset.networkLocation];
            if (!location) return;
            event.preventDefault();
            dialog.querySelector('#networkDialogTitle').textContent = location.title;
            dialog.querySelector('.home-network__dialog-copy').textContent = location.copy;
            dialog.querySelector('.home-network__dialog-link').href = pin.href.baseVal;
            dialog.showModal();
        });
    });

    dialog?.querySelector('.home-network__dialog-close')?.addEventListener('click', () => dialog.close());
    dialog?.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
})();
