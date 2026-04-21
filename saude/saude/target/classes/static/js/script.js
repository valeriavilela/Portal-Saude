/* ============================================================
   Sistema de Agendamento UBS — Santa Maria DF
   js/app.js
   ============================================================ */

/* ── DADOS DAS UBS ── */
const ubsData = [];

/* ── HORÁRIOS DISPONÍVEIS ── */
const ALL_TIMES   = ['07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','14:00','14:30','15:00','15:30','16:00','16:30'];
const TAKEN_IDX   = [1, 4, 7, 10];   // índices de horários indisponíveis (simulado)

/* ── NOMES DOS MESES ── */
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

/* ── ESTADO GLOBAL ── */
const state = { ubs: null, date: null, time: null };
let calDate = new Date();
calDate.setDate(1);

/* ============================================================
   NAVEGAÇÃO ENTRE PÁGINAS
   ============================================================ */
function showPage(id, navEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');

  const labels = {
    home:       'Início',
    agendar:    'Fazer Agendamento',
    meus:       'Meus Agendamentos',
    'ubs-info': 'Postos de Saúde',
  };

  document.getElementById('breadcrumb').innerHTML =
    `<span onclick="showPage('home',null)">Início</span>` +
    `<span class="sep"> › </span>` +
    `<span class="current">${labels[id]}</span>`;

  if (id === 'agendar') renderCal();
}

/* ============================================================
   ETAPA 1 — SELEÇÃO DA UBS
   ============================================================ */
function selectUBS(el, name) {
  document.querySelectorAll('.ubs-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  state.ubs = name;
  document.getElementById('btnStep1').disabled = false;
}

/* ============================================================
   NAVEGAÇÃO ENTRE ETAPAS
   ============================================================ */
function goStep(n) {
  // Preenche resumo na etapa 4
  if (n === 4) {
    document.getElementById('sum_ubs').textContent    = state.ubs   || '—';
    document.getElementById('sum_data').textContent   = state.date  || '—';
    document.getElementById('sum_hora').textContent   = state.time  || '—';
    document.getElementById('sum_nome').textContent   = document.getElementById('f_nome').value   || '—';
    document.getElementById('sum_cpf').textContent    = document.getElementById('f_cpf').value    || '—';
    document.getElementById('sum_email').textContent  = document.getElementById('f_email').value  || '—';
    document.getElementById('sum_motivo').textContent = document.getElementById('f_motivo').value || '—';
  }

  // Mostra/esconde etapas
  ['etapa1','etapa2','etapa3','etapa4','etapaSucesso'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.display = (i === n - 1) ? 'block' : 'none';
  });

  // Atualiza indicadores de passo
  for (let i = 1; i <= 4; i++) {
    const s = document.getElementById('step' + i);
    if (!s) continue;
    s.classList.remove('active', 'done');
    if (i === n)      s.classList.add('active');
    else if (i < n)   s.classList.add('done');
  }
}

/* ============================================================
   ETAPA 2 — CALENDÁRIO
   ============================================================ */
function renderCal() {
  document.getElementById('calMonthLabel').textContent =
    `${MONTHS[calDate.getMonth()]} ${calDate.getFullYear()}`;

  const grid = document.getElementById('calDays');
  grid.innerHTML = '';

  const firstDay  = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();
  const totalDays = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
  const today     = new Date();

  // Células vazias antes do dia 1
  for (let i = 0; i < firstDay; i++) {
    grid.innerHTML += `<div class="cal-day empty"></div>`;
  }

  // Dias do mês
  for (let day = 1; day <= totalDays; day++) {
    const dt        = new Date(calDate.getFullYear(), calDate.getMonth(), day);
    const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
    const isPast    = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const isToday   = dt.toDateString() === today.toDateString();

    let cls = 'cal-day';
    if (isWeekend || isPast) cls += ' disabled';
    if (isToday)             cls += ' today';

    const dd    = String(day).padStart(2, '0');
    const mm    = String(calDate.getMonth() + 1).padStart(2, '0');
    const label = `${dd}/${mm}/${calDate.getFullYear()}`;
    const click = (!isWeekend && !isPast) ? `selectDate(this,'${label}')` : '';

    grid.innerHTML += `<div class="${cls}" onclick="${click}">${day}</div>`;
  }
}

function changeMonth(dir) {
  calDate.setMonth(calDate.getMonth() + dir);
  renderCal();
}

function selectDate(el, label) {
  document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');

  state.date = label;
  state.time = null;
  document.getElementById('btnStep2').disabled = true;
  document.getElementById('selectedDateLabel').textContent = label;

  // Renderiza horários
  const slot = document.getElementById('timeSlots');
  slot.innerHTML = '';
  ALL_TIMES.forEach((t, i) => {
    const isTaken = TAKEN_IDX.includes(i);
    const click   = !isTaken ? `selectTime(this,'${t}')` : '';
    slot.innerHTML += `<div class="time-slot${isTaken ? ' taken' : ''}" onclick="${click}">${t}</div>`;
  });

  document.getElementById('timeCard').style.display = 'block';
}

