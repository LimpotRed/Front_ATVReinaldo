const apiPat = 'http://localhost:8080/patrimonio';

const $ = (id) => document.getElementById(id);
const getEl = (ids) => ids.map($).find(Boolean) || null;
const getVal = (ids) => (getEl(ids)?.value ?? '').trim();

function safeJson(r) { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
function toStr(v) { return (v === null || v === undefined || v === '') ? '-' : String(v); }
function toMoney(v) { if (v === '' || v == null) return '-'; const n = Number(v); return isNaN(n) ? toStr(v) : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function dateToInput(v) { return v ? String(v).slice(0, 10) : ''; }

function getPatrimonio() {
  fetch(apiPat).then(safeJson).then(list => {
    const ul = getEl(['btnListaPatrimonios', 'patrimonio-list']);
    if (!ul) return;
    ul.innerHTML = '';
    (Array.isArray(list) ? list : []).forEach(p => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="patr-line"><strong>Descrição:</strong> <span>${toStr(p.descricao)}</span></div>
        <div class="patr-line"><strong>QR Code:</strong> <span>${toStr(p.qrCode)}</span></div>
        <div class="patr-line"><strong>Tag:</strong> <span>${toStr(p.tag)}</span></div>
        <div class="patr-line"><strong>Status:</strong> <span>${toStr(p.status)}</span></div>
        <div class="patr-line"><strong>Data Aquisição:</strong> <span>${toStr(p.dataAquisicao)}</span></div>
        <div class="patr-line"><strong>Custo:</strong> <span>${toMoney(p.custo)}</span></div>
        <div class="patr-line"><strong>Categoria ID:</strong> <span>${toStr(p.categoriaId)}</span></div>
        <div class="patr-line"><strong>Localização ID:</strong> <span>${toStr(p.localizacaoId)}</span></div>
        <div class="patr-line"><strong>Responsável ID:</strong> <span>${toStr(p.pessoaResponsavelId)}</span></div>
        <div class="patr-actions">
          <select onchange="handleSelectActionPatrimonio(event, ${p.id})">
            <option value="">Ação</option>
            <option value="editar">Editar</option>
            <option value="excluir">Excluir</option>
          </select>
        </div>`;
      ul.appendChild(li);
    });
    if (!ul.children.length) ul.innerHTML = '<li>Nenhum patrimônio cadastrado.</li>';
  }).catch(err => {
    console.error('Erro ao listar patrimônios:', err);
    const ul = getEl(['btnListaPatrimonios', 'patrimonio-list']);
    if (ul) ul.innerHTML = '<li>Não foi possível carregar os patrimônios.</li>';
  });
}

async function createOrUpdatePatrimonio(e) {
  e.preventDefault();

  const id = getVal(['btnIdPatrimonio', 'patrimonio-id']);

  const payload = {
    descricao: getVal(['btnCampoDescricaoPatrimonio', 'descricao']),
    qrCode: getVal(['btnCampoQrCodePatrimonio', 'qrCode']),
    tag: getVal(['btnCampoTagPatrimonio', 'tag']),
    status: getVal(['btnCampoStatusPatrimonio', 'status']),
    dataAquisicao: getVal(['btnCampoDataAquisicaoPatrimonio', 'dataAquisicao']),
    custo: (() => {
      const v = getVal(['btnCampoCustoPatrimonio', 'custo']);
      return v === '' ? null : Number(v);
    })(),
    categoriaId: (() => {
      const v = getVal(['btnCampoCategoriaIdPatrimonio', 'categoriaId']);
      return v === '' ? null : Number(v);
    })(),
    localizacaoId: (() => {
      const v = getVal(['btnCampoLocalizacaoIdPatrimonio', 'localizacaoId']);
      return v === '' ? null : Number(v);
    })(),
    pessoaResponsavelId: (() => {
      const v = getVal(['btnCampoPessoaResponsavelIdPatrimonio', 'pessoaResponsavelId']);
      return v === '' ? null : Number(v);
    })()
  };

  const isEdit = !!id;
  const resp = await fetch(apiPat, {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(isEdit ? { ...payload, id: Number(id) } : payload)
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    console.error('Resposta do servidor:', resp.status, txt);
    alert('Não foi possível salvar o patrimônio.');
    return;
  }

  const form = getEl(['btnFormPatrimonio', 'patrimonio-form']);
  form?.reset();
  (getEl(['btnIdPatrimonio', 'patrimonio-id']) || {}).value = '';
  const btn = form?.querySelector('button[type="submit"]'); if (btn) btn.textContent = 'Cadastrar';
  getPatrimonio();
}

function handleSelectActionPatrimonio(ev, id) {
  const action = ev.target.value;
  if (action === 'editar') {
    fetch(apiPat).then(r => r.json()).then(list => {
      const p = list.find(x => String(x.id) === String(id));
      if (!p) return alert('Patrimônio não encontrado');
      (getEl(['btnIdPatrimonio', 'patrimonio-id']) || {}).value = p.id ?? '';
      (getEl(['btnCampoDescricaoPatrimonio', 'descricao']) || {}).value = p.descricao ?? '';
      (getEl(['btnCampoQrCodePatrimonio', 'qrCode']) || {}).value = p.qrCode ?? '';
      (getEl(['btnCampoTagPatrimonio', 'tag']) || {}).value = p.tag ?? '';
      (getEl(['btnCampoStatusPatrimonio', 'status']) || {}).value = p.status ?? '';
      (getEl(['btnCampoDataAquisicaoPatrimonio', 'dataAquisicao']) || {}).value = dateToInput(p.dataAquisicao);
      (getEl(['btnCampoCustoPatrimonio', 'custo']) || {}).value = p.custo ?? '';
      (getEl(['btnCampoCategoriaIdPatrimonio', 'categoriaId']) || {}).value = p.categoriaId ?? '';
      (getEl(['btnCampoLocalizacaoIdPatrimonio', 'localizacaoId']) || {}).value = p.localizacaoId ?? '';
      (getEl(['btnCampoPessoaResponsavelIdPatrimonio', 'pessoaResponsavelId']) || {}).value = p.pessoaResponsavelId ?? '';
      const form = getEl(['btnFormPatrimonio', 'patrimonio-form']);
      const btn = form?.querySelector('button[type="submit"]'); if (btn) btn.textContent = 'Salvar Edição';
    }).finally(() => { ev.target.value = ''; });
  }
  if (action === 'excluir') {
    const popup = $('popup'); popup.style.display = 'flex';
    const ok = $('btnConfirmarExclusao') || $('confirm-delete');
    const cancel = $('btnCancelarExclusao') || $('cancel-delete');
    ok.onclick = () => { deletePatrimonio(id); popup.style.display = 'none'; ev.target.value = ''; };
    cancel.onclick = () => popup.style.display = 'none';
  }
}

function deletePatrimonio(id) {
  fetch(`${apiPat}/${id}`, { method: 'DELETE' })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); getPatrimonio(); })
    .catch(err => { console.error('Erro ao excluir patrimônio:', err); alert('Não foi possível excluir.'); });
}

window.onload = getPatrimonio;
(getEl(['btnFormPatrimonio', 'patrimonio-form']) || {}).addEventListener?.('submit', createOrUpdatePatrimonio);
