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
    0:{ breakfast:'Pancakes', snack1:'Yogurt & Berries', lunch:'Turkey wrap', snack2:'Trail Mix', dinner:'Pasta night' },
    1:{ breakfast:'Cereal', snack1:'', lunch:'', snack2:'Apple slices', dinner:'Tacos' },
    2:{ breakfast:'Eggs & toast', snack1:'String cheese', lunch:'Salad', snack2:'', dinner:'' },
    3:{ breakfast:'', snack1:'', lunch:'Soup', snack2:'Pretzels', dinner:'Stir fry' },
    4:{ breakfast:'Waffles', snack1:'Smoothie', lunch:'', snack2:'Carrot sticks', dinner:'Pizza' },
    5:{ breakfast:'', snack1:'', lunch:'Sandwiches', snack2:'', dinner:'Grilled chicken' },
    6:{ breakfast:'French toast', snack1:'', lunch:'Leftovers', snack2:'Hummus', dinner:'BBQ' },
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
    // Note: setupCalendarControls() is called in showMainApp() after login
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
    
    if (selectedAvatar.role !== 'Admin') {
        currentUser = selectedAvatar;
        showMainApp();
        return;
    }

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

    const pb = document.getElementById('profileBtn');
    if (pb) {
        pb.innerHTML = `
            <div class="sidebar-avatar" style="background:${currentUser.color}22; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; cursor: pointer;">${currentUser.emoji}</div>
        `;
    }

    renderCalendar();
    setupCalendarControls(); // Attach after DOM is visible
    renderChores();
    renderMeals();
    renderGrocery();
    fetchWeather(); // Fetch weather when app loads

    // Restrict kids from adding items
    const fabs = document.querySelectorAll('.fab, .add-btn');
    if (currentUser.role !== 'Admin') {
        fabs.forEach(fab => fab.style.display = 'none');
    } else {
        fabs.forEach(fab => fab.style.display = 'block');
    }
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
        btn.onclick = () => {
            calView = btn.dataset.view;
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCalendar();
        };
    });
    const prevBtn = document.getElementById('calPrev');
    const nextBtn = document.getElementById('calNext');
    const todayBtn = document.getElementById('btnToday');
    if (prevBtn) prevBtn.onclick = () => navCal(-1);
    if (nextBtn) nextBtn.onclick = () => navCal(1);
    if (todayBtn) todayBtn.onclick = () => { calDate = new Date(); renderCalendar(); };
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

    // --- Fixed header row (outside scroll) ---
    let headerHtml = '<div class="week-header-row"><div class="week-time-spacer"></div>';
    for (let i = 0; i < 7; i++) {
        const d = new Date(ws); d.setDate(d.getDate() + i);
        const isToday = d.toDateString() === today.toDateString();
        const dayName = d.toLocaleDateString('en-US', { weekday:'short' }).toUpperCase();
        const dayNum = d.getDate();
        headerHtml += `<div class="week-header-cell${isToday ? ' today' : ''}">
            <span class="week-header-day">${dayName}</span>
            <span class="week-header-num${isToday ? ' today-circle' : ''}">${dayNum}</span>
        </div>`;
    }
    headerHtml += '</div>';

    // --- Scrollable time body ---
    let timeLabelsHtml = '<div class="time-labels">';
    for (let h = 7; h <= 22; h++) {
        const label = h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM');
        timeLabelsHtml += `<div class="time-label"><span>${label}</span></div>`;
    }
    timeLabelsHtml += '</div>';

    let colsHtml = '<div class="week-cols">';
    for (let i = 0; i < 7; i++) {
        const d = new Date(ws); d.setDate(d.getDate() + i);
        const dayEvents = SAMPLE_EVENTS.map((e, idx) => ({ ...e, originalIndex: idx })).filter(e => e.day === d.getDay());

        colsHtml += '<div class="week-events-col">';
        dayEvents.forEach(e => {
            const startH = Math.max(7, e.start);
            const endH = Math.min(23, e.end);
            if (endH <= 7 || startH >= 23) return;
            const top = (startH - 7) * 45;
            const height = Math.max(20, (endH - startH) * 45);
            colsHtml += `<div class="week-event-abs" style="background:${e.color}; top:${top}px; height:${height}px;" onclick="event.stopPropagation(); showEventDetail(${e.originalIndex})">
                <div class="evt-title">${e.title}</div>
                <div class="evt-time">${fmtHour(e.start)}</div>
            </div>`;
        });
        colsHtml += '</div>';
    }
    colsHtml += '</div>';

    return `<div class="week-view-wrapper">${headerHtml}<div class="time-grid-container">${timeLabelsHtml}<div class="week-body-cols">${colsHtml}</div></div></div>`;
}

