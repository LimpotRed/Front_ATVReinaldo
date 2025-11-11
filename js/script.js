// Pessoa
const apiUrl = 'http://localhost:8080/pessoa';

/* Helpers (aceita múltiplos ids) */
const $ = (id) => document.getElementById(id);
const getEl = (ids) => ids.map($).find(Boolean) || null;
const getVal = (ids) => (getEl(ids)?.value ?? '').trim();
const getChecked = (ids) => !!getEl(ids)?.checked;

function toBool(v) { return v === true || v === 'true' || v === 1 || v === '1'; }

/* ================= LISTAR ================= */
function getPessoa() {
    fetch(apiUrl)
        .then(async r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(data => {
            const ul = getEl(['btnListaPessoas', 'pessoa-list']);
            if (!ul) return;
            ul.innerHTML = '';

            (Array.isArray(data) ? data : []).forEach(pessoa => {
                const li = document.createElement('li');
                li.innerHTML = `
          <div class="pessoa-line"><strong>Nome:</strong> <span>${pessoa.nome ?? '-'}</span></div>
          <div class="pessoa-line"><strong>E-mail:</strong> <span>${pessoa.email ?? '-'}</span></div>
          <div class="pessoa-line"><strong>CPF:</strong> <span>${pessoa.cpf ?? '-'}</span></div>
          ${pessoa.departamento !== undefined ? `<div class="pessoa-line"><strong>Departamento:</strong> <span>${pessoa.departamento ?? '-'}</span></div>` : ''}
          ${pessoa.cargo !== undefined ? `<div class="pessoa-line"><strong>Cargo:</strong> <span>${pessoa.cargo ?? '-'}</span></div>` : ''}
          <div class="pessoa-line"><strong>Ativo:</strong> <span>${toBool(pessoa.ativo) ? 'Sim' : 'Não'}</span></div>
          <div class="pessoa-actions">
            <select onchange="handleSelectAction(event, ${pessoa.id})">
              <option value="">Ação</option>
              <option value="editar">Editar</option>
              <option value="excluir">Excluir</option>
            </select>
          </div>
        `;
                ul.appendChild(li);
            });

            if (!ul.children.length) ul.innerHTML = '<li>Nenhuma pessoa cadastrada.</li>';
        })
        .catch(err => {
            console.error('Erro ao buscar pessoas:', err);
            const ul = getEl(['btnListaPessoas', 'pessoa-list']);
            if (ul) ul.innerHTML = '<li>Não foi possível carregar as pessoas.</li>';
        });
}

/* ============ CRIAR / ATUALIZAR ============ */
async function createPessoa(event) {
    event.preventDefault();

    const pessoaId = getVal(['btnIdPessoa', 'pessoa-id']);
    const payload = {
        nome: getVal(['btnCampoNome', 'nome']),
        cpf: getVal(['btnCampoCpf', 'cpf']),
        email: getVal(['btnCampoEmail', 'email']),
        departamento: getVal(['btnCampoDepartamento', 'departamento']),
        cargo: getVal(['btnCampoCargo', 'cargo']),
        ativo: getChecked(['btnToggleAtivo', 'ativo'])
    };

    const isEdit = !!pessoaId;
    const url = apiUrl;
    const method = isEdit ? 'PUT' : 'POST';
    const body = JSON.stringify(isEdit ? { ...payload, id: Number(pessoaId) } : payload);

    try {
        const resp = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => '');
            console.error('Resposta do servidor:', resp.status, txt);
            throw new Error(`HTTP ${resp.status}`);
        }

        const form = getEl(['pessoa-form']); // seu formulário manteve este id
        if (form) {
            form.reset();
            const btn = form.querySelector('button[type="submit"]');
            if (btn) btn.textContent = 'Cadastrar';
        }
        const ativoEl = getEl(['btnToggleAtivo', 'ativo']); if (ativoEl) ativoEl.checked = false;
        const idEl = getEl(['btnIdPessoa', 'pessoa-id']); if (idEl) idEl.value = '';

        getPessoa();
    } catch (err) {
        console.error('Erro ao salvar/atualizar pessoa:', err);
        alert('Não foi possível salvar a pessoa. Veja o console para detalhes.');
    }
}

/* ============== EDITAR / EXCLUIR ============== */
function handleSelectAction(event, pessoaId) {
    const action = event.target.value;

    if (action === 'editar') {
        fetch(apiUrl).then(r => r.json()).then(list => {
            const p = (Array.isArray(list) ? list : []).find(x => String(x.id) === String(pessoaId));
            if (!p) return alert('Pessoa não encontrada!');

            (getEl(['btnIdPessoa', 'pessoa-id']) || {}).value = p.id ?? '';
            (getEl(['btnCampoNome', 'nome']) || {}).value = p.nome ?? '';
            (getEl(['btnCampoCpf', 'cpf']) || {}).value = p.cpf ?? '';
            (getEl(['btnCampoEmail', 'email']) || {}).value = p.email ?? '';
            (getEl(['btnCampoDepartamento', 'departamento']) || {}).value = p.departamento ?? '';
            (getEl(['btnCampoCargo', 'cargo']) || {}).value = p.cargo ?? '';
            const ativoEl = getEl(['btnToggleAtivo', 'ativo']); if (ativoEl) ativoEl.checked = toBool(p.ativo);

            const form = getEl(['pessoa-form']);
            const btn = form?.querySelector('button[type="submit"]');
            if (btn) btn.textContent = 'Salvar Edição';
        }).finally(() => { event.target.value = ''; });
    }

    if (action === 'excluir') {
        const popup = $('popup'); if (!popup) return;
        popup.style.display = 'flex';
        const confirm = $('confirm-delete') || $('btnConfirmarExclusao');
        const cancel = $('cancel-delete') || $('btnCancelarExclusao');

        if (confirm) confirm.onclick = () => { deletePessoa(pessoaId); popup.style.display = 'none'; event.target.value = ''; };
        if (cancel) cancel.onclick = () => { popup.style.display = 'none'; };
    }
}

function deletePessoa(id) {
    fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            getPessoa();
        })
        .catch(err => {
            console.error('Erro ao excluir pessoa:', err);
            alert('Não foi possível excluir a pessoa.');
        });
}

/* Bootstrap */
window.onload = getPessoa;
(getEl(['pessoa-form']) || {}).addEventListener?.('submit', createPessoa);
