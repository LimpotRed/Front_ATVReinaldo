// Endpoints do backend
const apiPat = 'http://localhost:8080/patrimonio';
const apiMov = 'http://localhost:8080/movimentacao';
const apiBx = 'http://localhost:8080/baixa';

/* ===== Utils ===== */
function safeJson(r) { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
function toStr(v) { return (v === null || v === undefined || v === '') ? '-' : String(v); }
function toMoney(v) { if (v === null || v === undefined || v === '') return '-'; const n = Number(v); return isNaN(n) ? toStr(v) : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function dateToInput(v) { if (!v) return ''; return String(v).slice(0, 10); }

/* ==============================
   LISTA PATRIMÔNIOS (já existia)
   ============================== */
function getPatrimonio() {
  fetch(apiPat).then(safeJson).then(data => {
    const ul = document.getElementById('patrimonio-list');
    if (!ul) return;
    ul.innerHTML = '';

    (Array.isArray(data) ? data : []).forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="patrimonio-line"><strong>Descrição:</strong> <span>${toStr(p.descricao)}</span></div>
        <div class="patrimonio-line"><strong>QR Code:</strong> <span>${toStr(p.qrCode)}</span></div>
        <div class="patrimonio-line"><strong>Tag:</strong> <span>${toStr(p.tag)}</span></div>
        <div class="patrimonio-line"><strong>Status:</strong> <span>${toStr(p.status)}</span></div>
        <div class="patrimonio-line"><strong>Data de Aquisição:</strong> <span>${toStr(p.dataAquisicao)}</span></div>
        <div class="patrimonio-line"><strong>Custo:</strong> <span>${toMoney(p.custo)}</span></div>
        <div class="patrimonio-line"><strong>Categoria ID:</strong> <span>${toStr(p.categoriaId)}</span></div>
        <div class="patrimonio-line"><strong>Localização ID:</strong> <span>${toStr(p.localizacaoId)}</span></div>
        <div class="patrimonio-line"><strong>Responsável ID:</strong> <span>${toStr(p.pessoaResponsavelId)}</span></div>
      `;
      ul.appendChild(li);
    });

    if (!ul.children.length) {
      ul.innerHTML = '<li>Nenhum patrimônio cadastrado.</li>';
    }
  }).catch(err => {
    console.error('Erro ao listar patrimônios:', err);
    const ul = document.getElementById('patrimonio-list');
    if (ul) ul.innerHTML = '<li>Não foi possível carregar os patrimônios.</li>';
  });
}

/* ==============================
   LISTA MOVIMENTAÇÕES
   ============================== */
function getMovimentacoes() {
  fetch(apiMov).then(safeJson).then(data => {
    const ul = document.getElementById('movimentacao-list');
    if (!ul) return;
    ul.innerHTML = '';

    (Array.isArray(data) ? data : []).forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="mov-line"><strong>ID:</strong> <span>${toStr(m.id)}</span></div>
        <div class="mov-line"><strong>Patrimônio ID:</strong> <span>${toStr(m.patrimonioId)}</span></div>
        <div class="mov-line"><strong>Origem (ID):</strong> <span>${toStr(m.origemLocalizacaoId)}</span></div>
        <div class="mov-line"><strong>Destino (ID):</strong> <span>${toStr(m.destinoLocalizacaoId)}</span></div>
        <div class="mov-line"><strong>Data:</strong> <span>${toStr(m.dataMovimentacao || m.data)}</span></div>
        <div class="mov-line"><strong>Observação:</strong> <span>${toStr(m.observacao || m.obs)}</span></div>
      `;
      ul.appendChild(li);
    });

    if (!ul.children.length) {
      ul.innerHTML = '<li>Nenhuma movimentação registrada.</li>';
    }
  }).catch(err => {
    console.error('Erro ao listar movimentações:', err);
    const ul = document.getElementById('movimentacao-list');
    if (ul) ul.innerHTML = '<li>Não foi possível carregar as movimentações.</li>';
  });
}

/* ==============================
   LISTA BAIXAS
   ============================== */
function getBaixas() {
  fetch(apiBx).then(safeJson).then(data => {
    const ul = document.getElementById('baixa-list');
    if (!ul) return;
    ul.innerHTML = '';

    (Array.isArray(data) ? data : []).forEach(b => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="baixa-line"><strong>ID:</strong> <span>${toStr(b.id)}</span></div>
        <div class="baixa-line"><strong>Patrimônio ID:</strong> <span>${toStr(b.patrimonioId)}</span></div>
        <div class="baixa-line"><strong>Data:</strong> <span>${toStr(b.dataBaixa || b.data)}</span></div>
        <div class="baixa-line"><strong>Motivo:</strong> <span>${toStr(b.motivo)}</span></div>
        <div class="baixa-line"><strong>Observação:</strong> <span>${toStr(b.observacao || b.obs)}</span></div>
        <div class="baixa-line"><strong>Valor Recuperado:</strong> <span>${toMoney(b.valorRecuperado)}</span></div>
      `;
      ul.appendChild(li);
    });

    if (!ul.children.length) {
      ul.innerHTML = '<li>Nenhuma baixa registrada.</li>';
    }
  }).catch(err => {
    console.error('Erro ao listar baixas:', err);
    const ul = document.getElementById('baixa-list');
    if (ul) ul.innerHTML = '<li>Não foi possível carregar as baixas.</li>';
  });
}

/* ==============================
   SUBMIT dos formulários (se você já tiver endpoints de POST)
   ============================== */
async function submitMovimentacao(e) {
  e.preventDefault();

  const payload = {
    patrimonioId: Number(document.getElementById('mov-patrimonioId')?.value || 0),
    origemLocalizacaoId: Number(document.getElementById('mov-origem')?.value || 0) || null,
    destinoLocalizacaoId: Number(document.getElementById('mov-destino')?.value || 0) || null,
    dataMovimentacao: document.getElementById('mov-data')?.value || null,
    observacao: document.getElementById('mov-obs')?.value?.trim() || null
  };

  try {
    const r = await fetch(apiMov, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    e.target.reset();
    getMovimentacoes();
  } catch (err) {
    console.error('Erro ao registrar movimentação:', err);
    alert('Não foi possível registrar a movimentação.');
  }
}

async function submitBaixa(e) {
  e.preventDefault();

  const payload = {
    patrimonioId: Number(document.getElementById('bx-patrimonioId')?.value || 0),
    dataBaixa: document.getElementById('bx-data')?.value || null,
    motivo: document.getElementById('bx-motivo')?.value?.trim() || null,
    observacao: document.getElementById('bx-obs')?.value?.trim() || null,
    valorRecuperado: (() => { const v = document.getElementById('bx-valor')?.value; return v === '' ? null : Number(v); })()
  };

  try {
    const r = await fetch(apiBx, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    e.target.reset();
    getBaixas();
  } catch (err) {
    console.error('Erro ao registrar baixa:', err);
    alert('Não foi possível registrar a baixa.');
  }
}

/* ==============================
   BOOTSTRAP
   ============================== */
window.onload = function () {
  getPatrimonio();
  getMovimentacoes();
  getBaixas();

  const movForm = document.getElementById('movimentacao-form');
  if (movForm) movForm.addEventListener('submit', submitMovimentacao);

  const bxForm = document.getElementById('baixa-form');
  if (bxForm) bxForm.addEventListener('submit', submitBaixa);
};
