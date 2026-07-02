export function initFormulario() {
    const form = document.getElementById('form-pedido');

    if (!form) return;

    // Flag para prevenir submissões duplicadas
    let isSubmitting = false;
    let timeoutSubmissao = null;
    let envioController = null;
    let ultimoElementoComFoco = null;

    const modalPix = document.getElementById('modal-pix');
    const fecharModalPix = document.getElementById('fechar-modal-pix');
    const botaoJaPaguei = document.getElementById('btn-ja-paguei');
    const botaoCopiarPix = document.getElementById('btn-copiar-pix');
    const chavePixValor = document.getElementById('pix-chave-valor');
    const mensagemCopiarPix = document.getElementById('mensagem-copiar-pix');
    const mensagemStatusPedido = document.getElementById('mensagem-status-pedido');
    const genero = document.getElementById('genero');
    const campoGeneroOutro = document.getElementById('campo-genero-outro');
    const generoOutro = document.getElementById('generoOutro');
    const contatoTipo = document.getElementById('contatoTipo');
    const contatoValor = document.getElementById('contatoValor');
    const contatoValorLabel = document.getElementById('contatoValorLabel');
    const captchaPergunta = document.getElementById('captcha-pergunta');
    const captchaResposta = document.getElementById('captchaResposta');
    const modalConteudo = modalPix?.querySelector('.modal-pix-conteudo');
    const seletoresFocoModal = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    sincronizarAriaDescribedBy(form);

    gerarCaptcha();
    atualizarCampoGeneroOutro();
    atualizarCampoContato();

    genero?.addEventListener('change', atualizarCampoGeneroOutro);
    contatoTipo?.addEventListener('change', atualizarCampoContato);
    form.addEventListener('input', (event) => {
        const campo = event.target;

        if (!(campo instanceof HTMLInputElement || campo instanceof HTMLTextAreaElement || campo instanceof HTMLSelectElement)) {
            return;
        }

        if (!campo.hasAttribute('required')) return;

        if (campo.value.trim()) {
            limparErroCampo(campo);
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Impedir múltiplas submissões
        if (isSubmitting) return;

        limparMensagemFormulario();

        if (!validarFormulario(form)) {
            exibirMensagemFormulario('erro', 'Revise os campos obrigatórios para continuar.');
            return;
        }

        isSubmitting = true;
        const botaoSubmit = form.querySelector('button[type="submit"]');

        // Desabilitar TODO o formulário
        const camposFormulario = form.querySelectorAll('input, textarea, select, button');
        camposFormulario.forEach(campo => campo.disabled = true);

        if (botaoSubmit) {
            botaoSubmit.classList.add('loading');
            botaoSubmit.textContent = 'Enviando...';
        }

        // Timeout de segurança (30 segundos)
        timeoutSubmissao = setTimeout(() => {
            if (isSubmitting) {
                fecharModalPixHandler();
                exibirMensagemFormulario('erro', 'A requisição demorou muito. Tente novamente.');
                restaurarFormulario();
            }
        }, 30000);

        // Gerar ID único para o pedido
        const pedidoId = gerarIdPedido();
        document.getElementById('pedidoId').value = pedidoId;

        // Construir objeto de dados manualmente
        const dados = {
            pedidoId: pedidoId,
            descricao: document.getElementById('descricao').value,
            genero: document.getElementById('genero').value,
            generoOutro: document.getElementById('generoOutro').value || '',
            contatoTipo: document.getElementById('contatoTipo').value,
            contatoValor: document.getElementById('contatoValor').value,
            frase: document.getElementById('frase').value || '',
            captchaResposta: document.getElementById('captchaResposta').value
        };

        console.log('Dados sendo enviados:', dados);

        abrirModalPix();
        definirStatusPedido('loading', 'Confirmando seu pedido...');
        envioController = new AbortController();

        try {
            const response = await fetch('https://formspree.io/f/xkolvkvk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: envioController.signal,
                body: JSON.stringify(dados)
            });

            clearTimeout(timeoutSubmissao);

            // Formspree retorna 200 para sucesso
            if (response.ok) {
                definirStatusPedido('success', 'Pedido confirmado. Agora finalize o pagamento via Pix e clique em "Ja paguei".');
                botaoJaPaguei?.removeAttribute('disabled');
            } else {
                // Log do erro para debug
                const responseText = await response.text();
                console.error('Erro na resposta:', response.status, responseText);
                throw new Error(`Erro ${response.status}: ${responseText}`);
            }
        } catch (error) {
            clearTimeout(timeoutSubmissao);

            if (error?.name === 'AbortError') {
                return;
            }

            console.error('Erro completo:', error);
            fecharModalPixHandler();
            exibirMensagemFormulario('erro', 'Não foi possível enviar o pedido. Tente novamente.');
            restaurarFormulario();
        } finally {
            envioController = null;
        }
    });

    function restaurarFormulario() {
        isSubmitting = false;
        const botaoSubmit = form.querySelector('button[type="submit"]');
        
        // Re-habilitar todos os campos
        const camposFormulario = form.querySelectorAll('input, textarea, select, button');
        camposFormulario.forEach(campo => campo.disabled = false);
        
        if (botaoSubmit) {
            botaoSubmit.classList.remove('loading');
            botaoSubmit.textContent = 'Enviar pedido';
        }
    }

    function atualizarCampoGeneroOutro() {
        if (!campoGeneroOutro || !generoOutro) return;

        const mostrar = genero?.value === 'outros';
        campoGeneroOutro.hidden = !mostrar;

        if (mostrar) {
            generoOutro.required = true;
            generoOutro.removeAttribute('disabled');
        } else {
            generoOutro.required = false;
            generoOutro.value = '';
            generoOutro.setAttribute('disabled', 'true');
            limparErroCampo(generoOutro);
        }
    }

    function atualizarCampoContato() {
        if (!contatoTipo || !contatoValor || !contatoValorLabel) return;

        const tipo = contatoTipo.value;

        if (tipo === 'email') {
            contatoValor.type = 'email';
            contatoValor.placeholder = 'Ex.: seuemail@email.com';
            contatoValorLabel.textContent = 'Informe seu e-mail *';
        } else if (tipo === 'whatsapp') {
            contatoValor.type = 'tel';
            contatoValor.placeholder = 'Ex.: (11) 99999-9999';
            contatoValorLabel.textContent = 'Informe seu WhatsApp *';
        } else {
            contatoValor.type = 'text';
            contatoValor.placeholder = 'Ex.: seuemail@email.com ou (11) 99999-9999';
            contatoValorLabel.textContent = 'Informe seu e-mail ou WhatsApp *';
        }

        limparErroCampo(contatoValor);
    }

    function gerarCaptcha() {
        const numero1 = Math.floor(Math.random() * 9) + 1;
        const numero2 = Math.floor(Math.random() * 9) + 1;
        const soma = numero1 + numero2;

        if (captchaPergunta) {
            captchaPergunta.textContent = `${numero1} + ${numero2} = ?`;
        }

        if (captchaResposta) {
            captchaResposta.dataset.expected = String(soma);
            captchaResposta.value = '';
        }
    }

    function abrirModalPix() {
        if (mensagemCopiarPix) {
            mensagemCopiarPix.textContent = '';
        }

        if (botaoJaPaguei) {
            botaoJaPaguei.setAttribute('disabled', 'true');
        }

        ultimoElementoComFoco = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        modalPix?.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';

        const elementosFocaveis = obterElementosFocaveisModal();
        elementosFocaveis[0]?.focus();
    }

    function fecharModalPixHandler(opcoes = {}) {
        const { cancelarEnvio = false } = opcoes;

        modalPix?.setAttribute('hidden', 'true');
        document.body.style.overflow = '';

        if (mensagemCopiarPix) {
            mensagemCopiarPix.textContent = '';
        }

        definirStatusPedido();

        if (ultimoElementoComFoco) {
            ultimoElementoComFoco.focus();
            ultimoElementoComFoco = null;
        }

        if (cancelarEnvio && isSubmitting) {
            clearTimeout(timeoutSubmissao);

            if (envioController) {
                envioController.abort();
                envioController = null;
            }

            restaurarFormulario();
            exibirMensagemFormulario('erro', 'Envio cancelado. Você pode ajustar e enviar novamente.');
        }
    }

    function definirStatusPedido(tipo = '', mensagem = '') {
        if (!mensagemStatusPedido) return;

        mensagemStatusPedido.className = 'mensagem-status-pedido';
        mensagemStatusPedido.textContent = mensagem;

        if (tipo) {
            mensagemStatusPedido.classList.add(`is-${tipo}`);
        }
    }

    async function copiarChavePixHandler() {
        const chave = chavePixValor?.textContent?.trim();

        if (!chave) return;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(chave);
            } else {
                const areaTemporaria = document.createElement('textarea');
                areaTemporaria.value = chave;
                document.body.appendChild(areaTemporaria);
                areaTemporaria.select();
                document.execCommand('copy');
                document.body.removeChild(areaTemporaria);
            }

            if (mensagemCopiarPix) {
                mensagemCopiarPix.textContent = 'Chave Pix copiada!';
            }
        } catch (error) {
            if (mensagemCopiarPix) {
                mensagemCopiarPix.textContent = 'Não foi possível copiar. Tente manualmente.';
            }
        }
    }

    function confirmarPagamentoHandler() {
        fecharModalPixHandler();
        form.reset();
        gerarCaptcha();
        atualizarCampoGeneroOutro();
        atualizarCampoContato();
        limparErrosFormulario(form);
        restaurarFormulario();
        exibirMensagemFormulario('sucesso', 'Pagamento confirmado! Obrigado por sua compra.');
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function obterElementosFocaveisModal() {
        if (!modalPix || !modalConteudo || modalPix.hasAttribute('hidden')) {
            return [];
        }

        return Array.from(modalConteudo.querySelectorAll(seletoresFocoModal)).filter((elemento) => {
            if (!(elemento instanceof HTMLElement)) return false;
            return !elemento.hasAttribute('hidden') && elemento.tabIndex !== -1;
        });
    }

    function tratarTecladoModal(event) {
        if (!modalPix || modalPix.hasAttribute('hidden')) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            fecharModalPixHandler({ cancelarEnvio: true });
            return;
        }

        if (event.key !== 'Tab') return;

        const focaveis = obterElementosFocaveisModal();
        if (!focaveis.length) return;

        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        const ativo = document.activeElement;

        if (event.shiftKey && ativo === primeiro) {
            event.preventDefault();
            ultimo.focus();
            return;
        }

        if (!event.shiftKey && ativo === ultimo) {
            event.preventDefault();
            primeiro.focus();
        }
    }

    fecharModalPix?.addEventListener('click', () => fecharModalPixHandler({ cancelarEnvio: true }));
    botaoCopiarPix?.addEventListener('click', copiarChavePixHandler);
    botaoJaPaguei?.addEventListener('click', confirmarPagamentoHandler);
    modalPix?.addEventListener('click', (event) => {
        if (event.target === modalPix) {
            fecharModalPixHandler({ cancelarEnvio: true });
        }
    });
    document.addEventListener('keydown', tratarTecladoModal);
}

