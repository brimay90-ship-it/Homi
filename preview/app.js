// Homi — Interactive Preview
// All app logic for the web-based iPad preview

// ========== DATA ==========
const FAMILY = [
    { id:1, name:'Mom', emoji:'👩', color:'#E05B8C', role:'Admin', pin:'1234' },
    { id:2, name:'Dad', emoji:'👨', color:'#4A90D9', role:'Admin', pin:'5678' },
    { id:3, name:'Emma', emoji:'👧', color:'#5AAB61', role:'Standard', pin:'1111' },
    { id:4, name:'Jake', emoji:'👦', color:'#F5A623', role:'Standard', pin:'2222' },
];

const SAMPLE_EVENTS = [
    { title:'Team Meeting', cal:'Work', color:'#4A90D9', day:0, start:9, end:10, location:'Conference Room A', notes:'Quarterly review prep.' },
    { title:'Soccer Practice', cal:'Kids', color:'#5AAB61', day:0, start:16, end:17.5, location:'Highland Park', notes:'Bring extra water.' },
    { title:'Dentist — Emma', cal:'Health', color:'#E05B8C', day:1, start:10, end:11, location:'Smile Dental Care', notes:'Routine cleaning.' },
    { title:'Piano Lesson', cal:'Kids', color:'#9B6BD4', day:1, start:15, end:16, location:'Music Academy', notes:'' },
    { title:'Staff Standup', cal:'Work', color:'#4A90D9', day:1, start:9, end:9.5, location:'', notes:'' },
    { title:'Grocery Run', cal:'Family', color:'#F5A623', day:2, start:11, end:12, location:'Trader Joes', notes:'Check shared list.' },
    { title:'Yoga Class', cal:'Personal', color:'#3BBFA0', day:2, start:7, end:8, location:'Downtown Studio', notes:'' },
    { title:'Book Club', cal:'Personal', color:'#3BBFA0', day:3, start:19, end:21, location:'Sarah\'s House', notes:'Read chapters 4-6.' },
    { title:'Jake Tutoring', cal:'Kids', color:'#F5A623', day:3, start:16, end:17, location:'Library', notes:'' },
    { title:'Sprint Review', cal:'Work', color:'#4A90D9', day:3, start:10, end:11, location:'Zoom', notes:'' },
    { title:'Birthday Party', cal:'Kids', color:'#F5A623', day:4, start:14, end:16, location:'Jump Zone', notes:'Present is wrapped in the closet.' },
    { title:'Date Night', cal:'Family', color:'#E05B8C', day:5, start:19, end:22, location:'Italian Restaurant', notes:'Reservation at 7:15 PM.' },
    { title:'Family Hike', cal:'Family', color:'#5AAB61', day:6, start:8, end:11, location:'State Park', notes:'Pack snacks.' },
    { title:'Farmers Market', cal:'Family', color:'#F5A623', day:6, start:12, end:13, location:'Town Square', notes:'' },
];

const CHORES = [
    { id:1, title:'Make bed', assignee:2, freq:'Daily', done:true },
    { id:2, title:'Pack lunch', assignee:2, freq:'Daily', done:true },
    { id:3, title:'Homework', assignee:2, freq:'Daily', done:false },
    { id:4, title:'Clean room', assignee:3, freq:'Weekly', done:false },
    { id:5, title:'Walk the dog', assignee:3, freq:'Daily', done:true },
    { id:6, title:'Set table', assignee:2, freq:'Daily', done:false },
    { id:7, title:'Take out trash', assignee:3, freq:'Weekly', done:false },
    { id:8, title:'Feed cat', assignee:2, freq:'Daily', done:false },
];

const MEALS = {
    0:{ breakfast:'Pancakes', lunch:'Turkey wrap', dinner:'Pasta night' },
    1:{ breakfast:'Cereal', lunch:'', dinner:'Tacos' },
    2:{ breakfast:'Eggs & toast', lunch:'Salad', dinner:'' },
    3:{ breakfast:'', lunch:'Soup', dinner:'Stir fry' },
    4:{ breakfast:'Waffles', lunch:'', dinner:'Pizza' },
    5:{ breakfast:'', lunch:'Sandwiches', dinner:'Grilled chicken' },
    6:{ breakfast:'French toast', lunch:'Leftovers', dinner:'BBQ' },
};

const GROCERY = [
    { name:'Milk', category:'Dairy', icon:'🥛', done:false, who:0 },
    { name:'Eggs', category:'Dairy', icon:'🥛', done:false, who:0 },
    { name:'Bread', category:'Bakery', icon:'🍞', done:false, who:1 },
    { name:'Apples', category:'Produce', icon:'🥬', done:false, who:2 },
    { name:'Bananas', category:'Produce', icon:'🥬', done:true, who:0 },
    { name:'Chicken breast', category:'Meat', icon:'🥩', done:false, who:0 },
    { name:'Pasta', category:'Pantry', icon:'🏠', done:false, who:1 },
    { name:'Tomato sauce', category:'Pantry', icon:'🏠', done:true, who:0 },
    { name:'Orange juice', category:'Beverages', icon:'🧃', done:false, who:3 },
];

// ========== STATE ==========
let currentUser = null;
let pin = '';
let selectedAvatar = null;
let currentTab = 'calendar';
let calView = 'month';
let calDate = new Date();

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
    renderAvatars();
    buildNumpad();
    updateClocks();
    setInterval(updateClocks, 60000);
    setupTabs();
    setupCalendarControls();
});

// ========== CLOCK ==========
function updateClocks() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
    const shortDate = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });

    const lt = document.getElementById('lockTime');
    const ld = document.getElementById('lockDate');
    const ht = document.getElementById('headerTime');
    const hd = document.getElementById('headerDate');
    if (lt) lt.textContent = timeStr;
    if (ld) ld.textContent = dateStr;
    if (ht) ht.textContent = timeStr;
    if (hd) hd.textContent = shortDate;
}

// ========== LOCK SCREEN ==========
function renderAvatars() {
    const row = document.getElementById('avatarRow');
    row.innerHTML = FAMILY.map(m => `
        <div class="avatar-item" data-id="${m.id}" onclick="selectAvatar(${m.id})">
            <div class="avatar-circle" style="background:${m.color}22">${m.emoji}</div>
            <span class="avatar-name">${m.name}</span>
            ${m.role === 'Admin' ? '<span class="avatar-badge">Admin</span>' : ''}
        </div>
    `).join('');
}

