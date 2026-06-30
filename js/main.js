import { initFormulario } from './formulario.js';

document.addEventListener('DOMContentLoaded', () => {
    const botaoContratar = document.getElementById('btn-contratar');
    const formulario = document.getElementById('formulario-pedido');
    const campoDescricao = document.getElementById('descricao');
    const playersAmostras = document.querySelectorAll('#amostras audio');

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