function gerarIdPedido() {
    // Gera ID com data/hora de Brasília + sufixo aleatório para evitar colisões
    const agora = new Date();
    const dataHoraBrasilia = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(agora);

    const partes = Object.fromEntries(
        dataHoraBrasilia
            .filter((parte) => parte.type !== 'literal')
            .map((parte) => [parte.type, parte.value])
    );

    const dataHoraId = `${partes.year}${partes.month}${partes.day}-${partes.hour}${partes.minute}${partes.second}`;
    const sufixoAleatorio = Math.random().toString(36).slice(2, 10).toUpperCase();

    return `PED-${dataHoraId}-${sufixoAleatorio}`;
}

function validarFormulario(form) {
    const camposObrigatorios = form.querySelectorAll('[required]');
    let primeiroCampoInvalido = null;

    for (const campo of camposObrigatorios) {
        const containerOculto = campo.closest('[hidden]');
        const escondido = containerOculto || campo.offsetParent === null;

        if (escondido) {
            limparErroCampo(campo);
            continue;
        }

        limparErroCampo(campo);

        if (!campo.value.trim()) {
            definirErroCampo(campo, obterMensagemObrigatoria(campo));
            if (!primeiroCampoInvalido) {
                primeiroCampoInvalido = campo;
            }
            continue;
        }

        if (campo.id === 'captchaResposta') {
            const esperado = Number(campo.dataset.expected || 0);
            const digitado = Number(campo.value);

            if (digitado !== esperado) {
                definirErroCampo(campo, 'Resposta incorreta. Confira a conta e tente novamente.');
                if (!primeiroCampoInvalido) {
                    primeiroCampoInvalido = campo;
                }
                continue;
            }
        }

        if (campo.id === 'contatoValor' && campo.type === 'email' && !campo.checkValidity()) {
            definirErroCampo(campo, 'Digite um e-mail válido.');
            if (!primeiroCampoInvalido) {
                primeiroCampoInvalido = campo;
            }
            continue;
        }

        campo.removeAttribute('aria-invalid');
    }

    if (primeiroCampoInvalido) {
        primeiroCampoInvalido.focus();
        return false;
    }

    return true;
}