function selectAvatar(id) {
    selectedAvatar = FAMILY.find(m => m.id === id);
    pin = '';
    document.querySelectorAll('.avatar-item').forEach(el => {
        el.classList.toggle('selected', +el.dataset.id === id);
    });
    document.getElementById('pinSection').classList.remove('hidden');
    document.getElementById('pinError').classList.add('hidden');
    updatePinDots();
}

function buildNumpad() {
    const pad = document.getElementById('numpad');
    const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
    pad.innerHTML = keys.map(k => {
        if (k === '') return '<button class="num-btn empty"></button>';
        if (k === '⌫') return `<button class="num-btn del" onclick="pinInput('del')">⌫</button>`;
        return `<button class="num-btn" onclick="pinInput('${k}')">${k}</button>`;
    }).join('');
}

function pinInput(val) {
    if (!selectedAvatar) return;
    document.getElementById('pinError').classList.add('hidden');
    if (val === 'del') {
        pin = pin.slice(0, -1);
    } else if (pin.length < 4) {
        pin += val;
    }
    updatePinDots();
    if (pin.length === 4) {
        setTimeout(verifyPin, 300);
    }
}

function updatePinDots() {
    document.querySelectorAll('.pin-dots .dot').forEach((d, i) => {
        d.classList.toggle('filled', i < pin.length);
    });
}

function verifyPin() {
    if (selectedAvatar && pin === selectedAvatar.pin) {
        currentUser = selectedAvatar;
        showMainApp();
    } else {
        document.getElementById('pinError').classList.remove('hidden');
        document.querySelector('.pin-dots').classList.add('shake');
        setTimeout(() => document.querySelector('.pin-dots').classList.remove('shake'), 400);
        pin = '';
        updatePinDots();
    }
}

// ========== MAIN APP ==========
function showMainApp() {
    document.getElementById('lockScreen').classList.remove('active');
    document.getElementById('mainApp').classList.add('active');

    const hu = document.getElementById('headerUser');
    hu.innerHTML = `
        <div class="header-avatar" style="background:${currentUser.color}22">${currentUser.emoji}</div>
        <div class="header-user-info">
            <span class="header-user-name">${currentUser.name}</span>
            <span class="header-user-role">${currentUser.role}</span>
        </div>
    `;

    renderCalendar();
    renderChores();
    renderMeals();
    renderGrocery();
}

function logout() {
    currentUser = null;
    selectedAvatar = null;
    pin = '';
    document.getElementById('mainApp').classList.remove('active');
    document.getElementById('lockScreen').classList.add('active');
    document.getElementById('pinSection').classList.add('hidden');
    document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
    updatePinDots();
}

// ========== TABS ==========
function setupTabs() {
    document.querySelectorAll('.side-tabs .tab[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.tab === 'settings') return;
            currentTab = tab.dataset.tab;
            document.querySelectorAll('.side-tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('tab-' + currentTab).classList.add('active');
        });
    });
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// ========== CALENDAR ==========
function setupCalendarControls() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            calView = btn.dataset.view;
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCalendar();
        });
    });
    document.getElementById('calPrev').addEventListener('click', () => { navCal(-1); });
    document.getElementById('calNext').addEventListener('click', () => { navCal(1); });
    document.getElementById('btnToday').addEventListener('click', () => { calDate = new Date(); renderCalendar(); });
}

function navCal(dir) {
    if (calView === 'month') calDate.setMonth(calDate.getMonth() + dir);
    else if (calView === 'week') calDate.setDate(calDate.getDate() + dir * 7);
    else calDate.setDate(calDate.getDate() + dir);
    renderCalendar();
}

function renderCalendar() {
    const rangeEl = document.getElementById('calRange');
    const viewEl = document.getElementById('calView');

    if (calView === 'month') {
        rangeEl.textContent = calDate.toLocaleDateString('en-US', { month:'long', year:'numeric' });
        viewEl.innerHTML = renderMonthGrid();
    } else if (calView === 'week') {
        const ws = getWeekStart(calDate);
        const we = new Date(ws); we.setDate(we.getDate() + 6);
        rangeEl.textContent = `${fmtShort(ws)} – ${fmtShort(we)}`;
        viewEl.innerHTML = renderWeekView();
    } else {
        rangeEl.textContent = calDate.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
        viewEl.innerHTML = renderDayView();
    }
}

function renderMonthGrid() {
    const year = calDate.getFullYear(), month = calDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const isLandscape = document.getElementById('ipadFrame').classList.contains('landscape');
    const maxEvents = isLandscape ? 2 : 3;

    let html = '<div class="month-grid">';
    days.forEach(d => { html += `<div class="weekday-header">${d}</div>`; });

    // Previous month padding
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="day-cell other-month"><div class="day-cell-header"><span class="day-num">${prevDays - i}</span></div><div class="day-events"></div></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const date = new Date(year, month, d);
        const dow = date.getDay();
        const dayEvents = SAMPLE_EVENTS.map((e, idx) => ({ ...e, originalIndex: idx })).filter(e => e.day === dow);
        const visible = dayEvents.slice(0, maxEvents);
        const overflow = dayEvents.length - visible.length;

        let pills = visible.map(e =>
            `<div class="event-pill" style="background:${e.color}14" onclick="event.stopPropagation(); showEventDetail(${e.originalIndex})">`
            + `<span class="event-pill-bar" style="background:${e.color}"></span>`
            + `<span class="event-pill-title">${e.title}</span>`
            + `</div>`
        ).join('');

        if (overflow > 0) {
            pills += `<span class="event-overflow">+${overflow} more</span>`;
        }

        html += `<div class="day-cell ${isToday ? 'today' : ''}" onclick="calDate=new Date(${year},${month},${d}); calView='day'; document.querySelectorAll('.view-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='day')); renderCalendar();">`
            + `<div class="day-cell-header"><span class="day-num">${d}</span></div>`
            + `<div class="day-events">${pills}</div>`
            + `</div>`;
    }

    // Next month padding
    const totalCells = firstDay + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
        html += `<div class="day-cell other-month"><div class="day-cell-header"><span class="day-num">${i}</span></div><div class="day-events"></div></div>`;
    }

    html += '</div>';
    return html;
}

