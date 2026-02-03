// State management
let state = {
    entries: [],
    selectedDate: {
        year: 1993,
        month: 1,
        day: 1
    },
    theme: 'light',
    dateFormat: 'locale',
    sortDirection: 'asc',
    readOnly: false,
    editingId: null,
    originalEntryData: null
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
    document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
    document.getElementById('done-btn').addEventListener('click', collapseTextInput);
    document.getElementById('new-btn').addEventListener('click', exitEditMode);
    document.getElementById('delete-btn').addEventListener('click', deleteEntry);
    document.getElementById('settings-btn').addEventListener('click', openSettings);
    document.getElementById('close-settings-btn').addEventListener('click', closeSettings);
    document.getElementById('settings-date-format-toggle').addEventListener('click', toggleDateFormat);
    document.getElementById('settings-sort-direction-toggle').addEventListener('click', toggleSortDirection);
    document.getElementById('settings-read-only-toggle').addEventListener('click', toggleReadOnly);
    document.getElementById('settings-export-btn').addEventListener('click', exportEntries);

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustForVisualViewport);
        window.visualViewport.addEventListener('scroll', adjustForVisualViewport);
    }
});

function adjustForVisualViewport() {
    const vv = window.visualViewport;
    if (!vv) return;

    const input = document.getElementById('text-input');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const doneBtn = document.getElementById('done-btn');

    if (navigator.virtualKeyboard && navigator.virtualKeyboard.overlaysContent) {
        input.style.height = '';
        input.style.top = '';
        cancelBtn.style.bottom = '';
        deleteBtn.style.bottom = '';
        doneBtn.style.bottom = '';
        return;
    }

    if (input.classList.contains('expanded')) {
        input.style.height = `${vv.height}px`;
        input.style.top = `${vv.offsetTop}px`;

        const bottomOffset = window.innerHeight - vv.height - vv.offsetTop;
        cancelBtn.style.bottom = `${bottomOffset + 20}px`;
        deleteBtn.style.bottom = `${bottomOffset + 20}px`;
        doneBtn.style.bottom = `${bottomOffset + 20}px`;
    } else {
        input.style.height = '';
        input.style.top = '';
        cancelBtn.style.bottom = '';
        deleteBtn.style.bottom = '';
        doneBtn.style.bottom = '';
    }
}

function expandTextInput() {
    const input = document.getElementById('text-input');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const doneBtn = document.getElementById('done-btn');
    input.classList.add('expanded');
    cancelBtn.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    doneBtn.classList.remove('hidden');
    adjustForVisualViewport();
}

