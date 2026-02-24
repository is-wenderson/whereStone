const API_URL = 'https://script.google.com/macros/s/AKfycbxfxrea49ztld46WUIiUlzC4xcexcA8tCq9FCBXpusPriTleYCYG1HsO7Kx2Jignl8_Qw/exec';

let dadosInventario = [];

async function fetchSheetsData() {
    try {
        const response = await fetch(API_URL, { redirect: "follow" });
        const data = await response.json();
        
        dadosInventario = data.map(item => ({
            pallet: String(item.pallet_id || item.Pallet || item.pallet || "").trim().toUpperCase(),
            posicao: String(item.posicao || item.Posicao || ""),
            referencia: item.referencia_lote || item.Referencia || item.referencia || "--",
            sample: item.sample_id || item.Sample || item.sample || "--",
            laudo: item.laudo || item.Laudo || "--"
        })).filter(d => d.pallet);

        document.getElementById('conn-status').innerText = "ONLINE";
        document.getElementById('conn-status').style.color = "#10B981";
        
        const totalPallets = [...new Set(dadosInventario.map(d => d.pallet))].length;
        document.getElementById('stat-pallets').innerText = totalPallets;
        
        console.log("Inventário GR7 sincronizado com sucesso.");
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

fetchSheetsData();