function renderWeekView() {
    const ws = getWeekStart(calDate);
    const today = new Date();
    
    let timeLabelsHtml = '<div class="time-labels">';
    for (let h = 7; h <= 22; h++) {
        const label = h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM');
        timeLabelsHtml += `<div class="time-label"><span>${label}</span></div>`;
    }
    timeLabelsHtml += '</div>';

    let html = `<div class="time-grid-container">${timeLabelsHtml}<div class="week-grid">`;

    for (let i = 0; i < 7; i++) {
        const d = new Date(ws); d.setDate(d.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        const dayName = d.toLocaleDateString('en-US', { weekday:'short' });
        const dayNum = d.getDate();
        const dayEvents = SAMPLE_EVENTS.map((e, idx) => ({ ...e, originalIndex: idx })).filter(e => e.day === d.getDay());

        html += `<div class="week-col">
            <div class="week-day-header ${isToday ? 'today' : ''}">
                <div class="day-label">${dayName}</div>
                <div class="day-number">${dayNum}</div>
            </div>
            <div class="week-events-grid">`;

        // Render events
        dayEvents.forEach(e => {
            const startH = Math.max(7, e.start);
            const endH = Math.min(23, e.end);
            if (endH <= 7 || startH >= 23) return;

            const top = (startH - 7) * 45; // 45px per hour
            const height = Math.max(15, (endH - startH) * 45);
            
            html += `<div class="week-event-abs" style="background:${e.color}; top:${top}px; height:${height}px;" onclick="event.stopPropagation(); showEventDetail(${e.originalIndex})">
                <div class="evt-title">${e.title}</div>
                <div class="evt-time">${fmtHour(e.start)}</div>
            </div>`;
        });

        html += '</div></div>';
    }

    html += '</div></div>';
    return html;
}

function renderDayView() {
    const dow = calDate.getDay();
    const dayEvents = SAMPLE_EVENTS.map((e, idx) => ({ ...e, originalIndex: idx })).filter(e => e.day === dow);

    let timeLabelsHtml = '<div class="time-labels">';
    for (let h = 7; h <= 22; h++) {
        const label = h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM');
        timeLabelsHtml += `<div class="time-label"><span>${label}</span></div>`;
    }
    timeLabelsHtml += '</div>';

    let html = `<div class="time-grid-container">${timeLabelsHtml}<div class="day-grid-abs">`;

    dayEvents.forEach(e => {
        const startH = Math.max(7, e.start);
        const endH = Math.min(23, e.end);
        if (endH <= 7 || startH >= 23) return;

        const top = (startH - 7) * 45;
        const height = Math.max(15, (endH - startH) * 45);
        
        const locationText = e.location ? `<span style="margin-left:6px; opacity:0.8;">📍 ${e.location}</span>` : '';
        html += `<div class="day-event-abs fade-in" style="background:${e.color}15; border-left: 4px solid ${e.color}; top:${top}px; height:${height}px;" onclick="event.stopPropagation(); showEventDetail(${e.originalIndex})">
            <div class="evt-title" style="color:${e.color}">${e.title}</div>
            <div class="evt-time" style="color:var(--text-secondary)">${fmtHour(e.start)} – ${fmtHour(e.end)} ${locationText}</div>
        </div>`;
    });

    html += '</div></div>';
    return html;
}

// ========== CHORES ==========
function renderChores() {
    const list = document.getElementById('choreList');
    const doneCount = CHORES.filter(c => c.done).length;
    const total = CHORES.length;
    const pct = total > 0 ? Math.round(doneCount / total * 100) : 0;

    document.getElementById('choreProgress').textContent = `${doneCount} of ${total} chores completed`;
    document.getElementById('ringFill').setAttribute('stroke-dasharray', `${pct}, 100`);
    document.getElementById('ringText').textContent = `${pct}%`;

    // Group by assignee
    const groups = {};
    FAMILY.forEach(m => {
        groups[m.id] = { member: m, chores: CHORES.filter(c => c.assignee === m.id) };
    });

    let html = '';
    Object.values(groups).forEach(g => {
        const done = g.chores.filter(c => c.done).length;
        const total = g.chores.length;
        const pct = total > 0 ? Math.round(done / total * 100) : 0;

        html += `<div class="chore-card fade-in">
            <div class="chore-card-header">
                <div class="avatar-mini" style="background:${g.member.color}22">${g.member.emoji}</div>
                <div class="info">
                    <div class="name">${g.member.name}</div>
                    <div class="stats">${done}/${total} completed • ${pct}%</div>
                </div>
            </div>
            <div class="chore-items-scroll">`;
        
        if (g.chores.length === 0) {
            html += `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">No chores assigned</div>`;
        } else {
            g.chores.forEach(c => {
                html += `<div class="chore-item">
                    <div class="chore-check ${c.done ? 'done' : ''}" onclick="toggleChore(${c.id})">${c.done ? '✓' : ''}</div>
                    <span class="chore-title ${c.done ? 'done' : ''}">${c.title}</span>
                    <span class="chore-freq">${c.freq}</span>
                </div>`;
            });
        }
        
        html += `</div></div>`;
    });
    list.innerHTML = html;
}

function toggleChore(id) {
    const c = CHORES.find(ch => ch.id === id);
    if (c) { c.done = !c.done; renderChores(); }
}

// ========== MEALS ==========
function renderMeals() {
    const ws = getWeekStart(calDate);
    const we = new Date(ws); we.setDate(we.getDate() + 6);
    document.getElementById('mealsRange').textContent = `${fmtShort(ws)} – ${fmtShort(we)}`;

    const grid = document.getElementById('mealsGrid');
    const today = new Date();
    const types = [
        { key:'breakfast', label:'Breakfast', icon:'🌅' },
        { key:'lunch', label:'Lunch', icon:'☀️' },
        { key:'dinner', label:'Dinner', icon:'🌙' },
    ];

    let html = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(ws); d.setDate(d.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        const dayMeals = MEALS[d.getDay()] || {};

        html += `<div class="meal-day-card fade-in">
            <div class="meal-day-header">
                <span class="meal-day-name">${d.toLocaleDateString('en-US',{weekday:'long'})}</span>
                <span class="meal-day-date">${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
            </div>
            <div class="meal-slots">`;

        types.forEach(t => {
            const val = dayMeals[t.key] || '';
            const dow = d.getDay();
            const dayLabel = d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
            html += `<div class="meal-slot ${val ? 'filled' : ''}" onclick="openModal('meal',{dow:${dow},slot:'${t.key}',currentMeal:'${val.replace(/'/g,"\\'")}',dayLabel:'${dayLabel}'})">
                <div class="meal-slot-icon">${t.icon}</div>
                <div class="meal-slot-type">${t.label}</div>
                ${val ? `<div class="meal-slot-name">${val}</div>` : '<div class="meal-slot-empty">Add meal</div>'}
            </div>`;
        });

        html += '</div></div>';
    }
    grid.innerHTML = html;

    document.getElementById('mealPrev').onclick = () => { calDate.setDate(calDate.getDate()-7); renderMeals(); };
    document.getElementById('mealNext').onclick = () => { calDate.setDate(calDate.getDate()+7); renderMeals(); };
}

// ========== GROCERY ==========
function renderGrocery() {
    const list = document.getElementById('groceryList');
    const cats = {};
    GROCERY.filter(g => !g.done).forEach(g => {
        if (!cats[g.category]) cats[g.category] = { icon: g.icon, items: [] };
        cats[g.category].items.push(g);
    });

    let html = '';
    Object.entries(cats).forEach(([cat, data]) => {
        html += `<div class="grocery-category">
            <div class="grocery-cat-header">
                <span class="grocery-cat-icon">${data.icon}</span>
                <span>${cat}</span>
                <span class="grocery-cat-count">${data.items.length}</span>
            </div>`;
        data.items.forEach((item, idx) => {
            const m = FAMILY[item.who];
            html += `<div class="grocery-item fade-in">
                <div class="grocery-check" onclick="toggleGrocery(this, '${cat}', ${idx})"></div>
                <span class="grocery-name">${item.name}</span>
                <span class="grocery-who">${m ? m.emoji : ''}</span>
            </div>`;
        });
        html += '</div>';
    });

    // Done section
    const done = GROCERY.filter(g => g.done);
    if (done.length) {
        html += `<div class="grocery-category" style="opacity:0.6">
            <div class="grocery-cat-header">Completed <span class="grocery-cat-count">${done.length}</span></div>`;
        done.forEach(item => {
            const m = FAMILY[item.who];
            html += `<div class="grocery-item">
                <div class="grocery-check done">✓</div>
                <span class="grocery-name done">${item.name}</span>
                <span class="grocery-who">${m ? m.emoji : ''}</span>
            </div>`;
        });
        html += '</div>';
    }

    list.innerHTML = html;

    document.getElementById('addGroceryBtn').onclick = () => {
        const input = document.getElementById('groceryInput');
        if (input.value.trim()) {
            GROCERY.push({ name:input.value.trim(), category:'Other', icon:'🛒', done:false, who:0 });
            input.value = '';
            renderGrocery();
        }
    };
    document.getElementById('groceryInput').addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('addGroceryBtn').click();
    });
}

