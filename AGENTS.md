# Agent Instructions

This project is a mobile web app for recording date-based events (text snippets) in chronological order.

## Core Principles
- **Efficiency & Clarity**: The app is designed for a single user with a focus on speed of input and browsing.
- **Utility over Aesthetics**: It does not need "sex appeal"; it just needs to be functional and readable.
- **Mobile-First**: Optimized for mobile browser usage (e.g., using `100dvh` for height).

## Technical Stack
- **Vanilla JS & CSS**: No external libraries or frameworks.
- **No Dependencies**: Everything must be implemented from scratch.
- **LocalStorage**: Used for all data persistence.
- **Custom Date Handling**: Prefer simple logic for handling year/month/day components to support the custom UI.

## Functional Specification
- **Chronological Timeline**: Events can be entered in any order but are always displayed in a vertically scrollable, compact, chronological list.
- **Bottom Input Bar**: Contains a date selection button and a text input.
- **Efficient Date Picker**: Tapping the date button opens a full-screen overlay with a grid of buttons for Day, Month, and Year (century, tens, and ones). This UI is optimized for quick tapping without scrolling.
- **Expanding Text Input**: When the text input is focused, it expands to occupy the maximum available screen space (accounting for the on-screen keyboard) to provide a focused writing environment.
- **Entry Duplication**: Users can duplicate an entry to pre-fill the date input with that entry's date (text is not copied). This helps in adding multiple entries for the same or nearby dates.
- **Top Controls**: Includes theme toggling and data export.
- **Themes**: Support for Light, Dark, and Sepia modes. Themes default to system preference but persist to LocalStorage once manually selected.
- **Export**: Ability to export the entire timeline as a text file.