function limparErrosFormulario(form) {
    const campos = form.querySelectorAll('input, textarea, select');
    campos.forEach((campo) => limparErroCampo(campo));
}

function definirErroCampo(campo, mensagem) {
    const elementoErro = obterElementoErro(campo);
    atualizarAriaDescribedByCampo(campo);

    campo.setAttribute('aria-invalid', 'true');

    if (elementoErro) {
        elementoErro.textContent = mensagem;
        elementoErro.removeAttribute('hidden');
    }
}

function limparErroCampo(campo) {
    const elementoErro = obterElementoErro(campo);
    campo.removeAttribute('aria-invalid');
    atualizarAriaDescribedByCampo(campo);

    if (elementoErro) {
        elementoErro.textContent = '';
        elementoErro.setAttribute('hidden', 'true');
    }
}

function obterElementoErro(campo) {
    if (!campo?.id) return null;
    return document.getElementById(`erro-${campo.id}`);
}

function sincronizarAriaDescribedBy(form) {
    const campos = form.querySelectorAll('input, textarea, select');
    campos.forEach((campo) => atualizarAriaDescribedByCampo(campo));
}

function atualizarAriaDescribedByCampo(campo) {
    if (!campo?.id || typeof campo.getAttribute !== 'function') return;

    const ids = new Set();
    const atributoAtual = campo.getAttribute('aria-describedby') || '';
    const ajudaId = `ajuda-${campo.id}`;
    const erroId = `erro-${campo.id}`;

    atributoAtual
        .split(' ')
        .map((id) => id.trim())
        .filter(Boolean)
        .forEach((id) => ids.add(id));

    if (document.getElementById(ajudaId)) {
        ids.add(ajudaId);
    }

    if (document.getElementById(erroId)) {
        ids.add(erroId);
    }

    if (ids.size) {
        campo.setAttribute('aria-describedby', Array.from(ids).join(' '));
    } else {
        campo.removeAttribute('aria-describedby');
    }
}

function obterMensagemObrigatoria(campo) {
    const mensagens = {
        descricao: 'Descreva a pessoa ou o momento especial.',
        genero: 'Selecione um gênero musical.',
        generoOutro: 'Informe o gênero musical desejado.',
        contatoTipo: 'Escolha como prefere ser contactado.',
        contatoValor: 'Informe seu e-mail ou WhatsApp.',
        captchaResposta: 'Resolva a conta para confirmar que você não é robô.'
    };

    return mensagens[campo.id] || 'Este campo é obrigatório.';
}

function exibirMensagemFormulario(tipo, mensagem) {
    const mensagemFormulario = document.getElementById('form-mensagem');
    if (!mensagemFormulario) return;

    mensagemFormulario.textContent = mensagem;
    mensagemFormulario.className = `mensagem-formulario ${tipo}`;
    mensagemFormulario.removeAttribute('hidden');
}

function limparMensagemFormulario() {
    const mensagemFormulario = document.getElementById('form-mensagem');
    if (!mensagemFormulario) return;

    mensagemFormulario.textContent = '';
    mensagemFormulario.className = 'mensagem-formulario';
    mensagemFormulario.setAttribute('hidden', 'true');
}