function toggleGrocery(el, cat, idx) {
    const items = GROCERY.filter(g => !g.done && g.category === cat);
    if (items[idx]) { items[idx].done = true; renderGrocery(); }
}

// ========== HELPERS ==========
function getWeekStart(d) {
    const date = new Date(d);
    date.setDate(date.getDate() - date.getDay());
    date.setHours(0,0,0,0);
    return date;
}
function fmtShort(d) { return d.toLocaleDateString('en-US', { month:'short', day:'numeric' }); }
function fmtHour(h) {
    const hr = Math.floor(h);
    const min = (h % 1) * 60;
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const hr12 = hr % 12 || 12;
    return min > 0 ? `${hr12}:${String(Math.round(min)).padStart(2,'0')} ${ampm}` : `${hr12} ${ampm}`;
}

// ========== ORIENTATION ==========
function setOrientation(mode) {
    const frame = document.getElementById('ipadFrame');
    document.querySelectorAll('.orient-btn').forEach(b => b.classList.remove('active'));
    const label = document.querySelector('.frame-label');
    if (mode === 'landscape') {
        frame.classList.add('landscape');
        document.querySelectorAll('.orient-btn')[1].classList.add('active');
        if (label) label.textContent = 'iPad Pro 11" — Landscape Preview';
    } else {
        frame.classList.remove('landscape');
        document.querySelectorAll('.orient-btn')[0].classList.add('active');
        if (label) label.textContent = 'iPad Pro 11" — Portrait Preview';
    }
    // Re-render calendar to adapt event count
    if (currentUser) renderCalendar();
}

// ========== MODAL SYSTEM ==========
let modalState = {};

function openModal(type, extra) {
    modalState = { type, ...extra };
    const overlay = document.getElementById('modalOverlay');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');
    const save = document.getElementById('modalSave');

    if (type === 'event') {
        title.textContent = 'New Event';
        save.textContent = 'Add Event';
        body.innerHTML = renderEventForm();
        save.onclick = saveEvent;
    } else if (type === 'chore') {
        title.textContent = 'New Chore';
        save.textContent = 'Add Chore';
        body.innerHTML = renderChoreForm();
        save.onclick = saveChore;
    } else if (type === 'meal') {
        title.textContent = 'Edit Meal';
        save.textContent = 'Save';
        body.innerHTML = renderMealForm(extra);
        save.onclick = saveMeal;
    } else if (type === 'grocery') {
        title.textContent = 'Add Grocery Item';
        save.textContent = 'Add Item';
        body.innerHTML = renderGroceryForm();
        save.onclick = saveGroceryItem;
    }

    document.querySelector('.modal-cancel').style.display = 'block';
    save.style.display = 'block';

    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.querySelector('.modal-cancel').style.display = 'block';
    
    const saveBtn = document.getElementById('modalSave');
    saveBtn.style.display = 'block';
    saveBtn.textContent = 'Add';
    saveBtn.style.background = '';
    saveBtn.style.color = '';
    saveBtn.style.fontSize = '';
    saveBtn.style.padding = '';
    
    modalState = {};
}

