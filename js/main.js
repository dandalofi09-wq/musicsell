import { initFormulario } from './formulario.js';

document.addEventListener('DOMContentLoaded', () => {
    const botaoContratar = document.getElementById('btn-contratar');
    const formulario = document.getElementById('formulario-pedido');
    const campoDescricao = document.getElementById('descricao');
    const playersAmostras = document.querySelectorAll('#amostras audio');
    const botaoMenu = document.querySelector('.menu-toggle');
    const menuNavegacao = document.getElementById('nav-menu');
    const primeiroLinkMenu = menuNavegacao?.querySelector('a');

    const fecharMenu = ({ devolverFoco = false } = {}) => {
        if (!botaoMenu || !menuNavegacao) return;
        botaoMenu.setAttribute('aria-expanded', 'false');
        botaoMenu.setAttribute('aria-label', 'Abrir menu');
        menuNavegacao.classList.remove('is-open');

        if (devolverFoco) {
            botaoMenu.focus();
        }
    };

    const alternarMenu = () => {
        if (!botaoMenu || !menuNavegacao) return;
        const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
        botaoMenu.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        botaoMenu.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
        menuNavegacao.classList.toggle('is-open', !aberto);

        if (!aberto) {
            primeiroLinkMenu?.focus();
        } else {
            botaoMenu.focus();
        }
    };

    botaoMenu?.addEventListener('click', alternarMenu);

    menuNavegacao?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', fecharMenu);
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            const menuAberto = botaoMenu?.getAttribute('aria-expanded') === 'true';
            if (menuAberto) {
                fecharMenu({ devolverFoco: true });
            }
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            fecharMenu();
        }
    });

    botaoContratar?.addEventListener('click', () => {
        formulario?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => campoDescricao?.focus(), 400);
    });

    playersAmostras.forEach((playerAtual) => {
        playerAtual.addEventListener('play', () => {
            playersAmostras.forEach((outroPlayer) => {
                if (outroPlayer !== playerAtual) {
                    outroPlayer.pause();
                }
            });
        });
    });

    initFormulario();

    // --- BOTÃO FLUTUANTE (FAB) ---
    const fabContainer = document.getElementById('fab-container');
    const fabMain     = document.getElementById('fab-main');
    const fabOptions  = document.getElementById('fab-options');

    if (fabContainer && fabMain && fabOptions) {

        // Aparece após 400 px de scroll
        const atualizarVisibilidadeFab = () => {
            if (window.scrollY >= 400) {
                fabContainer.classList.add('fab-visible');
            } else {
                fabContainer.classList.remove('fab-visible', 'fab-open');
                fabMain.setAttribute('aria-expanded', 'false');
                fabMain.setAttribute('aria-label', 'Abrir ações de contato');
                fabOptions.setAttribute('aria-hidden', 'true');
            }
        };

        window.addEventListener('scroll', atualizarVisibilidadeFab, { passive: true });
        atualizarVisibilidadeFab();

        // Abrir / fechar ao clicar no "+"
        fabMain.addEventListener('click', (e) => {
            e.stopPropagation();
            const aberto = fabContainer.classList.toggle('fab-open');
            fabMain.setAttribute('aria-expanded', String(aberto));
            fabOptions.setAttribute('aria-hidden', String(!aberto));
            fabMain.setAttribute('aria-label', aberto ? 'Fechar ações de contato' : 'Abrir ações de contato');
        });

        // Fechar ao clicar fora
        document.addEventListener('click', () => {
            if (fabContainer.classList.contains('fab-open')) {
                fabContainer.classList.remove('fab-open');
                fabMain.setAttribute('aria-expanded', 'false');
                fabOptions.setAttribute('aria-hidden', 'true');
                fabMain.setAttribute('aria-label', 'Abrir ações de contato');
            }
        });

        // Fechar com Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && fabContainer.classList.contains('fab-open')) {
                fabContainer.classList.remove('fab-open');
                fabMain.setAttribute('aria-expanded', 'false');
                fabOptions.setAttribute('aria-hidden', 'true');
                fabMain.setAttribute('aria-label', 'Abrir ações de contato');
                fabMain.focus();
            }
        });

        // Brilho automático a cada 4 segundos (só quando fechado)
        setInterval(() => {
            if (!fabContainer.classList.contains('fab-open')) {
                fabMain.classList.add('fab-shine');
                fabMain.addEventListener('animationend', () => {
                    fabMain.classList.remove('fab-shine');
                }, { once: true });
            }
        }, 4000);
    }
});