function renderDayView() {
    const dow = calDate.getDay();
    const dayEvents = SAMPLE_EVENTS.map((e, idx) => ({ ...e, originalIndex: idx })).filter(e => e.day === dow);
    const today = new Date();
    const isToday = calDate.toDateString() === today.toDateString();
    const dayName = calDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayNum = calDate.getDate();

    // Fixed header row
    const headerHtml = `<div class="day-header-row">
        <div class="week-time-spacer"></div>
        <div class="day-header-cell${isToday ? ' today' : ''}">
            <span class="week-header-day">${dayName.toUpperCase()}</span>
            <span class="week-header-num${isToday ? ' today-circle' : ''}">${dayNum}</span>
        </div>
    </div>`;

    let timeLabelsHtml = '<div class="time-labels">';
    for (let h = 7; h <= 22; h++) {
        const label = h > 12 ? (h - 12) + ' PM' : (h === 12 ? '12 PM' : h + ' AM');
        timeLabelsHtml += `<div class="time-label"><span>${label}</span></div>`;
    }
    timeLabelsHtml += '</div>';

    let eventsHtml = '<div class="day-grid-abs">';
    dayEvents.forEach(e => {
        const startH = Math.max(7, e.start);
        const endH = Math.min(23, e.end);
        if (endH <= 7 || startH >= 23) return;
        const top = (startH - 7) * 45;
        const height = Math.max(20, (endH - startH) * 45);
        const locationText = e.location ? `<span style="margin-left:6px; opacity:0.8;">📍 ${e.location}</span>` : '';
        eventsHtml += `<div class="day-event-abs fade-in" style="background:${e.color}15; border-left: 4px solid ${e.color}; top:${top}px; height:${height}px;" onclick="event.stopPropagation(); showEventDetail(${e.originalIndex})">
            <div class="evt-title" style="color:${e.color}">${e.title}</div>
            <div class="evt-time" style="color:var(--text-secondary)">${fmtHour(e.start)} – ${fmtHour(e.end)} ${locationText}</div>
        </div>`;
    });
    eventsHtml += '</div>';

    return `<div class="week-view-wrapper">${headerHtml}<div class="time-grid-container">${timeLabelsHtml}${eventsHtml}</div></div>`;
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

function clearCompletedGrocery() {
    const originalCount = GROCERY.length;
    for (let i = GROCERY.length - 1; i >= 0; i--) {
        if (GROCERY[i].done) {
            GROCERY.splice(i, 1);
        }
    }
    const removed = originalCount - GROCERY.length;
    if (removed > 0) {
        showNotification(`✨ Cleared ${removed} completed items.`);
        renderGrocery();
    }
}

function toggleChore(id) {
    const c = CHORES.find(ch => ch.id === id);
    if (c) { c.done = !c.done; renderChores(); }
}

// ========== MEALS ==========
const MEAL_ICONS = {
    'pancake': '🥞', 'waffle': '🧇', 'egg': '🍳', 'toast': '🍞', 'cereal': '🥣',
    'bacon': '🥓', 'sausage': '🌭', 'taco': '🌮', 'pizza': '🍕', 'burger': '🍔',
    'sandwich': '🥪', 'wrap': '🌯', 'salad': '🥗', 'soup': '🥣', 'pasta': '🍝',
    'spaghetti': '🍝', 'noodle': '🍜', 'ramen': '🍜', 'sushi': '🍣', 'fish': '🐟',
    'chicken': '🍗', 'steak': '🥩', 'beef': '🥩', 'pork': '🍖', 'bbq': '🍖',
    'curry': '🍛', 'stew': '🍲', 'rice': '🍚', 'burrito': '🌯', 'hot dog': '🌭',
    'fries': '🍟', 'cheese': '🧀', 'bread': '🍞', 'bagel': '🥯', 'croissant': '🥐',
    'apple': '🍎', 'banana': '🍌', 'grape': '🍇', 'strawberry': '🍓', 'melon': '🍉',
    'carrot': '🥕', 'broccoli': '🥦', 'tomato': '🍅', 'corn': '🌽', 'smoothie': '🥤',
    'yogurt': '🍦', 'ice cream': '🍨', 'cookie': '🍪', 'cake': '🍰', 'pie': '🥧',
    'chocolate': '🍫', 'candy': '🍬', 'nut': '🥜', 'trail mix': '🥜', 'pretzel': '🥨',
    'hummus': '🧆', 'falafel': '🧆', 'leftover': '🥡', 'stir fry': '🥘',
};

function getMealIcon(mealName, defaultIcon) {
    if (!mealName) return defaultIcon;
    const lower = mealName.toLowerCase();
    for (const [key, icon] of Object.entries(MEAL_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return defaultIcon;
}

function renderMeals() {
    const ws = getWeekStart(calDate);
    const we = new Date(ws); we.setDate(we.getDate() + 6);
    document.getElementById('mealsRange').textContent = `${fmtShort(ws)} – ${fmtShort(we)}`;

    const grid = document.getElementById('mealsGrid');
    const today = new Date();
    const types = [
        { key:'breakfast', label:'Breakfast', icon:'🌅' },
        { key:'snack1', label:'AM Snack', icon:'🍎' },
        { key:'lunch', label:'Lunch', icon:'☀️' },
        { key:'snack2', label:'PM Snack', icon:'🥨' },
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
            const displayIcon = getMealIcon(val, t.icon);
            
            html += `<div class="meal-slot ${val ? 'filled' : ''}" onclick="openModal('meal',{dow:${dow},slot:'${t.key}',currentMeal:'${val.replace(/'/g,"\\'")}',dayLabel:'${dayLabel}'})">
                <div class="meal-slot-icon">${displayIcon}</div>
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

function generateShoppingList() {
    const ws = getWeekStart(calDate);
    const available = getAvailableIngredients();
    let addedCount = 0;
    
    // Check all 7 days of the current week
    for (let i = 0; i < 7; i++) {
        const d = new Date(ws); d.setDate(d.getDate() + i);
        const dayMeals = MEALS[d.getDay()] || {};
        
        ['breakfast', 'snack1', 'lunch', 'snack2', 'dinner'].forEach(slot => {
            const mealName = dayMeals[slot];
            if (!mealName) return;
            
            const recipe = RECIPES.find(r => r.name === mealName);
            if (recipe) {
                const missing = recipe.ingredients.filter(ing => 
                    !available.some(a => a.includes(ing.toLowerCase()) || ing.toLowerCase().includes(a))
                );
                
                if (missing.length > 0) {
                    addMissingToGrocery(missing);
                    addedCount += missing.length;
                    // Update available list so we don't add the same thing twice for different meals
                    missing.forEach(m => available.push(m.toLowerCase()));
                }
            }
        });
    }
    
    if (addedCount > 0) {
        showNotification(`🛒 Success! Added ${addedCount} items to your grocery list.`);
        renderGrocery();
    } else {
        showNotification(`✅ All set! You have everything you need for this week.`);
    }
}

// ========== GROCERY ==========
// ========== GROCERY ==========
// ========== GROCERY ==========
const PRODUCT_IMAGES = {
    'Chobani': 'https://www.chobani.com/content/dam/chobani/products/yogurt/greek-yogurt/plain/non-fat/0818290011550_C1.png',
    'Tropicana': 'https://m.media-amazon.com/images/I/71X8k8yS7eL._SL1500_.jpg',
    'Oatly': 'https://m.media-amazon.com/images/I/61kMizP+T6L._SL1500_.jpg',
    'Land O Lakes': 'https://m.media-amazon.com/images/I/81xU9R9Tf2L._SL1500_.jpg',
    'Kelloggs': 'https://m.media-amazon.com/images/I/81q2K9S6F9L._SL1500_.jpg'
};

function renderGrocery(query = '') {
    const list = document.getElementById('groceryList');
    const q = query.toLowerCase().trim();
    const clearBtn = document.getElementById('clearGrocerySearch');
    
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
    
    const cats = {};
    GROCERY.filter(g => !g.done).forEach(g => {
        if (q && !g.name.toLowerCase().includes(q)) return;
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
            const brandHtml = item.brand ? `<span class="grocery-brand">${item.brand}</span>` : '';
            const qtyHtml = item.qty ? `<span class="grocery-qty">${item.qty}</span>` : '';
            const imgUrl = PRODUCT_IMAGES[item.brand];
            const imgHtml = imgUrl ? `<div class="grocery-product-img"><img src="${imgUrl}" alt="${item.brand}"></div>` : '';
            
            html += `<div class="grocery-item fade-in" onclick="openModal('grocery', {editIdx: ${GROCERY.indexOf(item)}})">
                <div class="grocery-check" onclick="event.stopPropagation(); toggleGroceryItem(${GROCERY.indexOf(item)}, '${q.replace(/'/g,"\\'")}')"></div>
                ${imgHtml}
                <div class="grocery-item-details">
                    <span class="grocery-name">${item.name}</span>
                    <div class="grocery-meta">${brandHtml}${brandHtml && qtyHtml ? ' • ' : ''}${qtyHtml}</div>
                </div>
                <span class="grocery-who">${m ? m.emoji : ''}</span>
            </div>`;
        });
        html += '</div>';
    });

    // Done section
    const done = GROCERY.filter(g => g.done).filter(g => !q || g.name.toLowerCase().includes(q));
    if (done.length) {
        html += `<div class="grocery-category" style="opacity:0.6">
            <div class="grocery-cat-header" style="justify-content: space-between; width: 100%;">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span>Completed</span>
                    <span class="grocery-cat-count">${done.length}</span>
                </div>
                <button class="btn-text" onclick="clearCompletedGrocery()" style="color:var(--primary); font-size:10px;">Clear All</button>
            </div>`;
        done.forEach(item => {
            const m = FAMILY[item.who];
            html += `<div class="grocery-item" onclick="openModal('grocery', {editIdx: ${GROCERY.indexOf(item)}})">
                <div class="grocery-check done" onclick="event.stopPropagation(); toggleGroceryItem(${GROCERY.indexOf(item)}, '${q.replace(/'/g,"\\'")}')">✓</div>
                <div class="grocery-item-details">
                    <span class="grocery-name done">${item.name}</span>
                    ${item.brand ? `<div class="grocery-meta">${item.brand}</div>` : ''}
                </div>
                <span class="grocery-who">${m ? m.emoji : ''}</span>
            </div>`;
        });
        html += '</div>';
    }

    if (!html && q) {
        html = `<div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
            <div style="font-size:32px; margin-bottom:12px;">🔍</div>
            <div style="font-size:14px; font-weight:500;">No items found matching "${query}"</div>
            <button class="btn-secondary" style="margin-top:16px; padding:8px 20px;" onclick="openModal('grocery', {prefill: '${query.replace(/'/g,"\\'")}'})">
                + Add "${query}"
            </button>
        </div>`;
    }

    list.innerHTML = html;

    const input = document.getElementById('groceryInput');
    input.oninput = (e) => {
        renderGrocery(e.target.value);
    };
}

function clearSearch(tab) {
    if (tab === 'grocery') {
        const input = document.getElementById('groceryInput');
        input.value = '';
        renderGrocery('');
        input.focus();
    }
}

function toggleGroceryItem(globalIdx, query = '') {
    const item = GROCERY[globalIdx];
    if (item) {
        item.done = !item.done;
        renderGrocery(query);
    }
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

// ========== NOTIFICATIONS ==========
function showNotification(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast fade-in';
    toast.textContent = msg;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
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
        const isEdit = extra?.editIdx !== undefined;
        title.textContent = isEdit ? 'Edit Grocery Item' : 'Add Grocery Item';
        save.textContent = isEdit ? 'Save Changes' : 'Add Item';
        body.innerHTML = renderGroceryForm(extra?.prefill, extra?.editIdx);
        save.onclick = saveGroceryItem;
        
        if (isEdit && currentUser && currentUser.role === 'Admin') {
            document.querySelector('.modal-cancel').innerHTML = '<span style="color:var(--danger)">Delete Item</span>';
            document.querySelector('.modal-cancel').onclick = () => {
                GROCERY.splice(extra.editIdx, 1);
                closeModal();
                renderGrocery();
            };
        }
    }

    // Hide save button and fields for restricted items
    if (currentUser && currentUser.role !== 'Admin' && (type === 'chore' || type === 'meal')) {
        const canAdd = false; // Kids can't add chores or meals in this simulation
        if (!canAdd) {
            save.style.display = 'none';
        }
    }

    document.querySelector('.modal-cancel').style.display = 'block';
    save.style.display = 'block';

    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    const cancelBtn = document.querySelector('.modal-cancel');
    cancelBtn.style.display = 'block';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.color = '';
    cancelBtn.onclick = closeModal;
    
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

    // Snacks (shared by snack1 and snack2)
    { name:'Apple slices', slot:'snack', ingredients:['Apples'], icon:'🍎' },
    { name:'Carrot sticks', slot:'snack', ingredients:['Carrots'], icon:'🥕' },
    { name:'Yogurt & Berries', slot:'snack', ingredients:['Yogurt','Berries'], icon:'🍦' },
    { name:'Cheese & Crackers', slot:'snack', ingredients:['Cheese','Crackers'], icon:'🧀' },
    { name:'Hummus & Veggies', slot:'snack', ingredients:['Hummus','Carrots','Celery'], icon:'🧆' },
    { name:'Trail Mix', slot:'snack', ingredients:['Nuts','Granola'], icon:'🥜' },
    { name:'Peanut Butter & Banana', slot:'snack', ingredients:['Peanut butter','Bananas'], icon:'🍌' },
    { name:'Smoothie', slot:'snack', ingredients:['Bananas','Milk','Yogurt','Berries'], icon:'🥤' },
    { name:'Granola Bar', slot:'snack', ingredients:['Granola'], icon:'🍪' },
    { name:'String Cheese', slot:'snack', ingredients:['Cheese'], icon:'🧀' },
    { name:'Pretzels', slot:'snack', ingredients:['Pretzels'], icon:'🥨' },
    { name:'Popcorn', slot:'snack', ingredients:['Popcorn'], icon:'🍿' },
    { name:'Rice Cakes', slot:'snack', ingredients:['Rice'], icon:'🍚' },
    { name:'Fruit Cup', slot:'snack', ingredients:['Apples','Bananas','Grapes'], icon:'🍇' },
    { name:'Edamame', slot:'snack', ingredients:['Edamame'], icon:'🌱' },
];

// ========== SMART MEAL SUGGESTIONS ==========
function getAvailableIngredients() {
    // All grocery items (both purchased and on the list) count as available
    return GROCERY.map(g => g.name.toLowerCase());
}

function getRecipeSuggestions(slot) {
    const available = getAvailableIngredients();
    // snack1 and snack2 both use the 'snack' slot
    const lookupSlot = (slot === 'snack1' || slot === 'snack2') ? 'snack' : slot;
    const slotRecipes = RECIPES.filter(r => r.slot === lookupSlot);

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

    const slotLabels = {
        breakfast: { label: 'Breakfast', icon: '🌅' },
        snack1:    { label: 'AM Snack',  icon: '🍎' },
        lunch:     { label: 'Lunch',     icon: '☀️' },
        snack2:    { label: 'PM Snack',  icon: '🥨' },
        dinner:    { label: 'Dinner',    icon: '🌙' },
    };
    const { label: slotLabel, icon: slotIcon } = slotLabels[slot] || { label: slot, icon: '🍽️' };

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
    const lookupSlot2 = (slot === 'snack1' || slot === 'snack2') ? 'snack' : slot;
    const allRecipeNames = RECIPES.filter(r => r.slot === lookupSlot2).map(r => r.name);
    const chips = allRecipeNames.map(s =>
        `<div class="form-chip ${s===current?'selected':''}" onclick="this.closest('.modal-body').querySelector('#meal-title').value='${s}'; selectFreq(this)">${getMealIcon(s, '')} ${s}</div>`
    ).join('');

    // If no options exist, show an Add to Grocery button
    const noOptionsHtml = allRecipeNames.length === 0 ? `
        <div style="text-align:center; padding: 12px 0; color: var(--text-muted); font-size:13px;">
            No ${slotLabel.toLowerCase()} options in your grocery list yet.
        </div>
        <button class="btn-primary" style="width:100%; margin-top:4px;"
            onclick="openModal('grocery',{prefill:''});">
            + Add Snack Items to Grocery List
        </button>
    ` : '';

    return `
        <div class="form-section">
            <span class="form-section-label">${slotIcon} ${slotLabel} — ${dayLabel}</span>
            <input class="form-input" id="meal-title" placeholder="What's for ${slotLabel.toLowerCase()}?" value="${current}" autofocus>
        </div>
        ${suggestionsHtml}
        <div class="form-section">
            <span class="form-section-label">All Options</span>
            <div class="form-chips">${chips}</div>
            ${noOptionsHtml}
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

const GROCERY_AUTO_MAP = {
    // Produce
    'apple':'Produce', 'banana':'Produce', 'orange':'Produce', 'grape':'Produce', 'strawberry':'Produce', 'blueberry':'Produce', 'raspberry':'Produce', 'blackberry':'Produce', 'melon':'Produce', 'watermelon':'Produce', 'pineapple':'Produce', 'mango':'Produce', 'peach':'Produce', 'pear':'Produce', 'plum':'Produce', 'kiwi':'Produce', 'lemon':'Produce', 'lime':'Produce', 'avocado':'Produce', 'tomato':'Produce', 'lettuce':'Produce', 'spinach':'Produce', 'kale':'Produce', 'broccoli':'Produce', 'cauliflower':'Produce', 'carrot':'Produce', 'potato':'Produce', 'onion':'Produce', 'garlic':'Produce', 'cucumber':'Produce', 'pepper':'Produce', 'celery':'Produce', 'asparagus':'Produce', 'zucchini':'Produce', 'mushroom':'Produce', 'corn':'Produce', 'cabbage':'Produce', 'eggplant':'Produce', 'radish':'Produce', 'potato':'Produce', 'sweet potato':'Produce', 'yam':'Produce', 'ginger':'Produce', 'herb':'Produce', 'cilantro':'Produce', 'parsley':'Produce', 'basil':'Produce',
    // Dairy
    'milk':'Dairy', 'cheese':'Dairy', 'yogurt':'Dairy', 'butter':'Dairy', 'cream':'Dairy', 'sour cream':'Dairy', 'cottage cheese':'Dairy', 'egg':'Dairy', 'margarine':'Dairy', 'almond milk':'Dairy', 'soy milk':'Dairy', 'oat milk':'Dairy', 'kefir':'Dairy',
    // Meat
    'chicken':'Meat', 'beef':'Meat', 'pork':'Meat', 'turkey':'Meat', 'steak':'Meat', 'ground beef':'Meat', 'bacon':'Meat', 'sausage':'Meat', 'ham':'Meat', 'salmon':'Meat', 'shrimp':'Meat', 'fish':'Meat', 'tuna':'Meat', 'lamb':'Meat', 'duck':'Meat', 'salami':'Meat', 'pepperoni':'Meat', 'cod':'Meat', 'tilapia':'Meat',
    // Bakery
    'bread':'Bakery', 'bagel':'Bakery', 'muffin':'Bakery', 'croissant':'Bakery', 'tortilla':'Bakery', 'pita':'Bakery', 'bun':'Bakery', 'roll':'Bakery', 'baguette':'Bakery', 'cake':'Bakery', 'cookie':'Bakery', 'pie':'Bakery', 'donut':'Bakery', 'pastry':'Bakery',
    // Pantry
    'pasta':'Pantry', 'rice':'Pantry', 'flour':'Pantry', 'sugar':'Pantry', 'oil':'Pantry', 'olive oil':'Pantry', 'vinegar':'Pantry', 'salt':'Pantry', 'pepper':'Pantry', 'spice':'Pantry', 'sauce':'Pantry', 'tomato sauce':'Pantry', 'ketchup':'Pantry', 'mustard':'Pantry', 'mayo':'Pantry', 'honey':'Pantry', 'syrup':'Pantry', 'jam':'Pantry', 'jelly':'Pantry', 'peanut butter':'Pantry', 'cereal':'Pantry', 'oats':'Pantry', 'quinoa':'Pantry', 'bean':'Pantry', 'lentil':'Pantry', 'chickpea':'Pantry', 'soup':'Pantry', 'broth':'Pantry', 'tuna can':'Pantry', 'coffee':'Pantry', 'tea':'Pantry', 'baking powder':'Pantry', 'baking soda':'Pantry', 'vanilla':'Pantry',
    // Beverages
    'water':'Beverages', 'juice':'Beverages', 'soda':'Beverages', 'pop':'Beverages', 'coke':'Beverages', 'beer':'Beverages', 'wine':'Beverages', 'spirits':'Beverages', 'energy drink':'Beverages', 'sports drink':'Beverages', 'tea':'Beverages', 'coffee':'Beverages', 'sparkling water':'Beverages',
    // Frozen
    'ice cream':'Frozen', 'frozen pizza':'Frozen', 'frozen vegetable':'Frozen', 'frozen fruit':'Frozen', 'pizza':'Frozen', 'nugget':'Frozen', 'frozen meal':'Frozen', 'waffle':'Frozen', 'ice':'Frozen', 'sorbet':'Frozen',
    // Snacks
    'chip':'Snacks', 'cracker':'Snacks', 'nut':'Snacks', 'popcorn':'Snacks', 'pretzel':'Snacks', 'candy':'Snacks', 'chocolate':'Snacks', 'granola bar':'Snacks', 'trail mix':'Snacks', 'beef jerky':'Snacks', 'gum':'Snacks',
};

function renderGroceryForm(prefill = '', editIdx = undefined) {
    const item = editIdx !== undefined ? GROCERY[editIdx] : null;
    const itemName = item ? item.name : prefill;
    const itemBrand = item ? (item.brand || '') : '';
    const itemQty = item ? (item.qty || '') : '';
    const itemWho = item ? item.who : 0;
    const itemCat = item ? item.category : 'Other';

    const cats = GROCERY_CATS.map((c,i) => {
        const selected = item ? (c.name === itemCat) : (i === 0);
        return `<div class="cat-option ${selected?'selected':''}" data-cat="${c.name}" data-icon="${c.icon}" onclick="selectCat(this)">
            <span class="cat-emoji">${c.icon}</span>
            <span>${c.name}</span>
        </div>`;
    }).join('');

    const members = FAMILY.map((m,i) =>
        `<div class="form-chip ${i===itemWho?'selected':''}" data-who="${i}" onclick="selectFreq(this)">
            ${m.emoji} ${m.name}
        </div>`
    ).join('');

    setTimeout(() => {
        const nameInput = document.getElementById('gr-name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase().trim();
                let foundCat = 'Other';
                for (const [key, cat] of Object.entries(GROCERY_AUTO_MAP)) {
                    if (val.includes(key)) {
                        foundCat = cat;
                        break;
                    }
                }
                if (foundCat !== 'Other') {
                    const options = document.querySelectorAll('#gr-cats .cat-option');
                    options.forEach(opt => {
                        if (opt.dataset.cat === foundCat) {
                            selectCat(opt);
                        }
                    });
                }
            });
            // Trigger immediately if prefilled
            if (prefill) {
                nameInput.dispatchEvent(new Event('input'));
            }
        }
    }, 100);

    return `
        <div class="form-section">
            <span class="form-section-label">Item Details</span>
            <input class="form-input" id="gr-name" placeholder="Item name" value="${itemName.replace(/"/g, '&quot;')}" autofocus>
            <div style="display:flex; gap:8px;">
                <input class="form-input" id="gr-brand" placeholder="Brand (optional)" value="${itemBrand.replace(/"/g, '&quot;')}" style="flex:1">
                <input class="form-input" id="gr-qty" placeholder="Qty (optional)" value="${itemQty.replace(/"/g, '&quot;')}" style="flex:0.6">
            </div>
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

    const brand = document.getElementById('gr-brand').value.trim();
    const qty = document.getElementById('gr-qty').value.trim();
    const catEl = document.querySelector('#gr-cats .cat-option.selected');
    const whoEl = document.querySelector('#gr-who .form-chip.selected');
    const category = catEl?.dataset.cat || 'Other';
    const icon = catEl?.dataset.icon || '🛒';
    const who = parseInt(whoEl?.dataset.who || '0');

    if (modalState.editIdx !== undefined) {
        // Update existing
        const item = GROCERY[modalState.editIdx];
        item.name = name;
        item.brand = brand;
        item.qty = qty;
        item.category = category;
        item.icon = icon;
        item.who = who;
    } else {
        // Add new
        GROCERY.push({ name, brand, qty, category, icon, done: false, who });
    }
    
    closeModal();
    renderGrocery();
}

// ========== WEATHER OVERLAY ==========
let weatherDataCache = null;

function fetchWeather() {
    if (!navigator.geolocation) {
        setWeatherError("Geolocation is not supported by this browser.");
        return;
    }
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Use Open-Meteo API
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`;
        
        fetch(url).then(res => res.json()).then(data => {
            weatherDataCache = data;
            // Update top header weather
            const topTemp = document.getElementById('weatherTempTop');
            const topIcon = document.getElementById('weatherIconTop');
            if (topTemp && data.current_weather) {
                topTemp.textContent = Math.round(data.current_weather.temperature) + '°';
                topIcon.textContent = getWeatherEmoji(data.current_weather.weathercode);
            }
        }).catch(err => {
            console.error("Weather fetch failed", err);
            setWeatherError("Failed to fetch weather data.");
        });
    }, err => {
        setWeatherError("Location access denied.");
    });
}