// ========== EVENT DETAIL MODAL ==========
function showEventDetail(index) {
    const e = SAMPLE_EVENTS[index];
    if (!e) return;

    const locHtml = e.location ? `
        <div class="form-section" style="margin-top:16px;">
            <span class="form-section-label">Location</span>
            <div style="font-size:15px; color:var(--text-primary); display:flex; align-items:center; gap:8px;">
                <span>📍</span> ${e.location}
            </div>
        </div>
    ` : '';

    const notesHtml = e.notes ? `
        <div class="form-section" style="margin-top:16px;">
            <span class="form-section-label">Notes</span>
            <div style="font-size:14px; color:var(--text-secondary); background:var(--bg-secondary); padding:12px; border-radius:8px; line-height:1.4;">
                ${e.notes.replace(/\n/g, '<br>')}
            </div>
        </div>
    ` : '';

    const html = `
        <div style="text-align:center; padding:10px 0 20px;">
            <div style="width:48px; height:48px; border-radius:12px; background:${e.color}22; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                <div style="width:24px; height:24px; border-radius:50%; background:${e.color}"></div>
            </div>
            <h2 style="margin:0; font-size:22px; color:var(--text-primary); font-weight:600;">${e.title}</h2>
            <div style="margin-top:6px; font-size:15px; color:var(--text-secondary); font-weight:500;">
                ${fmtHour(e.start)} – ${fmtHour(e.end)}
            </div>
            <div style="display:inline-block; margin-top:12px; padding:4px 10px; background:${e.color}15; color:${e.color}; border-radius:12px; font-size:12px; font-weight:600;">
                ${e.cal} Calendar
            </div>
        </div>
        ${locHtml}
        ${notesHtml}
    `;

    document.getElementById('modalTitle').textContent = 'Event Details';
    document.querySelector('.modal-cancel').style.display = 'none';
    
    const saveBtn = document.getElementById('modalSave');
    saveBtn.style.display = 'block';
    saveBtn.innerHTML = '&#10005;'; // X icon
    saveBtn.style.background = 'transparent';
    saveBtn.style.color = 'var(--text-secondary)';
    saveBtn.style.fontSize = '20px';
    saveBtn.style.padding = '0 4px';
    saveBtn.onclick = closeModal;

    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('modalOverlay').classList.add('active');
    setTimeout(() => { document.querySelector('.modal-sheet').classList.add('active'); }, 10);
}

// ========== EVENT FORM ==========
const EVENT_COLORS = ['#4A90D9','#5AAB61','#E05B8C','#9B6BD4','#F5A623','#3BBFA0','#E8725A','#6BAED6'];
const CAL_NAMES = ['Work','Kids','Family','Personal','Health'];

function renderEventForm() {
    const today = calDate.toISOString().split('T')[0];
    const colors = EVENT_COLORS.map((c,i) =>
        `<div class="color-dot ${i===0?'selected':''}" data-color="${c}" onclick="selectColor(this)">
            <div class="color-dot-inner" style="background:${c}"></div>
        </div>`
    ).join('');

    const cals = CAL_NAMES.map((n,i) =>
        `<div class="form-chip ${i===0?'selected':''}" data-cal="${n}" onclick="selectCal(this)">${n}</div>`
    ).join('');

    return `
        <div class="form-section">
            <span class="form-section-label">Event Details</span>
            <input class="form-input" id="ev-title" placeholder="Event title" autofocus>
            <input class="form-input" id="ev-location" placeholder="Location (optional)">
            <textarea class="form-input" id="ev-notes" placeholder="Notes (optional)" rows="2"></textarea>
        </div>
        <div class="form-section">
            <span class="form-section-label">Date & Time</span>
            <div class="form-row">
                <span class="form-row-label">All Day</span>
                <div class="toggle-track" id="ev-allday" onclick="toggleAllDay(this)">
                    <div class="toggle-thumb"></div>
                </div>
            </div>
            <div class="form-field">
                <input class="form-input" type="date" id="ev-date" value="${today}">
            </div>
            <div class="form-field" id="ev-time-fields">
                <div style="display:flex;gap:8px">
                    <input class="form-input" type="time" id="ev-start" value="09:00" style="flex:1">
                    <input class="form-input" type="time" id="ev-end" value="10:00" style="flex:1">
                </div>
            </div>
        </div>
        <div class="form-section">
            <span class="form-section-label">Repeat</span>
            <div class="form-row">
                <span class="form-row-label">Repeat Event</span>
                <div class="toggle-track" id="ev-is-repeating" onclick="toggleIsRepeating(this)">
                    <div class="toggle-thumb"></div>
                </div>
            </div>
            <div id="ev-repeat-options-container" style="display:none; margin-top:12px;">
                <div class="form-chips" id="ev-repeat-days" style="justify-content:center; gap:8px;">
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="0" onclick="toggleRepeatDay(this)">S</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="1" onclick="toggleRepeatDay(this)">M</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="2" onclick="toggleRepeatDay(this)">T</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="3" onclick="toggleRepeatDay(this)">W</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="4" onclick="toggleRepeatDay(this)">T</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="5" onclick="toggleRepeatDay(this)">F</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="6" onclick="toggleRepeatDay(this)">S</div>
                </div>
                <div id="ev-end-repeat-container" style="display:none; margin-top:12px;">
                    <div class="form-row">
                        <span class="form-row-label">End Repeat</span>
                        <div class="toggle-track" id="ev-has-end-repeat" onclick="toggleEndRepeat(this)">
                            <div class="toggle-thumb"></div>
                        </div>
                    </div>
                    <div class="form-field" id="ev-end-repeat-date-container" style="display:none; margin-top:8px;">
                        <input class="form-input" type="date" id="ev-end-repeat-date" value="${today}">
                    </div>
                </div>
            </div>
        </div>
        <div class="form-section">
            <span class="form-section-label">Calendar</span>
            <div class="form-chips" id="ev-cals">${cals}</div>
        </div>
        <div class="form-section">
            <span class="form-section-label">Color</span>
            <div class="color-options" id="ev-colors">${colors}</div>
        </div>
    `;
}

function toggleAllDay(el) {
    el.classList.toggle('on');
    const tf = document.getElementById('ev-time-fields');
    tf.style.display = el.classList.contains('on') ? 'none' : 'block';
}

function selectColor(el) {
    el.closest('.color-options').querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
    el.classList.add('selected');
}

