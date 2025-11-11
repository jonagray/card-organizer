// Authentication State
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Card State
let currentPage = 1;
const cardsPerPage = 10;
let allCards = [];
let allOccasions = new Set();
let allFroms = new Set();
let allTos = new Set();
let currentPageIndex = 0;
let cardPages = [];

// API Base URL - loaded from config.js
const API_URL = API_CONFIG.API_URL;

// Helper function to get full image URL (handles both S3 and local URLs)
function getImageUrl(imagePath) {
  // If already a full URL (S3), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise prepend API_URL for local storage
  return `${API_URL}${imagePath}`;
}

// Initialize app on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
});

// Check authentication status
async function checkAuth() {
  if (authToken) {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
        showAuthenticatedView();
        getCards();
      } else {
        // Token is invalid
        logout(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout(false);
    }
  } else {
    showUnauthenticatedView();
  }
}

// Show authenticated view
function showAuthenticatedView() {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('authButtons').style.display = 'none';
  document.getElementById('mobileMenu').style.display = 'none';
  document.getElementById('mobileMenu').classList.remove('active');
  document.getElementById('userMenu').style.display = 'flex';
  document.getElementById('username').textContent = `Hello, ${currentUser.username}!`;
  // Hide the brand name when authenticated
  document.getElementById('navBrand').style.display = 'none';
}

// Show unauthenticated view
function showUnauthenticatedView() {
  document.getElementById('welcomeScreen').style.display = 'flex';
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('authButtons').style.display = 'flex';
  document.getElementById('userMenu').style.display = 'none';
  // Show the brand name when unauthenticated
  document.getElementById('navBrand').style.display = 'block';
}

// Register function
async function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      currentUser = data.user;

      // Clear form
      document.getElementById('registerUsername').value = '';
      document.getElementById('registerEmail').value = '';
      document.getElementById('registerPassword').value = '';

      closeModal('registerModal');
      showAuthenticatedView();
      getCards();
    } else {
      alert(data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
}

// Login function
async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      localStorage.setItem('authToken', authToken);
      currentUser = data.user;

      // Clear form
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';

      closeModal('loginModal');
      showAuthenticatedView();
      getCards();
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
}

// Logout function
function logout(showAlert = true) {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  allCards = [];

  if (showAlert) {
    alert('Logged out successfully');
  }

  showUnauthenticatedView();
}

