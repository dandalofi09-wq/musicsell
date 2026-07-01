import { initFormulario } from './formulario.js';

document.addEventListener('DOMContentLoaded', () => {
    const botaoContratar = document.getElementById('btn-contratar');
    const formulario = document.getElementById('formulario-pedido');
    const campoDescricao = document.getElementById('descricao');
    const playersAmostras = document.querySelectorAll('#amostras audio');
    const botaoMenu = document.querySelector('.menu-toggle');
    const menuNavegacao = document.getElementById('nav-menu');

    const fecharMenu = () => {
        if (!botaoMenu || !menuNavegacao) return;
        botaoMenu.setAttribute('aria-expanded', 'false');
        botaoMenu.setAttribute('aria-label', 'Abrir menu');
        menuNavegacao.classList.remove('is-open');
    };

    const alternarMenu = () => {
        if (!botaoMenu || !menuNavegacao) return;
        const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
        botaoMenu.setAttribute('aria-expanded', aberto ? 'false' : 'true');
        botaoMenu.setAttribute('aria-label', aberto ? 'Abrir menu' : 'Fechar menu');
        menuNavegacao.classList.toggle('is-open', !aberto);
    };

    botaoMenu?.addEventListener('click', alternarMenu);

    menuNavegacao?.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', fecharMenu);
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            fecharMenu();
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
});
