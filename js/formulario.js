export function initFormulario() {
    const form = document.getElementById('form-pedido');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validação simples
        if (!validarFormulario(form)) return;

        const formData = new FormData(form);
        
        // Uso de endpoint público do Formspree (seguro)
        try {
            const response = await fetch('https://formspree.io/f/SEU_ID_AQUI', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) alert('Pedido enviado com sucesso!');
        } catch (error) {
            console.error('Erro:', error);
        }
    });
}