// Function to Fetch and Display All Cards
async function getCards(resetFilters = false) {
  if (!authToken) {
    console.error('No auth token available');
    return;
  }

  if (resetFilters) {
    document.getElementById("occasionFilter").value = "";
    document.getElementById("fromFilter").value = "";
    document.getElementById("toFilter").value = "";
    document.getElementById("sortOrder").value = "newest";
    document.getElementById("searchQuery").value = "";
    currentPage = 1;
  }

  const occasion = document.getElementById("occasionFilter").value;
  const from = document.getElementById("fromFilter").value;
  const to = document.getElementById("toFilter").value;
  const sort = document.getElementById("sortOrder").value;
  const search = document.getElementById("searchQuery").value.trim();

  let url = `${API_URL}/cards?sort=${sort}&page=${currentPage}&limit=${cardsPerPage}`;
  if (occasion) url += `&occasion=${encodeURIComponent(occasion)}`;
  if (from) url += `&from=${encodeURIComponent(from)}`;
  if (to) url += `&to=${encodeURIComponent(to)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.status === 401) {
      logout();
      return;
    }

    allCards = await response.json();
    const cardsDiv = document.getElementById("cards");
    cardsDiv.innerHTML = "";

    if (allCards.length === 0) {
      cardsDiv.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">No cards found. Click "Add Card" to create your first card!</p>';
      return;
    }

    allCards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.innerHTML = `
        <h3>${card.title}</h3>
        <p><strong>From:</strong> ${card.from}</p>
        <p><strong>To:</strong> ${card.to || 'Not specified'}</p>
        <p><strong>Occasion:</strong> ${card.occasion}</p>
        <div class="pages">
          <img src="${getImageUrl(card.pages[0])}" alt="Card page" style="width: 100%; height: 150px; object-fit: cover; border-radius: 10px;"/>
        </div>
        <div class="card-buttons">
          <button class="btn-primary" onclick="viewCard('${card._id}')">View</button>
          <button class="btn-secondary" onclick="editCard('${card._id}')">Edit</button>
          <button class="btn-secondary" onclick="deleteCard('${card._id}')">Delete</button>
        </div>
      `;
      cardsDiv.appendChild(cardElement);

      allOccasions.add(card.occasion);
      allFroms.add(card.from);
      if (card.to) allTos.add(card.to); // Only add non-empty "to" values
    });

    updateFilters();
  } catch (error) {
    console.error("Error fetching cards:", error);
    alert('Error loading cards. Please try again.');
  }
}

// Function to Update All Filters
function updateFilters() {
  updateOccasionFilter();
  updateFromFilter();
  updateToFilter();
}

// Function to Update the Occasion Filter
function updateOccasionFilter() {
  const occasionFilter = document.getElementById("occasionFilter");
  const currentValue = occasionFilter.value;
  occasionFilter.innerHTML = `<option value="">All Occasions</option>`;

  allOccasions.forEach((occasion) => {
    const option = document.createElement("option");
    option.value = occasion;
    option.textContent = occasion;
    occasionFilter.appendChild(option);
  });

  occasionFilter.value = currentValue;
}

// Function to Update the From Filter
function updateFromFilter() {
  const fromFilter = document.getElementById("fromFilter");
  const currentValue = fromFilter.value;
  fromFilter.innerHTML = `<option value="">All Senders</option>`;

  allFroms.forEach((from) => {
    const option = document.createElement("option");
    option.value = from;
    option.textContent = from;
    fromFilter.appendChild(option);
  });

  fromFilter.value = currentValue;
}

// Function to Update the To Filter
function updateToFilter() {
  const toFilter = document.getElementById("toFilter");
  const currentValue = toFilter.value;
  toFilter.innerHTML = `<option value="">All Recipients</option>`;

  allTos.forEach((to) => {
    const option = document.createElement("option");
    option.value = to;
    option.textContent = to;
    toFilter.appendChild(option);
  });

  toFilter.value = currentValue;
}

// Function to Add a New Card
async function addCard() {
  const title = document.getElementById('title').value.trim();
  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const occasion = document.getElementById('occasion').value.trim();
  const flipOrientation = document.getElementById('flipOrientation').value;
  const noteInput = document.getElementById('note');
  const pagesInput = document.getElementById('pages');

  if (!title || !from || !to || pagesInput.files.length === 0) {
    alert("Please fill in all required fields and upload at least one image.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("from", from);
  formData.append("to", to);
  formData.append("occasion", occasion || "Miscellaneous");
  formData.append("flipOrientation", flipOrientation);
  formData.append("note", noteInput?.value.trim() || "");

  for (let i = 0; i < pagesInput.files.length; i++) {
    formData.append("pages", pagesInput.files[i]);
  }

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData,
    });

    if (response.status === 401) {
      logout();
      return;
    }

    const result = await response.json();
    alert('Card added successfully!');

    // Clear form
    document.getElementById('title').value = '';
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
    document.getElementById('occasion').value = '';
    document.getElementById('flipOrientation').value = 'horizontal';
    noteInput.value = '';
    pagesInput.value = '';
    document.getElementById('addNoteCheckbox').checked = false;
    noteInput.style.display = 'none';

    closeModal('addCardModal');
    getCards();
  } catch (error) {
    console.error('Error adding card:', error);
    alert('Error adding card. Please try again.');
  }
}

// Function to Open View Modal
function viewCard(cardId) {
  const card = allCards.find(c => c._id === cardId);
  if (!card) return alert('Card not found');

  cardPages = card.pages;
  currentPageIndex = 0;

  document.getElementById('viewTitle').innerText = card.title;
  document.getElementById('viewFrom').innerText = card.from;
  document.getElementById('viewTo').innerText = card.to || 'Not specified';
  document.getElementById('viewOccasion').innerText = card.occasion;

  const viewNoteButton = document.getElementById('viewNoteButton');
  const viewNoteText = document.getElementById('viewNoteText');

  if (card.note) {
    viewNoteButton.style.display = 'block';
    viewNoteText.innerText = card.note;
    viewNoteText.style.display = 'none';
  } else {
    viewNoteButton.style.display = 'none';
    viewNoteText.innerText = '';
  }

  const flipOrientation = card.flipOrientation || 'horizontal';
  displayPage(true, flipOrientation);

  openModal('viewModal');
}

// Track whether card is currently flipped
let isCardFlipped = false;

// Function to Display Current Page
function displayPage(initialLoad = false, flipOrientation = "horizontal") {
  const cardFlipper = document.getElementById("cardFlipper");
  const frontImage = document.getElementById("pageFrontImage");
  const backImage = document.getElementById("pageBackImage");
  const cardBack = document.querySelector(".card-back");

  // Set the back face rotation based on orientation
  cardBack.className = `card-face card-back ${flipOrientation}`;

  if (initialLoad) {
    // Initial load: reset flip state and show first page on front
    isCardFlipped = false;
    cardFlipper.className = "card-flipper";
    frontImage.src = getImageUrl(cardPages[currentPageIndex]);
    backImage.src = ""; // Clear back image
  } else {
    // Determine which image is currently visible and which will be next
    const currentImage = isCardFlipped ? backImage : frontImage;
    const nextImage = isCardFlipped ? frontImage : backImage;

    // Pre-load the next page image on the hidden face
    nextImage.src = getImageUrl(cardPages[currentPageIndex]);

    // Toggle flip state
    isCardFlipped = !isCardFlipped;

    // Apply the flip animation by adding the appropriate class
    const flipClass = flipOrientation === "horizontal" ? "flipped-horizontal" : "flipped-vertical";

    if (isCardFlipped) {
      cardFlipper.classList.add(flipClass);
    } else {
      cardFlipper.classList.remove(flipClass);
    }
  }

  document.querySelector(".left-arrow").style.display = currentPageIndex === 0 ? "none" : "block";
  document.querySelector(".right-arrow").style.display =
    currentPageIndex === cardPages.length - 1 ? "none" : "block";
}

// Function to Navigate Pages
function navigatePages(direction) {
  const previousIndex = currentPageIndex;
  currentPageIndex += direction;

  if (currentPageIndex < 0) {
    currentPageIndex = 0;
  } else if (currentPageIndex >= cardPages.length) {
    currentPageIndex = cardPages.length - 1;
  }

  if (currentPageIndex !== previousIndex) {
    const currentCard = allCards.find((c) => c.pages === cardPages);
    displayPage(false, currentCard?.flipOrientation || "horizontal");
  }
}

// Function to Open the Edit Modal
function editCard(cardId) {
  const card = allCards.find(c => c._id === cardId);
  if (!card) return alert('Card not found');

  document.getElementById('editTitle').value = card.title;
  document.getElementById('editFrom').value = card.from;
  document.getElementById('editTo').value = card.to || '';
  document.getElementById('editOccasion').value = card.occasion;
  document.getElementById('editFlipOrientation').value = card.flipOrientation;
  document.getElementById('editNote').value = card.note || '';

  const editModal = document.getElementById('editModal');
  editModal.dataset.cardId = card._id;
  openModal('editModal');
}

// Function to Save Edited Card
async function saveEdit() {
  const cardId = document.getElementById('editModal').dataset.cardId;
  const updatedCard = {
    title: document.getElementById('editTitle').value,
    from: document.getElementById('editFrom').value,
    to: document.getElementById('editTo').value,
    occasion: document.getElementById('editOccasion').value || "Miscellaneous",
    flipOrientation: document.getElementById('editFlipOrientation').value,
    note: document.getElementById('editNote').value.trim()
  };

  try {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updatedCard)
    });

    if (response.status === 401) {
      logout();
      return;
    }

    if (!response.ok) throw new Error('Failed to update card');

    alert('Card updated successfully!');
    closeModal('editModal');
    getCards();
  } catch (error) {
    console.error('Error updating card:', error);
    alert('Error updating card. Please try again.');
  }
}

// Function to Toggle Note Input
function toggleNoteInput() {
  const noteInput = document.getElementById('note');
  const addNoteCheckbox = document.getElementById('addNoteCheckbox');

  if (addNoteCheckbox.checked) {
    noteInput.style.display = 'block';
  } else {
    noteInput.style.display = 'none';
    noteInput.value = '';
  }
}

// Function to Toggle Note Visibility
function toggleNoteVisibility() {
  const noteText = document.getElementById('viewNoteText');
  noteText.style.display = noteText.style.display === 'none' ? 'block' : 'none';
}

// Function to Delete a Card
async function deleteCard(cardId) {
  if (!confirm('Are you sure you want to delete this card?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/cards/${cardId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.status === 401) {
      logout();
      return;
    }

    alert("Card deleted successfully!");
    getCards();
  } catch (error) {
    console.error("Error deleting card:", error);
    alert('Error deleting card. Please try again.');
  }
}

// Function to Open Modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'flex';
  modal.classList.add('show');
}

// Function to Close Modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
  }, 300);

  // Reset card flip state if it's the view modal
  if (modalId === 'viewModal') {
    const cardFlipper = document.getElementById("cardFlipper");
    if (cardFlipper) {
      cardFlipper.className = "card-flipper"; // Remove any flip classes
      isCardFlipped = false; // Reset flip state
    }
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    const modals = ['loginModal', 'registerModal', 'addCardModal'];
    modals.forEach(modalId => {
      if (event.target.id === modalId) {
        closeModal(modalId);
      }
    });
  }
}

// Toggle mobile hamburger menu
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.toggle('active');
}

// Close mobile menu
function closeMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.remove('active');
}

// Toggle filters dropdown
function toggleFilters() {
  const filtersContainer = document.getElementById('filtersContainer');
  const toggleIcon = document.getElementById('filterToggleIcon');
  
  if (filtersContainer.style.display === 'none' || filtersContainer.style.display === '') {
    filtersContainer.style.display = 'grid';
    toggleIcon.classList.add('rotated');
  } else {
    filtersContainer.style.display = 'none';
    toggleIcon.classList.remove('rotated');
  }
}
