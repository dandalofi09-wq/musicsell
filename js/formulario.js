export function initFormulario() {
    const form = document.getElementById('form-pedido');

    if (!form) return;

    const genero = document.getElementById('genero');
    const campoGeneroOutro = document.getElementById('campo-genero-outro');
    const generoOutro = document.getElementById('generoOutro');
    const contatoTipo = document.getElementById('contatoTipo');
    const contatoValor = document.getElementById('contatoValor');
    const contatoValorLabel = document.getElementById('contatoValorLabel');
    const captchaPergunta = document.getElementById('captcha-pergunta');
    const captchaResposta = document.getElementById('captchaResposta');

    gerarCaptcha();
    atualizarCampoGeneroOutro();
    atualizarCampoContato();

    genero?.addEventListener('change', atualizarCampoGeneroOutro);
    contatoTipo?.addEventListener('change', atualizarCampoContato);
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validarFormulario(form)) return;

        const formData = new FormData(form);

        try {
            const response = await fetch('https://formspree.io/f/xkolvkvk', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                alert('Pedido enviado com sucesso!');
                form.reset();
                gerarCaptcha();
                atualizarCampoGeneroOutro();
                atualizarCampoContato();
            } else {
                alert('Não foi possível enviar o pedido. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível enviar o pedido. Tente novamente.');
        }
    });

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
}

function validarFormulario(form) {
    const camposObrigatorios = form.querySelectorAll('[required]');

    for (const campo of camposObrigatorios) {
        const containerOculto = campo.closest('[hidden]');
        const escondido = containerOculto || campo.offsetParent === null;

        if (escondido) continue;

        if (!campo.value.trim()) {
            campo.setAttribute('aria-invalid', 'true');
            campo.focus();
            campo.reportValidity();
            return false;
        }

        if (campo.id === 'captchaResposta') {
            const esperado = Number(campo.dataset.expected || 0);
            const digitado = Number(campo.value);

            if (digitado !== esperado) {
                campo.setAttribute('aria-invalid', 'true');
                campo.focus();
                campo.reportValidity();
                return false;
            }
        }

        campo.setAttribute('aria-invalid', 'false');
    }

    return true;
}