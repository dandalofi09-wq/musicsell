export function initMenuAcessivel() {
    const btn = document.querySelector('#menu-toggle');
    const menu = document.querySelector('#nav-menu');

    if (!btn || !menu) return;

    btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('active');
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            btn.setAttribute('aria-expanded', 'false');
            menu.classList.remove('active');
        }
    });

    // Fechar ao clicar fora do menu
    document.addEventListener('click', (event) => {
        if (!menu.classList.contains('active')) return;
        if (event.target === btn || menu.contains(event.target)) return;

        btn.setAttribute('aria-expanded', 'false');
        menu.classList.remove('active');
    });
}