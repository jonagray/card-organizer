let currentPage = 1;
const cardsPerPage = 10;
let allCards = [];
let currentPageIndex = 0;
let cardPages = [];

// Function to Change Page for Pagination
function changePage(offset) {
  currentPage += offset;
  if (currentPage < 1) currentPage = 1;
  document.getElementById('pageNumber').innerText = currentPage;
  getCards();
}

// Function to Fetch and Display All Cards
async function getCards(resetFilters = false) {
  document.getElementById('loading').style.display = 'block';

  if (resetFilters) {
    document.getElementById('occasionFilter').value = ""; 
    document.getElementById('sortOrder').value = "newest"; 
    document.getElementById('searchQuery').value = ""; 
    currentPage = 1; 
  }

  const occasion = document.getElementById('occasionFilter').value;
  const sort = document.getElementById('sortOrder').value;
  const search = document.getElementById('searchQuery').value.trim();

  let url = `/cards?sort=${sort}&page=${currentPage}&limit=${cardsPerPage}`;
  if (occasion) url += `&occasion=${encodeURIComponent(occasion)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const response = await fetch(url);
    allCards = await response.json();
    const cardsDiv = document.getElementById('cards');
    cardsDiv.innerHTML = ''; 

    allCards.forEach(card => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.innerHTML = `
        <h3>${card.title}</h3>
        <p><strong>From:</strong> ${card.from}</p>
        <p><strong>Occasion:</strong> ${card.occasion}</p>
        <div class="pages">
          <img src="${card.pages[0]}" alt="Card page" style="width: 100px; height: auto;"/> 
        </div>
        <button onclick="viewCard('${card._id}')">View</button>
        <button onclick="editCard('${card._id}')">Edit</button>
        <button onclick="deleteCard('${card._id}')">Delete</button>
      `;
      cardsDiv.appendChild(cardElement);
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

// Function to Add a New Card
async function addCard() {
  const title = document.getElementById('title').value.trim();
  const from = document.getElementById('from').value.trim();
  const occasion = document.getElementById('occasion').value.trim();
  const pagesInput = document.getElementById('pages');

  if (!title || !from || !occasion || pagesInput.files.length === 0) {
    alert("Please fill in all fields and upload at least one image.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("from", from);
  formData.append("occasion", occasion);

  for (let i = 0; i < pagesInput.files.length; i++) {
    formData.append("pages", pagesInput.files[i]);
  }

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    alert('Card added successfully!');
    
    // Clear the form fields after successful upload
    document.getElementById('title').value = '';
    document.getElementById('from').value = '';
    document.getElementById('occasion').value = '';
    pagesInput.value = '';

    // Refresh the cards list
    getCards();
  } catch (error) {
    console.error('Error adding card:', error);
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
  document.getElementById('viewOccasion').innerText = card.occasion;

  displayPage(true); // Show the cover page without transition

  const modal = document.getElementById('viewModal');
  modal.style.transition = 'opacity 0.5s ease-in-out';
  modal.classList.add('show');
  modal.style.display = 'flex'; // Ensure modal display is reset to visible
}

// Function to Display Current Page
function displayPage(initialLoad = false) {
  const pageImage = document.getElementById('pageImage');

  // Style setup for consistent size and centering
  pageImage.style.width = '100%';
  pageImage.style.height = '80vh';
  pageImage.style.objectFit = 'contain';
  pageImage.style.objectPosition = 'center';

  // Display the first page without transition on the initial load
  if (initialLoad) {
    pageImage.style.transition = 'none';
    pageImage.style.transform = 'rotateY(0deg)';
    pageImage.src = cardPages[currentPageIndex];
  } else {
    // Apply flip effect, then load the new image at the end of the flip
    pageImage.style.transition = 'transform 0.8s ease';
    pageImage.style.transform = 'rotateY(-180deg)';

    // Change image after transition ends
    pageImage.addEventListener('transitionend', () => {
      pageImage.src = cardPages[currentPageIndex];
      pageImage.style.transform = 'rotateY(0deg)';
    }, { once: true });
  }

  // Update arrow visibility
  document.querySelector('.left-arrow').style.display = currentPageIndex === 0 ? 'none' : 'block';
  document.querySelector('.right-arrow').style.display = currentPageIndex === cardPages.length - 1 ? 'none' : 'block';
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
    displayPage(); 
  }
}

// Function to Close Modals
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
  
  setTimeout(() => {
    modal.style.display = 'none'; // Hide completely after transition
  }, 500);

  // Reset modal content for next use
  document.getElementById('pageImage').style.transform = 'rotateY(0deg)';
  document.getElementById('pageImage').style.transition = 'none';
}

// Automatically fetch and display all cards when the page loads
document.addEventListener("DOMContentLoaded", getCards);