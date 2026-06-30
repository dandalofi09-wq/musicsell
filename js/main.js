import { initFormulario } from './formulario.js';

document.addEventListener('DOMContentLoaded', () => {
    const botaoContratar = document.getElementById('btn-contratar');
    const formulario = document.getElementById('formulario-pedido');
    const campoDescricao = document.getElementById('descricao');

    botaoContratar?.addEventListener('click', () => {
        formulario?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => campoDescricao?.focus(), 400);
    });

    initFormulario();
});