function selectCal(el) {
    el.closest('.form-chips').querySelectorAll('.form-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function toggleIsRepeating(el) {
    el.classList.toggle('on');
    const container = document.getElementById('ev-repeat-options-container');
    container.style.display = el.classList.contains('on') ? 'block' : 'none';
}

function toggleRepeatDay(el) {
    el.classList.toggle('selected');
    const container = document.getElementById('ev-end-repeat-container');
    const hasSelected = document.querySelectorAll('#ev-repeat-days .form-chip.selected').length > 0;
    container.style.display = hasSelected ? 'block' : 'none';
}

function toggleEndRepeat(el) {
    el.classList.toggle('on');
    const dc = document.getElementById('ev-end-repeat-date-container');
    dc.style.display = el.classList.contains('on') ? 'block' : 'none';
}

function saveEvent() {
    const title = document.getElementById('ev-title').value.trim();
    if (!title) { document.getElementById('ev-title').focus(); return; }

    const date = document.getElementById('ev-date').value;
    const color = document.querySelector('#ev-colors .color-dot.selected')?.dataset.color || '#4A90D9';
    const cal = document.querySelector('#ev-cals .form-chip.selected')?.dataset.cal || 'Personal';
    const isAllDay = document.getElementById('ev-allday').classList.contains('on');
    const startTime = document.getElementById('ev-start').value;
    const endTime = document.getElementById('ev-end').value;

    const d = new Date(date + 'T12:00:00');
    const sh = isAllDay ? 0 : parseInt(startTime.split(':')[0]) + parseInt(startTime.split(':')[1])/60;
    const eh = isAllDay ? 24 : parseInt(endTime.split(':')[0]) + parseInt(endTime.split(':')[1])/60;
    const location = document.getElementById('ev-location').value.trim();
    const notes = document.getElementById('ev-notes').value.trim();

    const isRepeating = document.getElementById('ev-is-repeating').classList.contains('on');
    const repeatDays = Array.from(document.querySelectorAll('#ev-repeat-days .form-chip.selected')).map(el => parseInt(el.dataset.day));

    if (isRepeating && repeatDays.length > 0) {
        repeatDays.forEach(day => {
            SAMPLE_EVENTS.push({
                title, cal, color, location, notes,
                day: day,
                start: sh, end: eh
            });
        });
    } else {
        SAMPLE_EVENTS.push({
            title, cal, color, location, notes,
            day: d.getDay(),
            start: sh, end: eh
        });
    }

    closeModal();
    renderCalendar();
}

// ========== CHORE FORM ==========
function renderChoreForm() {
    const freqs = ['Daily','Weekly','Monthly'].map((f,i) =>
        `<div class="form-chip ${i===0?'selected':''}" data-freq="${f}" onclick="selectFreq(this)">${f}</div>`
    ).join('');

    const members = FAMILY.map((m,i) =>
        `<div class="member-option ${i===0?'selected':''}" data-id="${m.id}" onclick="selectMember(this)">
            <span class="emoji">${m.emoji}</span>
            <span class="name">${m.name}</span>
            <span class="check">✓</span>
        </div>`
    ).join('');

    return `
        <div class="form-section">
            <span class="form-section-label">Chore Details</span>
            <input class="form-input" id="ch-title" placeholder="What needs to be done?" autofocus>
            <textarea class="form-input" id="ch-notes" placeholder="Notes (optional)" rows="2"></textarea>
        </div>
        <div class="form-section">
            <span class="form-section-label">Frequency</span>
            <div class="form-chips" id="ch-freq">${freqs}</div>
            <div id="ch-weekly-days" style="display:none; margin-top:12px;">
                <span class="form-section-label" style="margin-bottom:6px; display:block;">Repeat on days</span>
                <div class="form-chips" id="ch-repeat-days" style="justify-content:center; gap:8px;">
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="0" onclick="toggleChoreDay(this)">S</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="1" onclick="toggleChoreDay(this)">M</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="2" onclick="toggleChoreDay(this)">T</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="3" onclick="toggleChoreDay(this)">W</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="4" onclick="toggleChoreDay(this)">T</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="5" onclick="toggleChoreDay(this)">F</div>
                    <div class="form-chip" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" data-day="6" onclick="toggleChoreDay(this)">S</div>
                </div>
            </div>
        </div>
        <div class="form-section">
            <span class="form-section-label">Assign To</span>
            <div style="display:flex;flex-direction:column;gap:6px" id="ch-members">${members}</div>
        </div>
    `;
}

function selectFreq(el) {
    el.closest('.form-chips').querySelectorAll('.form-chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const container = document.getElementById('ch-weekly-days');
    if (container) {
        container.style.display = el.dataset.freq === 'Weekly' ? 'block' : 'none';
    }
}

function toggleChoreDay(el) {
    el.classList.toggle('selected');
}

function selectMember(el) {
    el.closest('div').querySelectorAll('.member-option').forEach(m => m.classList.remove('selected'));
    el.classList.add('selected');
}

function saveChore() {
    const title = document.getElementById('ch-title').value.trim();
    if (!title) { document.getElementById('ch-title').focus(); return; }

    const freq = document.querySelector('#ch-freq .form-chip.selected')?.dataset.freq || 'Daily';
    const assigneeId = parseInt(document.querySelector('#ch-members .member-option.selected')?.dataset.id || '1');
    const repeatDays = Array.from(document.querySelectorAll('#ch-repeat-days .form-chip.selected')).map(el => parseInt(el.dataset.day));

    CHORES.push({
        id: Date.now(),
        title,
        assignee: assigneeId,
        freq: freq,
        repeatDays: freq === 'Weekly' ? repeatDays : [],
        done: false
    });

    closeModal();
    renderChores();
}

// ========== RECIPE DATABASE ==========
const RECIPES = [
    // Breakfast
    { name:'Pancakes', slot:'breakfast', ingredients:['Milk','Eggs','Flour','Butter','Syrup'], icon:'🥞' },
    { name:'Eggs & toast', slot:'breakfast', ingredients:['Eggs','Bread','Butter'], icon:'🍳' },
    { name:'French toast', slot:'breakfast', ingredients:['Bread','Eggs','Milk','Cinnamon','Syrup'], icon:'🍞' },
    { name:'Oatmeal', slot:'breakfast', ingredients:['Oats','Milk','Bananas','Honey'], icon:'🥣' },
    { name:'Smoothie', slot:'breakfast', ingredients:['Bananas','Milk','Yogurt','Berries'], icon:'🥤' },
    { name:'Waffles', slot:'breakfast', ingredients:['Flour','Eggs','Milk','Butter','Syrup'], icon:'🧇' },
    { name:'Yogurt parfait', slot:'breakfast', ingredients:['Yogurt','Granola','Berries','Honey'], icon:'🍨' },
    { name:'Cereal', slot:'breakfast', ingredients:['Cereal','Milk'], icon:'🥣' },

    // Lunch
    { name:'Turkey wrap', slot:'lunch', ingredients:['Turkey','Tortillas','Lettuce','Cheese','Tomato'], icon:'🌯' },
    { name:'Salad', slot:'lunch', ingredients:['Lettuce','Tomato','Chicken breast','Dressing'], icon:'🥗' },
    { name:'Sandwich', slot:'lunch', ingredients:['Bread','Turkey','Cheese','Lettuce','Tomato'], icon:'🥪' },
    { name:'Soup', slot:'lunch', ingredients:['Broth','Carrots','Celery','Onion'], icon:'🍜' },
    { name:'Quesadilla', slot:'lunch', ingredients:['Tortillas','Cheese','Chicken breast','Salsa'], icon:'🫓' },
    { name:'Pasta salad', slot:'lunch', ingredients:['Pasta','Tomato','Olives','Dressing','Cheese'], icon:'🍝' },
    { name:'Grilled cheese', slot:'lunch', ingredients:['Bread','Cheese','Butter'], icon:'🧀' },

    // Dinner
    { name:'Tacos', slot:'dinner', ingredients:['Ground beef','Tortillas','Cheese','Lettuce','Tomato','Salsa'], icon:'🌮' },
    { name:'Pasta night', slot:'dinner', ingredients:['Pasta','Tomato sauce','Ground beef','Cheese','Garlic'], icon:'🍝' },
    { name:'Stir fry', slot:'dinner', ingredients:['Chicken breast','Rice','Soy sauce','Broccoli','Carrots','Garlic'], icon:'🥘' },
    { name:'Grilled chicken', slot:'dinner', ingredients:['Chicken breast','Rice','Broccoli','Olive oil','Garlic'], icon:'🍗' },
    { name:'Pizza', slot:'dinner', ingredients:['Pizza dough','Tomato sauce','Cheese','Pepperoni'], icon:'🍕' },
    { name:'Salmon', slot:'dinner', ingredients:['Salmon','Rice','Asparagus','Lemon','Olive oil'], icon:'🐟' },
    { name:'BBQ', slot:'dinner', ingredients:['Chicken breast','BBQ sauce','Corn','Bread'], icon:'🍖' },
    { name:'Curry', slot:'dinner', ingredients:['Chicken breast','Rice','Coconut milk','Curry paste','Onion'], icon:'🍛' },
];

// ========== SMART MEAL SUGGESTIONS ==========
function getAvailableIngredients() {
    // All grocery items (both purchased and on the list) count as available
    return GROCERY.map(g => g.name.toLowerCase());
}

function getRecipeSuggestions(slot) {
    const available = getAvailableIngredients();
    const slotRecipes = RECIPES.filter(r => r.slot === slot);

    return slotRecipes.map(recipe => {
        const matched = recipe.ingredients.filter(ing => 
            available.some(a => a.includes(ing.toLowerCase()) || ing.toLowerCase().includes(a))
        );
        const missing = recipe.ingredients.filter(ing => 
            !available.some(a => a.includes(ing.toLowerCase()) || ing.toLowerCase().includes(a))
        );
        const pct = Math.round((matched.length / recipe.ingredients.length) * 100);
        return { ...recipe, matched, missing, pct };
    }).sort((a, b) => b.pct - a.pct); // Best matches first
}

// ========== MEAL FORM (with smart suggestions) ==========
function renderMealForm(extra) {
    const current = extra?.currentMeal || '';
    const slot = extra?.slot || 'dinner';
    const dayLabel = extra?.dayLabel || '';
    const icons = { breakfast:'🌅', lunch:'☀️', dinner:'🌙' };

    const suggestions = getRecipeSuggestions(slot);

    // Split into "can make" (≥50%) and "need more" (<50%)
    const canMake = suggestions.filter(s => s.pct >= 50);
    const needMore = suggestions.filter(s => s.pct < 50 && s.pct > 0);

    let suggestionsHtml = '';

    if (canMake.length > 0) {
        suggestionsHtml += `<div class="form-section">
            <span class="form-section-label">🟢 You Can Make (based on your groceries)</span>
            <div class="recipe-suggestions">`;
        canMake.forEach(r => {
            suggestionsHtml += renderRecipeCard(r, current);
        });
        suggestionsHtml += `</div></div>`;
    }

    if (needMore.length > 0) {
        suggestionsHtml += `<div class="form-section">
            <span class="form-section-label">🟡 Need a Few More Items</span>
            <div class="recipe-suggestions">`;
        needMore.slice(0, 4).forEach(r => {
            suggestionsHtml += renderRecipeCard(r, current);
        });
        suggestionsHtml += `</div></div>`;
    }

    // Also show all quick picks as simple chips
    const allRecipeNames = RECIPES.filter(r => r.slot === slot).map(r => r.name);
    const chips = allRecipeNames.map(s =>
        `<div class="form-chip ${s===current?'selected':''}" onclick="this.closest('.modal-body').querySelector('#meal-title').value='${s}'; selectFreq(this)">${s}</div>`
    ).join('');

    return `
        <div class="form-section">
            <span class="form-section-label">${icons[slot] || '🍽️'} ${slot.charAt(0).toUpperCase()+slot.slice(1)} — ${dayLabel}</span>
            <input class="form-input" id="meal-title" placeholder="What's for ${slot}?" value="${current}" autofocus>
        </div>
        ${suggestionsHtml}
        <div class="form-section">
            <span class="form-section-label">All Options</span>
            <div class="form-chips">${chips}</div>
        </div>
        <div class="form-section">
            <span class="form-section-label">Notes</span>
            <textarea class="form-input" id="meal-notes" placeholder="Recipe link, prep notes..." rows="2"></textarea>
        </div>
    `;
}

function renderRecipeCard(recipe, currentMeal) {
    const isSelected = recipe.name === currentMeal;
    const matchBar = `<div class="match-bar"><div class="match-fill" style="width:${recipe.pct}%; background:${recipe.pct >= 75 ? 'var(--success)' : recipe.pct >= 50 ? 'var(--accent)' : 'var(--warning)'}"></div></div>`;

    const haveList = recipe.matched.map(i => `<span class="ing-tag have">✓ ${i}</span>`).join('');
    const needList = recipe.missing.map(i => `<span class="ing-tag need">${i}</span>`).join('');
    const addBtn = recipe.missing.length > 0
        ? `<button class="add-missing-btn" onclick="event.stopPropagation(); addMissingToGrocery([${recipe.missing.map(i => `'${i.replace(/'/g,"\\'")}'`).join(',')}]); this.textContent='✓ Added'; this.disabled=true;">+ Add ${recipe.missing.length} to grocery</button>`
        : `<span class="ing-tag have" style="font-size:11px">✅ All ingredients on hand!</span>`;

    return `<div class="recipe-card ${isSelected ? 'selected' : ''}" onclick="document.getElementById('meal-title').value='${recipe.name.replace(/'/g,"\\'")}'; document.querySelectorAll('.recipe-card').forEach(c=>c.classList.remove('selected')); this.classList.add('selected');">
        <div class="recipe-header">
            <span class="recipe-icon">${recipe.icon}</span>
            <div class="recipe-info">
                <span class="recipe-name">${recipe.name}</span>
                <span class="recipe-match">${recipe.pct}% match</span>
            </div>
            ${matchBar}
        </div>
        <div class="recipe-ingredients">
            ${haveList}${needList}
        </div>
        ${addBtn}
    </div>`;
}