function selectTime(el, t) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  state.time = t;
  document.getElementById('btnStep2').disabled = false;
}

/* ============================================================
   ETAPA 4 — CONFIRMAÇÃO
   ============================================================ */
function confirmarAgendamento() {
  const yr   = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  const code = `AGD-${yr}-${rand}`;

  document.getElementById('codigoProtocolo').textContent = code;

  ['etapa1','etapa2','etapa3','etapa4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  document.getElementById('etapaSucesso').style.display = 'block';
  document.querySelectorAll('.step-item').forEach(s => {
    s.classList.remove('active');
    s.classList.add('done');
  });
}

/* ============================================================
   RESETAR AGENDAMENTO
   ============================================================ */
function novoAgendamento() {
  state.ubs  = null;
  state.date = null;
  state.time = null;

  document.querySelectorAll('.ubs-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('btnStep1').disabled = true;
  document.getElementById('etapaSucesso').style.display = 'none';
  goStep(1);
}

/* ============================================================
   MÁSCARA DE CPF
   ============================================================ */
function maskCPF(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 11);
  if      (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  else if (v.length > 3) v = v.replace(/^(\d{3})(\d+)/, '$1.$2');
  el.value = v;
}

/* ============================================================
   RENDERIZAR LISTA DE UBS (página Postos de Saúde)
   ============================================================ */
function renderUBSList() {
  const container = document.getElementById('ubs-info-list');
  if (!container) return;

  if (ubsData.length === 0) {
    container.innerHTML = '<div class="notice" style="grid-column: 1/-1;"><span>Nenhuma UBS cadastrada no momento. Entre em contato com a administração.</span></div>';
    return;
  }

  ubsData.forEach((u, i) => {
    const badgeClass = u.vagas === 'Vagas disponíveis' ? 'badge-green' : 'badge-yellow';
    container.innerHTML += `
      <div class="ubs-info-row">
        <div class="ubs-num">${i + 1}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:4px;">${u.name}</div>
          <div style="font-size:13px;color:var(--text-muted);line-height:1.7;">
            ${u.addr}<br>
            ${u.tel}<br>
            ${u.hrs}
          </div>
          <span class="ubs-badge ${badgeClass}" style="margin-top:6px;">${u.vagas}</span>
        </div>
      </div>`;
  });
}

/* ============================================================
   RENDERIZAR CARDS DE UBS (página Agendar)
   ============================================================ */
function renderUBSCards() {
  const container = document.getElementById('ubsCardContainer');
  if (!container) return;

  if (ubsData.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; padding: 32px; text-align: center; color: var(--text-muted);">Nenhuma UBS disponível para agendamento.</div>';
    return;
  }

  ubsData.forEach((u) => {
    const badgeClass = u.vagas === 'Vagas disponíveis' ? 'badge-green' : 'badge-yellow';
    container.innerHTML += `
      <div class="ubs-card" onclick="selectUBS(this, '${u.name}')">
        <div class="ubs-name">${u.name}</div>
        <div class="ubs-addr">${u.addr}<br>Tel.: ${u.tel}</div>
        <span class="ubs-badge ${badgeClass}">⬤ ${u.vagas}</span>
      </div>`;
  });
}

/* ============================================================
   RENDERIZAR AGENDAMENTOS (página Meus Agendamentos)
   ============================================================ */
function renderMyAgendamentos() {
  const container = document.getElementById('myAgendContainer');
  if (!container) return;

  // Recupera agendamentos do localStorage (quando implementado)
  const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || [];

  if (agendamentos.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--text-muted);font-size:14px;">
        Nenhum agendamento encontrado. Comece agendando uma consulta!
      </div>`;
    return;
  }

  container.innerHTML = '';
  agendamentos.forEach((a) => {
    const dt = new Date(a.data);
    const day = String(dt.getDate()).padStart(2, '0');
    const month = a.data.split('/')[1];
    const monthName = MONTHS[parseInt(month) - 1].slice(0, 3).toUpperCase();
    
    let statusClass = 'status-confirmed';
    let statusText = 'Confirmado';
    if (a.status === 'realizado') {
      statusClass = 'status-done';
      statusText = 'Realizado';
    } else if (a.status === 'cancelado') {
      statusClass = 'status-cancelled';
      statusText = 'Cancelado';
    }

    container.innerHTML += `
      <div class="myagend-item">
        <div class="myagend-date">
          <div class="day">${day}</div>
          <div class="month">${monthName}</div>
        </div>
        <div class="myagend-info">
          <h4>${a.ubs || 'UBS'}</h4>
          <p>${a.motivo || 'Agendamento'}<br>Horário: ${a.hora || '--'} · Protocolo: ${a.protocolo || '--'}</p>
        </div>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>`;
  });

  container.innerHTML += `
    <div style="text-align:center;padding:16px;color:var(--text-muted);font-size:13px;">
      Para cancelar um agendamento ativo, clique sobre ele e selecione "Cancelar agendamento".
    </div>`;
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  renderUBSList();
  renderUBSCards();
  renderMyAgendamentos();
  renderCal();
});