function collapseTextInput() {
    const input = document.getElementById('text-input');
    const cancelBtn = document.getElementById('cancel-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const doneBtn = document.getElementById('done-btn');
    input.classList.remove('expanded');
    cancelBtn.classList.add('hidden');
    deleteBtn.classList.add('hidden');
    doneBtn.classList.add('hidden');
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
    state.originalEntryData = { text: entry.text, date: { ...entry.date } };
    state.selectedDate = { ...entry.date };
    document.getElementById('text-input').value = entry.text;
    updateDateButton();
    renderTimeline(); // Highlight the editing entry
}

function exitEditMode() {
    state.editingId = null;
    state.originalEntryData = null;
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

function cancelEdit() {
    if (state.editingId !== null) {
        if (state.originalEntryData) {
            // Restore original data
            const entry = state.entries.find(e => e.id === state.editingId);
            if (entry) {
                entry.text = state.originalEntryData.text;
                entry.date = { ...state.originalEntryData.date };
            }
        } else {
            // It was a new entry, remove it
            state.entries = state.entries.filter(e => e.id !== state.editingId);
        }
        saveToLocalStorage();
        renderTimeline();
    }
    exitEditMode();
}

function initDate() {
    state.selectedDate = {
        year: 1993,
        month: 1,
        day: 1
    };
    updateDateButton();
}

function updateDateButton() {
    const { year, month, day } = state.selectedDate;
    const dateBtn = document.getElementById('date-btn');
    const date = Temporal.PlainDate.from({ year, month, day });
    const dateStr = date.toString();
    dateBtn.textContent = dateStr;
    document.getElementById('picker-preview').textContent = dateStr;
}

// Settings Logic
function openSettings() {
    document.getElementById('settings-view').classList.remove('hidden');
    updateSettingsUI();
}

function closeSettings() {
    document.getElementById('settings-view').classList.add('hidden');
}

function updateSettingsUI() {
    const dateFormatBtn = document.getElementById('settings-date-format-toggle');
    const sampleDate = Temporal.PlainDate.from({ year: 1993, month: 1, day: 1 });
    const formatStr = state.dateFormat === 'iso-weekday'
        ? `${sampleDate.toString()}, ${sampleDate.toLocaleString('en-US', { weekday: 'short' })}`
        : sampleDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    dateFormatBtn.textContent = `Format: ${formatStr}`;

    const sortBtn = document.getElementById('settings-sort-direction-toggle');
    sortBtn.textContent = state.sortDirection === 'asc' ? 'Sort: Ascending' : 'Sort: Descending';

    const readOnlyBtn = document.getElementById('settings-read-only-toggle');
    readOnlyBtn.textContent = state.readOnly ? 'Read-Only: On' : 'Read-Only: Off';
}

function toggleSortDirection() {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    saveSortDirectionToLocalStorage();
    updateSettingsUI();
    renderTimeline();
}

function toggleReadOnly() {
    state.readOnly = !state.readOnly;
    saveReadOnlyToLocalStorage();
    updateSettingsUI();
    renderTimeline();
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
    const savedDateFormat = localStorage.getItem('timeline-date-format');
    if (savedDateFormat) {
        state.dateFormat = savedDateFormat;
    }
    const savedSortDirection = localStorage.getItem('timeline-sort-direction');
    if (savedSortDirection) {
        state.sortDirection = savedSortDirection;
    }
    const savedReadOnly = localStorage.getItem('timeline-read-only');
    if (savedReadOnly) {
        state.readOnly = savedReadOnly === 'true';
    }
}

function saveToLocalStorage() {
    localStorage.setItem('timeline-entries', JSON.stringify(state.entries));
}

function saveThemeToLocalStorage() {
    localStorage.setItem('timeline-theme', state.theme);
}

function saveDateFormatToLocalStorage() {
    localStorage.setItem('timeline-date-format', state.dateFormat);
}

function saveSortDirectionToLocalStorage() {
    localStorage.setItem('timeline-sort-direction', state.sortDirection);
}

function saveReadOnlyToLocalStorage() {
    localStorage.setItem('timeline-read-only', state.readOnly);
}

function toggleDateFormat() {
    state.dateFormat = state.dateFormat === 'iso-weekday' ? 'locale' : 'iso-weekday';
    saveDateFormatToLocalStorage();
    updateSettingsUI();
    renderTimeline();
}

function getSortedEntries() {
    return [...state.entries].sort((a, b) => {
        let cmp = 0;
        if (a.date.year !== b.date.year) cmp = a.date.year - b.date.year;
        else if (a.date.month !== b.date.month) cmp = a.date.month - b.date.month;
        else if (a.date.day !== b.date.day) cmp = a.date.day - b.date.day;
        else cmp = a.id - b.id; // Tie-breaker

        return state.sortDirection === 'asc' ? cmp : -cmp;
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
        const date = Temporal.PlainDate.from(entry.date);
        const dateStr = date.toString();
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
    
    if (state.readOnly) {
        document.body.classList.add('read-only');
    } else {
        document.body.classList.remove('read-only');
    }

    const sortedEntries = getSortedEntries();

    sortedEntries.forEach(entry => {
        const div = document.createElement('div');
        div.className = 'entry';
        if (state.editingId === entry.id) {
            div.classList.add('editing');
        }

        div.onclick = (e) => {
            if (state.readOnly) return;
            if (e.target.classList.contains('duplicate-btn')) return;
            enterEditMode(entry.id);
        };

        const date = Temporal.PlainDate.from(entry.date);
        const dateStr = state.dateFormat === 'iso-weekday'
            ? `${date.toString()}, ${date.toLocaleString('en-US', { weekday: 'short' })}`
            : date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

        div.innerHTML = `
            <span class="entry-date">${dateStr}</span>
            <span class="entry-text">${entry.text}</span>
            <button class="duplicate-btn" onclick="duplicateEntryDate(${entry.id})">Duplicate</button>
        `;
        timeline.appendChild(div);
    });
}
