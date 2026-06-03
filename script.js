// --- RELÓGIO DIGITAL EM TEMPO REAL ---
function atualizarRelogio() {
    const elementoRelogio = document.getElementById('liveClock');
    if (elementoRelogio) {
        const agora = new Date();
        const horas = String(agora.getHours()).padStart(2, '0');
        const minutos = String(agora.getMinutes()).padStart(2, '0');
        const segundos = String(agora.getSeconds()).padStart(2, '0');
        elementoRelogio.textContent = `${horas}:${minutos}:${segundos}`;
    }
}
setInterval(atualizarRelogio, 1000);
atualizarRelogio();


// --- NAVEGAÇÃO COMPLETA DO APP ---
const homeScreen = document.getElementById('home-screen');
const sobreScreen = document.getElementById('sobre-screen');
const painelScreen = document.getElementById('painel-screen');
const encerramentoScreen = document.getElementById('encerramento-screen');

const btnSobre = document.getElementById('btnSobre');
const btnVoltar = document.getElementById('btnVoltar');
const btnEntrar = document.getElementById('btnEntrar');

btnSobre.addEventListener('click', () => {
    homeScreen.classList.remove('active');
    sobreScreen.classList.add('active');
});

btnVoltar.addEventListener('click', () => {
    sobreScreen.classList.remove('active');
    homeScreen.classList.add('active');
});

btnEntrar.addEventListener('click', () => {
    homeScreen.classList.remove('active');
    painelScreen.classList.add('active');
});


// --- LÓGICA DO PAINEL DE REGISTROS ---
const tipoJornada = document.getElementById('tipoJornada');
const tipoIntervalo = document.getElementById('tipoIntervalo');
const containerInputs = document.getElementById('input-marcacoes');
const txtHorasExtras = document.getElementById('horasExtras');
const caixaSugestao = document.getElementById('caixaSugestao');

// Gerar campos de input baseado na escolha do intervalo
function renderizarCampos() {
    containerInputs.innerHTML = '';
    const qtd = parseInt(tipoIntervalo.value);
    for (let i = 1; i <= qtd; i++) {
        containerInputs.innerHTML += `<input type="time" class="marcacao-input" placeholder="Marcação ${i}">`;
    }
    vincularEventosCalculo();
    txtHorasExtras.textContent = "00:00"; 
    caixaSugestao.style.display = "none";
}

tipoIntervalo.addEventListener('change', renderizarCampos);
tipoJornada.addEventListener('change', calcularExtras);
renderizarCampos(); 

function vincularEventosCalculo() {
    const inputs = document.querySelectorAll('.marcacao-input');
    inputs.forEach(input => {
        input.addEventListener('input', calcularExtras);
        input.addEventListener('change', calcularExtras);
    });
}

// Converte uma string "HH:MM" em minutos totais
function converteParaMinutos(horarioStr) {
    if (!horarioStr || horarioStr.trim() === "") return null;
    const partes = horarioStr.split(':');
    if (partes.length < 2) return null;
    const horas = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);
    if (isNaN(horas) || isNaN(minutos)) return null;
    return (horas * 60) + minutos;
}