function setWeatherError(msg) {
    const topTemp = document.getElementById('weatherTempTop');
    if (topTemp) topTemp.textContent = '--°';
    const wb = document.getElementById('weatherBody');
    if (wb) wb.innerHTML = `<div style="color:var(--danger);">${msg}</div>`;
}

function openWeatherModal() {
    const modal = document.getElementById('weatherModal');
    if (modal) modal.classList.add('active');
    
    const body = document.getElementById('weatherBody');
    if (!weatherDataCache) {
        body.innerHTML = '<div>Fetching local weather...</div>';
        fetchWeather(); // Try again
        return;
    }
    
    // Render Weather Data
    const c = weatherDataCache.current_weather;
    const d = weatherDataCache.daily;
    
    let html = `
        <div style="margin-bottom: 24px;">
            <div style="font-size: 64px;">${getWeatherEmoji(c.weathercode)}</div>
            <div style="font-size: 48px; font-weight: 700;">${Math.round(c.temperature)}°F</div>
            <div style="font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Current Weather</div>
        </div>
        <div style="text-align: left;">
            <h4 style="margin-bottom: 12px; font-size: 14px; color: var(--text-muted);">Upcoming Week</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
    `;
    
    for (let i = 0; i < 7; i++) {
        if (!d.time[i]) break;
        const dateObj = new Date(d.time[i] + 'T12:00:00'); // append time to avoid timezone shifts
        const dayStr = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const icon = getWeatherEmoji(d.weathercode[i]);
        const max = Math.round(d.temperature_2m_max[i]);
        const min = Math.round(d.temperature_2m_min[i]);
        
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 12px; background:var(--bg-secondary); border-radius: 8px;">
                <span style="font-weight: 600; width: 60px;">${dayStr}</span>
                <span style="font-size: 20px;">${icon}</span>
                <span style="font-size: 14px;"><span style="color:var(--text-muted);">${min}°</span> / <span style="font-weight:600;">${max}°</span></span>
            </div>
        `;
    }
    
    html += `</div></div>`;
    body.innerHTML = html;
}

function closeWeatherModal() {
    const modal = document.getElementById('weatherModal');
    if (modal) modal.classList.remove('active');
}

function getWeatherEmoji(code) {
    // Open-Meteo WMO codes
    if (code === 0) return '☀️'; // Clear sky
    if (code === 1 || code === 2 || code === 3) return '⛅'; // Partly cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 67) return '🌧️'; // Drizzle / Rain
    if (code >= 71 && code <= 77) return '❄️'; // Snow
    if (code >= 80 && code <= 82) return '🌧️'; // Showers
    if (code >= 85 && code <= 86) return '🌨️'; // Snow showers
    if (code >= 95) return '⛈️'; // Thunderstorm
    return '🌡️';
}
