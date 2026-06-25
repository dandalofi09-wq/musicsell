export function initMenuAcessivel() {
    const btn = document.querySelector('#menu-toggle');
    const menu = document.querySelector('#nav-menu');

    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !expanded);
        menu.classList.toggle('active');
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            btn.setAttribute('aria-expanded', 'false');
            menu.classList.remove('active');
        }
    });
}