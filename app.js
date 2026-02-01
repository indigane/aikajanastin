// State management
let state = {
    entries: [],
    selectedDate: {
        year: 2023,
        month: 1,
        day: 1
    },
    theme: 'light'
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initDate();
    renderTimeline();

    // Event Listeners
    document.getElementById('date-btn').addEventListener('click', openDatePicker);
    document.getElementById('close-picker-btn').addEventListener('click', closeDatePicker);
    document.getElementById('text-input').addEventListener('focus', expandTextInput);
    document.getElementById('close-expansion-btn').addEventListener('click', collapseTextInput);
    document.getElementById('add-btn').addEventListener('click', addEntry);
    document.getElementById('export-btn').addEventListener('click', exportEntries);
});

function expandTextInput() {
    const input = document.getElementById('text-input');
    const closeBtn = document.getElementById('close-expansion-btn');
    input.classList.add('expanded');
    closeBtn.classList.remove('hidden');
}

function collapseTextInput() {
    const input = document.getElementById('text-input');
    const closeBtn = document.getElementById('close-expansion-btn');
    input.classList.remove('expanded');
    closeBtn.classList.add('hidden');
    input.blur();
}

function addEntry() {
    const input = document.getElementById('text-input');
    const text = input.value.trim();
    if (!text) return;

    const newEntry = {
        id: Date.now(),
        date: { ...state.selectedDate },
        text: text
    };

    state.entries.push(newEntry);
    saveToLocalStorage();
    renderTimeline();
    
    input.value = '';
    if (input.classList.contains('expanded')) {
        collapseTextInput();
    }
}

function initDate() {
    const now = new Date();
    state.selectedDate = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
    };
    updateDateButton();
}

function updateDateButton() {
    const { year, month, day } = state.selectedDate;
    const dateBtn = document.getElementById('date-btn');
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dateBtn.textContent = dateStr;
    document.getElementById('picker-preview').textContent = dateStr;
}

// Date Picker Logic
function openDatePicker() {
    document.getElementById('date-picker').classList.remove('hidden');
    highlightSelectedDate();
}

function closeDatePicker() {
    document.getElementById('date-picker').classList.add('hidden');
}

function highlightSelectedDate() {
    const { year, month, day } = state.selectedDate;
    
    // Day
    const dayTens = Math.floor(day / 10);
    const dayOnes = day % 10;
    updateSelection('day-tens', dayTens);
    updateSelection('day-ones', dayOnes);

    // Month
    updateSelection('month-row-1', month);
    updateSelection('month-row-2', month);

    // Year
    const century = Math.floor(year / 100);
    const yearTens = Math.floor((year % 100) / 10);
    const yearOnes = year % 10;
    updateSelection('year-century', century);
    updateSelection('year-tens', yearTens);
    updateSelection('year-ones', yearOnes);
}

function updateSelection(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll('button');
    buttons.forEach(btn => {
        const btnValue = parseInt(btn.textContent);
        if (btnValue === value) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function pickDayTens(val) {
    const ones = state.selectedDate.day % 10;
    state.selectedDate.day = val * 10 + ones;
    if (state.selectedDate.day === 0) state.selectedDate.day = 1;
    updateDateButton();
    updateSelection('day-tens', val);
}

function pickDayOnes(val) {
    const tens = Math.floor(state.selectedDate.day / 10);
    state.selectedDate.day = tens * 10 + val;
    if (state.selectedDate.day === 0) state.selectedDate.day = 1;
    updateDateButton();
    updateSelection('day-ones', val);
}

function pickMonth(val) {
    state.selectedDate.month = val;
    updateDateButton();
    updateSelection('month-row-1', val);
    updateSelection('month-row-2', val);
}

function pickCentury(val) {
    const rest = state.selectedDate.year % 100;
    state.selectedDate.year = val * 100 + rest;
    updateDateButton();
    updateSelection('year-century', val);
}

function pickYearTens(val) {
    const century = Math.floor(state.selectedDate.year / 100);
    const ones = state.selectedDate.year % 10;
    state.selectedDate.year = century * 100 + val * 10 + ones;
    updateDateButton();
    updateSelection('year-tens', val);
}

function pickYearOnes(val) {
    const century = Math.floor(state.selectedDate.year / 100);
    const tens = Math.floor((state.selectedDate.year % 100) / 10);
    state.selectedDate.year = century * 100 + tens * 10 + val;
    updateDateButton();
    updateSelection('year-ones', val);
}

function loadFromLocalStorage() {
    const savedEntries = localStorage.getItem('timeline-entries');
    if (savedEntries) {
        state.entries = JSON.parse(savedEntries);
    }
    const savedTheme = localStorage.getItem('timeline-theme');
    if (savedTheme) {
        setTheme(savedTheme, false);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light', false);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('timeline-entries', JSON.stringify(state.entries));
}

function saveThemeToLocalStorage() {
    localStorage.setItem('timeline-theme', state.theme);
}

function getSortedEntries() {
    return [...state.entries].sort((a, b) => {
        if (a.date.year !== b.date.year) return a.date.year - b.date.year;
        if (a.date.month !== b.date.month) return a.date.month - b.date.month;
        if (a.date.day !== b.date.day) return a.date.day - b.date.day;
        return a.id - b.id; // Tie-breaker
    });
}

function duplicateEntryDate(id) {
    const entry = state.entries.find(e => e.id === id);
    if (entry) {
        state.selectedDate = { ...entry.date };
        updateDateButton();
        // Scroll to bottom input area if needed, but usually it's fixed.
        document.getElementById('text-input').focus();
    }
}

function setTheme(theme, save = true) {
    state.theme = theme;
    document.body.setAttribute('data-theme', theme);
    if (save) saveThemeToLocalStorage();
}

function exportEntries() {
    const sortedEntries = getSortedEntries();
    let text = "Timeline Export\n\n";
    sortedEntries.forEach(entry => {
        const dateStr = `${entry.date.year}-${String(entry.date.month).padStart(2, '0')}-${String(entry.date.day).padStart(2, '0')}`;
        text += `[${dateStr}]\n${entry.text}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timeline-export.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function renderTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    const sortedEntries = getSortedEntries();

    sortedEntries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'entry';
        const dateStr = `${entry.date.year}-${String(entry.date.month).padStart(2, '0')}-${String(entry.date.day).padStart(2, '0')}`;
        div.innerHTML = `
            <div class="entry-header">
                <span class="entry-date">${dateStr}</span>
                <button class="duplicate-btn" onclick="duplicateEntryDate(${entry.id})">Duplicate</button>
            </div>
            <div class="entry-text">${entry.text}</div>
        `;
        timeline.appendChild(div);
    });
}
