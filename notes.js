

// Wait for DOM to load, with a short delay to ensure elements are rendered
document.addEventListener("DOMContentLoaded", function () {
    setTimeout(initializeApp, 50);
});

let notes = [];
let noteToDeleteID = null;
let isEditing = false;
let editNoteIndex = null;
let selectedColor = "#ffffff"; // Default note color

function initializeApp() {
    // Cache DOM elements
    const notesContainer = document.getElementById("notesContainer");
    const addNoteBtn = document.getElementById("addNoteBtn");
    const addNoteModal = document.getElementById("addNoteModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const noteForm = document.getElementById("noteForm");
    const searchInput = document.getElementById("searchInput");
    const emptyState = document.getElementById("emptyState");
    const confirmModal = document.getElementById("confirmModal");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    // Retry if not all elements are loaded
    if (
        !notesContainer || !addNoteBtn || !addNoteModal || !closeModalBtn ||
        !noteForm || !searchInput || !emptyState ||
        !confirmModal || !cancelDeleteBtn || !confirmDeleteBtn
    ) {
        console.warn("Some DOM elements not found yet. Retrying...");
        setTimeout(initializeApp, 50);
        return;
    }

    // Load saved notes from localStorage
    notes = JSON.parse(localStorage.getItem("notes")) || [];
    renderNotes();
    updateEmptyState();

    // Initialize SortableJS on the notes container
    // This allows dragging notes to reorder them
    new Sortable(notesContainer, {
        animation: 150,
        ghostClass: "sortable-ghost",
        onEnd: () => {
            // Update notes array to match the new DOM order after drag
            const newOrder = Array.from(notesContainer.children).map(noteEl => {
                // Each note has edit-btn with data-id matching original notes index
                const editBtn = noteEl.querySelector('.edit-btn');
                const oldIndex = parseInt(editBtn.dataset.id);
                return notes[oldIndex];
            });
            notes = newOrder;
            saveNotes();
            renderNotes();  // Re-render so data-ids and event listeners are correct
            updateEmptyState();
        }
    });

    // Event listeners
    addNoteBtn.addEventListener("click", () => openAddNoteModal(addNoteModal));
    closeModalBtn.addEventListener("click", () => closeAddNoteModal(addNoteModal, noteForm));
    noteForm.addEventListener("submit", (e) => handleNoteSubmit(e, addNoteModal, noteForm));
    searchInput.addEventListener("input", filterNotes);
    cancelDeleteBtn.addEventListener("click", () => closeConfirmModal(confirmModal));
    confirmDeleteBtn.addEventListener("click", () => confirmDeleteNote(confirmModal));

    setupColorOptions(); // Setup color option click handlers
}

// Render all notes or filtered ones
function renderNotes(notesToRender = notes) {
    const notesContainer = document.getElementById("notesContainer");
    notesContainer.innerHTML = "";

    notesToRender.forEach((note, index) => {
        const noteElement = document.createElement("div");
        noteElement.className = "note-card fade-in";
        noteElement.style.backgroundColor = note.color || "#ffffff";

        noteElement.innerHTML = `
            <div class="note-content">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-actions">
                        <button class="edit-btn" data-id="${index}">
                            <span class="material-symbols-rounded">edit</span>
                        </button>
                        <button class="delete-btn" data-id="${index}">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                    </div>
                </div>
                <p class="note-text">${note.content}</p>
                <div class="note-footer">
                    <span class="note-date">Last Updated: ${formatDate(note.date)}</span>
                </div>
            </div>
        `;

        notesContainer.appendChild(noteElement);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            noteToDeleteID = parseInt(this.getAttribute("data-id"));
            openConfirmModal();
        });
    });

    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const index = parseInt(this.getAttribute("data-id"));
            const note = notes[index];

            document.getElementById("noteTitle").value = note.title;
            document.getElementById("noteContent").value = note.content;

            isEditing = true;
            selectedColor = note.color || "#ffffff";

            // Preselect the correct color
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.toggle('selected', opt.dataset.color === selectedColor);
            });

            openAddNoteModal(document.getElementById("addNoteModal"));
        });
    });
}

// Setup click handlers for color selection
function setupColorOptions() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedColor = option.dataset.color;
        });
    });
}


function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function openAddNoteModal(modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeAddNoteModal(modal, form) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
    form.reset();
    selectedColor = "#ffffff";
    isEditing = false;
    editNoteIndex = null;

    // Reset color selection
    document.querySelectorAll(".color-option").forEach(o => o.classList.remove("selected"));
}

function openConfirmModal() {
    const confirmModal = document.getElementById("confirmModal");
    confirmModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeConfirmModal(modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteToDeleteID = null;
}

function handleNoteSubmit(e, modal, form) {
    e.preventDefault();

    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();



    const newNote = {
        title,
        content,
        color: selectedColor,
        date: new Date().toISOString(),
    };

    if (isEditing && editNoteIndex !== null) {
        notes[editNoteIndex] = newNote;
    } else {
        notes.unshift(newNote);
    }

    saveNotes();
    renderNotes();
    closeAddNoteModal(modal, form);
    updateEmptyState();
    filterNotes();
}

function confirmDeleteNote(modal) {
    if (noteToDeleteID !== null) {
        notes.splice(noteToDeleteID, 1);
        saveNotes();
        renderNotes();
        updateEmptyState();
        filterNotes();
        closeConfirmModal(modal);
    }
}

function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
}

function filterNotes() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const filterValue = document.getElementById("filterSelect").value;

    let filteredNotes = notes;

    if (searchTerm) {
        filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
    }

    renderNotes(filteredNotes);
    updateEmptyState(filteredNotes);
}

function updateEmptyState(notesToCheck = notes) {
    const emptyState = document.getElementById("emptyState");
    emptyState.style.display = notesToCheck.length === 0 ? "block" : "none";
}
