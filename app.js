// State management
let state = {
    entries: [],
    selectedDate: {
        year: 2023,
        month: 1,
        day: 1
    },
    theme: 'light',
    editingId: null
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initDate();
    renderTimeline();

    if (navigator.virtualKeyboard) {
        navigator.virtualKeyboard.overlaysContent = true;
    }

    // Event Listeners
    document.getElementById('date-btn').addEventListener('click', openDatePicker);
    document.getElementById('close-picker-btn').addEventListener('click', closeDatePicker);
    document.getElementById('text-input').addEventListener('focus', expandTextInput);
    document.getElementById('text-input').addEventListener('input', autoSave);
    document.getElementById('close-expansion-btn').addEventListener('click', collapseTextInput);
    document.getElementById('new-btn').addEventListener('click', exitEditMode);
    document.getElementById('delete-btn').addEventListener('click', deleteEntry);
    document.getElementById('export-btn').addEventListener('click', exportEntries);

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustForVisualViewport);
        window.visualViewport.addEventListener('scroll', adjustForVisualViewport);
    }
});

function adjustForVisualViewport() {
    const vv = window.visualViewport;
    if (!vv) return;

    const input = document.getElementById('text-input');
    const closeBtn = document.getElementById('close-expansion-btn');
    const deleteBtn = document.getElementById('delete-btn');

    if (navigator.virtualKeyboard && navigator.virtualKeyboard.overlaysContent) {
        input.style.height = '';
        input.style.top = '';
        closeBtn.style.bottom = '';
        deleteBtn.style.bottom = '';
        return;
    }

    if (input.classList.contains('expanded')) {
        input.style.height = `${vv.height}px`;
        input.style.top = `${vv.offsetTop}px`;

        const bottomOffset = window.innerHeight - vv.height - vv.offsetTop;
        closeBtn.style.bottom = `${bottomOffset + 20}px`;
        deleteBtn.style.bottom = `${bottomOffset + 20}px`;
    } else {
        input.style.height = '';
        input.style.top = '';
        closeBtn.style.bottom = '';
        deleteBtn.style.bottom = '';
    }
}

function expandTextInput() {
    const input = document.getElementById('text-input');
    const closeBtn = document.getElementById('close-expansion-btn');
    const deleteBtn = document.getElementById('delete-btn');
    input.classList.add('expanded');
    closeBtn.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    adjustForVisualViewport();
}

function collapseTextInput() {
    const input = document.getElementById('text-input');
    const closeBtn = document.getElementById('close-expansion-btn');
    const deleteBtn = document.getElementById('delete-btn');
    input.classList.remove('expanded');
    closeBtn.classList.add('hidden');
    deleteBtn.classList.add('hidden');
    input.blur();
    adjustForVisualViewport();
}

function autoSave() {
    const input = document.getElementById('text-input');
    const text = input.value;

    if (state.editingId === null) {
        // Create new entry
        const newEntry = {
            id: Date.now(),
            date: { ...state.selectedDate },
            text: text
        };
        state.entries.push(newEntry);
        state.editingId = newEntry.id;
    } else {
        // Update existing entry
        const entry = state.entries.find(e => e.id === state.editingId);
        if (entry) {
            entry.date = { ...state.selectedDate };
            entry.text = text;
        }
    }
    saveToLocalStorage();
    renderTimeline();
}

function enterEditMode(id) {
    const entry = state.entries.find(e => e.id === id);
    if (!entry) return;

    state.editingId = id;
    state.selectedDate = { ...entry.date };
    document.getElementById('text-input').value = entry.text;
    updateDateButton();
    expandTextInput();
    document.getElementById('text-input').focus();
    renderTimeline(); // Highlight the editing entry
}

function exitEditMode() {
    state.editingId = null;
    document.getElementById('text-input').value = '';
    initDate();
    collapseTextInput();
    renderTimeline();
}

function deleteEntry() {
    if (state.editingId !== null) {
        state.entries = state.entries.filter(e => e.id !== state.editingId);
        saveToLocalStorage();
    }
    exitEditMode();
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
    autoSave();
}

function pickDayOnes(val) {
    const tens = Math.floor(state.selectedDate.day / 10);
    state.selectedDate.day = tens * 10 + val;
    if (state.selectedDate.day === 0) state.selectedDate.day = 1;
    updateDateButton();
    updateSelection('day-ones', val);
    autoSave();
}

function pickMonth(val) {
    state.selectedDate.month = val;
    updateDateButton();
    updateSelection('month-row-1', val);
    updateSelection('month-row-2', val);
    autoSave();
}

function pickCentury(val) {
    const rest = state.selectedDate.year % 100;
    state.selectedDate.year = val * 100 + rest;
    updateDateButton();
    updateSelection('year-century', val);
    autoSave();
}

function pickYearTens(val) {
    const century = Math.floor(state.selectedDate.year / 100);
    const ones = state.selectedDate.year % 10;
    state.selectedDate.year = century * 100 + val * 10 + ones;
    updateDateButton();
    updateSelection('year-tens', val);
    autoSave();
}

function pickYearOnes(val) {
    const century = Math.floor(state.selectedDate.year / 100);
    const tens = Math.floor((state.selectedDate.year % 100) / 10);
    state.selectedDate.year = century * 100 + tens * 10 + val;
    updateDateButton();
    updateSelection('year-ones', val);
    autoSave();
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
        state.editingId = null;
        state.selectedDate = { ...entry.date };
        updateDateButton();
        document.getElementById('text-input').value = '';
        autoSave();
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
        if (state.editingId === entry.id) {
            div.classList.add('editing');
        }

        div.onclick = (e) => {
            if (e.target.classList.contains('duplicate-btn')) return;
            enterEditMode(entry.id);
        };

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
