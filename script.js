const API_URL = 'https://script.google.com/macros/s/AKfycbxfxrea49ztld46WUIiUlzC4xcexcA8tCq9FCBXpusPriTleYCYG1HsO7Kx2Jignl8_Qw/exec';

let dadosInventario = [];

async function fetchSheetsData() {
    try {
        const response = await fetch(API_URL, { redirect: "follow" });
        const data = await response.json();
        
        // Mapeamento corrigido com os nomes exatos do cabeçalho da sua planilha
        dadosInventario = data.map(item => ({
            pallet: String(item['Pallet ID'] || "").trim().toUpperCase(),
            posicao: String(item['Posição'] || ""),
            referencia: item['Referência/Lote'] || "--",
            sample: item['Sample_ID'] || "--",
            laudo: item['Laudo'] || "--"
        })).filter(d => d.pallet !== "");

        document.getElementById('conn-status').innerText = "ONLINE";
        document.getElementById('conn-status').style.color = "#10B981";
        
        // Atualiza a contagem de Pallets
        const totalPallets = [...new Set(dadosInventario.map(d => d.pallet))].length;
        document.getElementById('stat-pallets').innerText = totalPallets;
        
        console.log("Inventário GR7 sincronizado com sucesso:", dadosInventario);
    } catch (err) {
        console.error("Erro de CORS ou Conexão:", err);
        document.getElementById('conn-status').innerText = "ERRO DE CONEXÃO";
        document.getElementById('conn-status').style.color = "#EF4444";
    }
}

function abrirModal(idPallet) {
    const modal = document.getElementById('meuModal');
    document.getElementById('modal-titulo').innerText = "Identificação: " + idPallet;
    document.getElementById('info-box').style.display = "none";

    const casas = document.querySelectorAll('.posicao-saco');
    casas.forEach(c => c.classList.remove('ocupado', 'selecionado'));

    const itens = dadosInventario.filter(i => i.pallet === idPallet.toUpperCase());
    
    itens.forEach(item => {
        const divPos = document.querySelector(`.posicao-saco[data-pos="${item.posicao}"]`);
        if (divPos) divPos.classList.add('ocupado');
    });

    modal.style.display = "block";
}

function selecionarPosicao(elemento, numPos) {
    const idPalletAtual = document.getElementById('modal-titulo').innerText.replace("Identificação: ", "").toUpperCase();
    
    document.querySelectorAll('.posicao-saco').forEach(el => el.classList.remove('selecionado'));
    elemento.classList.add('selecionado');

    const dado = dadosInventario.find(i => i.pallet === idPalletAtual && String(i.posicao) === String(numPos));

    const box = document.getElementById('info-box');
    if (dado) {
        document.getElementById('res-laudo').innerText = dado.laudo;
        document.getElementById('res-material').innerText = dado.referencia;
        document.getElementById('res-sample').innerText = dado.sample;
        box.style.display = "block";
    } else {
        box.style.display = "none";
    }
}

function fecharModal() {
    document.getElementById('meuModal').style.display = "none";
}

window.onclick = (e) => {
    if (e.target == document.getElementById('meuModal')) fecharModal();
}
function buscarLote(event) {
    if (event.key === 'Enter') {
        executarBusca();
    }
}

// Executa o filtro na base de dados
function executarBusca() {
    const termo = document.getElementById('input-busca').value.trim().toLowerCase();
    const container = document.getElementById('resultados-busca');
    
    // Limpa os resultados antigos antes de mostrar os novos
    container.innerHTML = '';

    // Se o campo estiver vazio, não faz nada
    if (termo === '') return;

    // Procura o termo digitado em Lote, Sample ou Laudo
    const resultados = dadosInventario.filter(item => 
        (item.referencia && item.referencia.toLowerCase().includes(termo)) ||
        (item.sample && item.sample.toLowerCase().includes(termo)) ||
        (item.laudo && item.laudo.toLowerCase().includes(termo))
    );

    // Se não achar nada, avisa o usuário
    if (resultados.length === 0) {
        container.innerHTML = `
            <div class="resultado-item" style="border-left-color: #EF4444;">
                <div class="resultado-info">
                    <strong style="color: #EF4444;">Nenhuma amostra encontrada</strong>
                    <small>Verifique o termo digitado e tente novamente.</small>
                </div>
            </div>`;
        return;
    }

    // Se achar, cria um "cartão" para cada resultado mostrando onde está
    resultados.forEach(res => {
        const div = document.createElement('div');
        div.className = 'resultado-item';
        div.innerHTML = `
            <div class="resultado-info">
                <strong>REF: ${res.referencia}</strong>
                <small>Laudo: ${res.laudo} | Sample: ${res.sample}</small>
            </div>
            <div class="resultado-loc">
                Pallet ${res.pallet} - Pos ${res.posicao}
            </div>
        `;
        container.appendChild(div);
    });
}
fetchSheetsData();