function addMissingToGrocery(items) {
    items.forEach(item => {
        // Don't add if already in the list
        if (!GROCERY.some(g => g.name.toLowerCase() === item.toLowerCase())) {
            // Determine category from the item
            const catMap = {
                'Milk':'Dairy','Eggs':'Dairy','Cheese':'Dairy','Yogurt':'Dairy','Butter':'Dairy','Cream':'Dairy',
                'Bread':'Bakery','Flour':'Bakery','Tortillas':'Bakery','Pizza dough':'Bakery',
                'Chicken breast':'Meat','Ground beef':'Meat','Turkey':'Meat','Salmon':'Meat','Pepperoni':'Meat',
                'Lettuce':'Produce','Tomato':'Produce','Bananas':'Produce','Apples':'Produce','Onion':'Produce',
                'Broccoli':'Produce','Carrots':'Produce','Celery':'Produce','Asparagus':'Produce','Corn':'Produce',
                'Berries':'Produce','Lemon':'Produce',
                'Pasta':'Pantry','Tomato sauce':'Pantry','Rice':'Pantry','Oats':'Pantry','Soy sauce':'Pantry',
                'Olive oil':'Pantry','BBQ sauce':'Pantry','Garlic':'Pantry','Cinnamon':'Pantry','Honey':'Pantry',
                'Syrup':'Pantry','Dressing':'Pantry','Salsa':'Pantry','Broth':'Pantry','Olives':'Pantry',
                'Coconut milk':'Pantry','Curry paste':'Pantry','Granola':'Pantry','Cereal':'Pantry',
            };
            const iconMap = {
                'Dairy':'🥛','Bakery':'🍞','Meat':'🥩','Produce':'🥬','Pantry':'🏠',
                'Beverages':'🧃','Frozen':'🧊','Snacks':'🍿','Other':'🛒'
            };
            const cat = catMap[item] || 'Other';
            const icon = iconMap[cat] || '🛒';
            GROCERY.push({ name: item, category: cat, icon, done: false, who: 0 });
        }
    });
    // Re-render grocery if it's visible
    renderGrocery();
}

