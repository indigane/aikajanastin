# Project Plan - Timeline App

1. *Create `AGENTS.md` and `PLAN.md`.*
   - Create `AGENTS.md` linking to `PLAN.md`.
   - Create `PLAN.md` with the initial project roadmap.
2. *Set up the core application files.*
   - Create the main application files (HTML, CSS, JS).
   - Use `list_files` to verify that the files exist.
3. *Implement basic layout and themes.*
   - Define CSS variables for Light, Dark, and Sepia themes.
   - Implement the basic layout in HTML and CSS: top control bar, scrollable timeline, and fixed bottom input bar.
   - Use `read_file` to verify the initial HTML and CSS implementation.
4. *Add date picker HTML structure.*
   - Add the HTML for a full-screen date picker overlay to the main HTML file.
5. *Add date picker CSS.*
   - Add the CSS for the grid of buttons (Days, Months, Years) as specified in the requirements.
6. *Implement date picker JS logic.*
   - Add JS logic to handle button selections and update the date display.
   - Use `read_file` to verify the date picker implementation.
7. *Add text input expansion CSS.*
   - Add CSS classes to expand the text input to full screen when active.
8. *Add text input expansion JS.*
   - Add JS event listeners to the text input for `focus` and `blur` to toggle the expansion classes.
   - Use `read_file` to verify the text expansion implementation.
9. *Implement localStorage integration.*
   - Add JS functions to save and load entries from `localStorage`.
10. *Implement chronological sorting logic.*
    - Add JS logic to sort entries based on their custom date format.
    - Use `read_file` to verify the persistence and sorting logic.
11. *Implement timeline rendering.*
    - Implement the logic to render the sorted list of entries into the timeline area.
    - Use `read_file` to verify the rendering logic.
12. *Add entry duplication button.*
    - Add a 'Duplicate' button to each timeline entry in the rendering code.
13. *Implement entry duplication logic.*
    - Add JS logic to copy the entry's date (but not text) to the input area when 'Duplicate' is clicked.
    - Use `read_file` to verify the duplication feature.
14. *Add export button.*
    - Add an 'Export' button to the top control bar.
15. *Implement export functionality.*
    - Add JS logic to generate a text representation of all entries and trigger a download.
    - Use `read_file` to verify the export functionality.
16. *Add theme toggle buttons.*
    - Add theme toggle buttons (Light, Dark, Sepia) to the top control bar.
17. *Implement theme switching logic.*
    - Add JS logic to switch themes by updating a data-theme attribute on the body.
    - Use `read_file` to verify the theme switching implementation.
18. *Perform specific verification tasks.*
    - Verify the date picker correctly updates the date button label.
    - Verify entries are correctly saved to and loaded from `localStorage`.
    - Verify entries are displayed in chronological order regardless of input order.
    - Verify the text input expands on focus and collapses on blur.
    - Verify duplication only copies the date.
    - Verify themes (Light, Dark, Sepia) apply correctly.
    - Verify the export file contains all entries in chronological order.
19. *Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.*
20. *Submit the change.*
    - Commit and submit the project.