// Converte minutos totais de volta para o formato "HH:MM"
function converteParaString(minutosTotais) {
    const minutosNormalizados = ((minutosTotais % 1440) + 1440) % 1440;
    const horas = Math.floor(minutosNormalizados / 60);
    const minutos = minutosNormalizados % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

// LÓGICA DE CÁLCULO E SUGESTÃO EM CAIXA DE TEXTO PRÓPRIA
function calcularExtras() {
    const inputs = document.querySelectorAll('.marcacao-input');
    const qtdCampos = inputs.length;
    const minutosJornadaAlvo = parseInt(tipoJornada.value, 10) * 60;
    const LIMITE_MAXIMO_EXTRA = 110; // 1h50m em minutos
    
    const pontos = Array.from(inputs).map(input => converteParaMinutos(input.value));
    
    let minutosTrabalhados = 0;
    let preencheuTudo = !pontos.includes(null);

    // --- CÁLCULO DAS HORAS TRABALHADAS POR BLOCOS (SUPORTE MEIA-NOITE) ---
    if (qtdCampos === 4) {
        if (pontos[0] !== null && pontos[1] !== null) {
            let t1 = pontos[1] - pontos[0];
            if (t1 < 0) t1 += 1440; 
            minutosTrabalhados += t1;
        }
        if (pontos[2] !== null && pontos[3] !== null) {
            let t2 = pontos[3] - pontos[2];
            if (t2 < 0) t2 += 1440; 
            minutosTrabalhados += t2;
        }
    } else if (qtdCampos === 6) {
        if (pontos[0] !== null && pontos[1] !== null) {
            let t1 = pontos[1] - pontos[0]; if (t1 < 0) t1 += 1440; minutosTrabalhados += t1;
        }
        if (pontos[2] !== null && pontos[3] !== null) {
            let t2 = pontos[3] - pontos[2]; if (t2 < 0) t2 += 1440; minutosTrabalhados += t2;
        }
        if (pontos[4] !== null && pontos[5] !== null) {
            let t3 = pontos[5] - pontos[4]; if (t3 < 0) t3 += 1440; minutosTrabalhados += t3;
        }
    }

    // --- CONTROLE DA CAIXA DE SUGESTÃO DE MARCAÇÃO DE SAÍDA ---
    const penultimoInput = inputs[qtdCampos - 2];

    if (penultimoInput && penultimoInput.value) {
        let minutosTrabalhadosAteAgora = 0;
        let valorPenultimoPonto = pontos[qtdCampos - 2]; 

        if (qtdCampos === 4 && pontos[0] !== null && pontos[1] !== null) {
            let t1 = pontos[1] - pontos[0];
            if (t1 < 0) t1 += 1440;
            minutosTrabalhadosAteAgora = t1;
        } else if (qtdCampos === 6) {
            let t1 = 0, t2 = 0;
            if (pontos[0] !== null && pontos[1] !== null) { t1 = pontos[1] - pontos[0]; if (t1 < 0) t1 += 1440; }
            if (pontos[2] !== null && pontos[3] !== null) { t2 = pontos[3] - pontos[2]; if (t2 < 0) t2 += 1440; }
            minutosTrabalhadosAteAgora = t1 + t2; 
        }

        const tempoMaximoDisponivel = (minutosJornadaAlvo + LIMITE_MAXIMO_EXTRA) - minutosTrabalhadosAteAgora;
        const minutoSugeridoSaida = valorPenultimoPonto + tempoMaximoDisponivel;
        
        caixaSugestao.innerHTML = `Sugestão de saída limite (Máx +1h50): <strong style="color: #ffffff;">${converteParaString(minutoSugeridoSaida)}</strong>`;
        caixaSugestao.style.display = "block";
    } else {
        caixaSugestao.style.display = "none";
    }

    // --- EXIBIÇÃO DO RESULTADO FINAL DE HORAS EXTRAS ---
    if (!preencheuTudo || minutosTrabalhados <= 0) {
        txtHorasExtras.textContent = "00:00";
        return;
    }

    let minutosDeExtra = minutosTrabalhados - minutosJornadaAlvo;

    if (minutosDeExtra > 0) {
        if (minutosDeExtra > LIMITE_MAXIMO_EXTRA) {
            alert("Atenção: O limite de 1 hora e 50 minutos de horas extras diárias foi excedido! Ajuste as suas marcações.");
            minutosDeExtra = LIMITE_MAXIMO_EXTRA; 
        }
        txtHorasExtras.textContent = converteParaString(minutosDeExtra);
    } else {
        txtHorasExtras.textContent = "00:00";
    }
}

// Botão de Limpar Marcações
document.getElementById('btnLimpar').addEventListener('click', () => {
    renderizarCampos();
});

// --- SALVAR E EXIBIR TELA DE ENCERRAMENTO (FORÇANDO FECHAMENTO OU REDIRECIONAMENTO) ---
document.getElementById('btnSalvarFechar').addEventListener('click', () => {
    const dadosParaSalvar = {
        jornada: tipoJornada.value,
        intervalo: tipoIntervalo.value,
        horasExtras: txtHorasExtras.textContent
    };
    
    // Salva os dados no dispositivo
    localStorage.setItem('pontoCerto_dados', JSON.stringify(dadosParaSalvar));
    
    // Transição de telas: oculta o painel e ativa a animação de encerramento
    painelScreen.classList.remove('active');
    encerramentoScreen.classList.add('active');
    
    // Aguarda 2.5 segundos com o spinner rodando na tela estilizada antes de sair
    setTimeout(() => {
        // Truque 1: Tenta fechar a aba se tiver permissão (Funciona se abrir pelo ícone da tela inicial)
        window.close();
        
        // Truque 2: Abre uma página em branco sobre si mesma e fecha (Força o fechamento em alguns navegadores)
        window.open('about:blank', '_self').close();
        
        // Truque 3: Se o navegador ainda assim bloquear o fechamento da aba, 
        // ele vai "minimizar" o app expulsando o usuário para o Google.
        window.location.href = "https://www.google.com";
    }, 2500);
});
        