function saveMeal() {
    const title = document.getElementById('meal-title').value.trim();
    const dow = modalState.dow;
    const slot = modalState.slot;

    if (!MEALS[dow]) MEALS[dow] = {};
    MEALS[dow][slot] = title;

    closeModal();
    renderMeals();
}

// ========== GROCERY FORM ==========
const GROCERY_CATS = [
    { name:'Produce', icon:'🥬' },
    { name:'Dairy', icon:'🥛' },
    { name:'Meat', icon:'🥩' },
    { name:'Bakery', icon:'🍞' },
    { name:'Pantry', icon:'🏠' },
    { name:'Beverages', icon:'🧃' },
    { name:'Frozen', icon:'🧊' },
    { name:'Snacks', icon:'🍿' },
    { name:'Other', icon:'🛒' },
];

function renderGroceryForm() {
    const cats = GROCERY_CATS.map((c,i) =>
        `<div class="cat-option ${i===0?'selected':''}" data-cat="${c.name}" data-icon="${c.icon}" onclick="selectCat(this)">
            <span class="cat-emoji">${c.icon}</span>
            <span>${c.name}</span>
        </div>`
    ).join('');

    const members = FAMILY.map((m,i) =>
        `<div class="form-chip ${i===0?'selected':''}" data-who="${i}" onclick="selectFreq(this)">
            ${m.emoji} ${m.name}
        </div>`
    ).join('');

    return `
        <div class="form-section">
            <span class="form-section-label">Item Details</span>
            <input class="form-input" id="gr-name" placeholder="Item name" autofocus>
            <input class="form-input" id="gr-qty" placeholder="Quantity (optional, e.g. 2 lbs)">
        </div>
        <div class="form-section">
            <span class="form-section-label">Category</span>
            <div class="cat-grid" id="gr-cats">${cats}</div>
        </div>
        <div class="form-section">
            <span class="form-section-label">Added By</span>
            <div class="form-chips" id="gr-who">${members}</div>
        </div>
    `;
}

function selectCat(el) {
    el.closest('.cat-grid').querySelectorAll('.cat-option').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function saveGroceryItem() {
    const name = document.getElementById('gr-name').value.trim();
    if (!name) { document.getElementById('gr-name').focus(); return; }

    const catEl = document.querySelector('#gr-cats .cat-option.selected');
    const whoEl = document.querySelector('#gr-who .form-chip.selected');
    const category = catEl?.dataset.cat || 'Other';
    const icon = catEl?.dataset.icon || '🛒';
    const who = parseInt(whoEl?.dataset.who || '0');

    GROCERY.push({ name, category, icon, done: false, who });
    closeModal();
    renderGrocery();
}
