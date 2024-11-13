let currentPage = 1;
const cardsPerPage = 10;
let allCards = [];
let allOccasions = new Set(); // To track unique occasions
let currentPageIndex = 0;
let cardPages = [];

// Function to Change Page for Pagination
function changePage(offset) {
  currentPage += offset;
  if (currentPage < 1) currentPage = 1;
  document.getElementById("pageNumber").innerText = currentPage;
  getCards();
}

// Function to Fetch and Display All Cards
async function getCards(resetFilters = false) {
  document.getElementById("loading").style.display = "block";

  if (resetFilters) {
    document.getElementById("occasionFilter").value = "";
    document.getElementById("sortOrder").value = "newest";
    document.getElementById("searchQuery").value = "";
    currentPage = 1;
  }

  const occasion = document.getElementById("occasionFilter").value;
  const sort = document.getElementById("sortOrder").value;
  const search = document.getElementById("searchQuery").value.trim();

  let url = `/cards?sort=${sort}&page=${currentPage}&limit=${cardsPerPage}`;
  if (occasion) url += `&occasion=${encodeURIComponent(occasion)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  try {
    const response = await fetch(url);
    allCards = await response.json();
    const cardsDiv = document.getElementById("cards");
    cardsDiv.innerHTML = "";

    allCards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.classList.add("card");
      cardElement.innerHTML = `
        <h3>${card.title}</h3>
        <p><strong>From:</strong> ${card.from}</p>
        <p><strong>Occasion:</strong> ${card.occasion}</p>
        <div class="pages">
          <img src="${card.pages[0]}" alt="Card page" style="width: 100px; height: auto;"/> 
        </div>
        <div class="card-buttons">
          <button onclick="viewCard('${card._id}')">View</button>
          <button onclick="editCard('${card._id}')">Edit</button>
          <button onclick="deleteCard('${card._id}')">Delete</button>
        </div>
      `;
      cardsDiv.appendChild(cardElement);

      // Add to the occasions set
      allOccasions.add(card.occasion);
    });

    updateOccasionFilter(); // Update the dropdown dynamically
  } catch (error) {
    console.error("Error fetching cards:", error);
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

// Function to Update the Occasion Filter Dropdown
function updateOccasionFilter() {
  const occasionFilter = document.getElementById("occasionFilter");
  occasionFilter.innerHTML = `<option value="">All Occasions</option>`; // Default option

  allOccasions.forEach((occasion) => {
    const option = document.createElement("option");
    option.value = occasion;
    option.textContent = occasion;
    occasionFilter.appendChild(option);
  });
}

// Function to Add a New Card
async function addCard() {
  const title = document.getElementById("title").value.trim();
  const from = document.getElementById("from").value.trim();
  const occasion = document.getElementById("occasion").value.trim();
  const flipOrientation = document.getElementById("flipOrientation").value;
  const pagesInput = document.getElementById("pages");

  if (!title || !from || !occasion || pagesInput.files.length === 0) {
    alert("Please fill in all fields and upload at least one image.");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("from", from);
  formData.append("occasion", occasion);
  formData.append("flipOrientation", flipOrientation);

  for (let i = 0; i < pagesInput.files.length; i++) {
    formData.append("pages", pagesInput.files[i]);
  }

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    alert("Card added successfully!");

    document.getElementById("title").value = "";
    document.getElementById("from").value = "";
    document.getElementById("occasion").value = "";
    document.getElementById("flipOrientation").value = "horizontal";
    pagesInput.value = "";

    // Add the new occasion dynamically and refresh the cards
    allOccasions.add(occasion);
    updateOccasionFilter();
    getCards();
  } catch (error) {
    console.error("Error adding card:", error);
  }
}

// Function to Open View Modal
function viewCard(cardId) {
  const card = allCards.find((c) => c._id === cardId);
  if (!card) return alert("Card not found");

  cardPages = card.pages;
  currentPageIndex = 0;

  document.getElementById("viewTitle").innerText = card.title;
  document.getElementById("viewFrom").innerText = card.from;
  document.getElementById("viewOccasion").innerText = card.occasion;

  const flipOrientation = card.flipOrientation || "horizontal";
  displayPage(true, flipOrientation);

  const modal = document.getElementById("viewModal");
  modal.style.transition = "opacity 0.5s ease-in-out";
  modal.classList.add("show");
  modal.style.display = "flex";
}

// Function to Display Current Page
function displayPage(initialLoad = false, flipOrientation = "horizontal") {
  const pageImage = document.getElementById("pageImage");

  pageImage.style.width = "100%";
  pageImage.style.height = "80vh";
  pageImage.style.objectFit = "contain";
  pageImage.style.objectPosition = "center";

  if (initialLoad) {
    pageImage.style.transition = "none";
    pageImage.style.transform = "rotate(0deg)";
    pageImage.src = cardPages[currentPageIndex];
  } else {
    const flipAxis = flipOrientation === "horizontal" ? "Y" : "X";
    const angle = flipOrientation === "horizontal" ? "rotateY(-180deg)" : "rotateX(-180deg)";

    pageImage.style.transition = "transform 0.8s ease";
    pageImage.style.transform = angle;

    pageImage.addEventListener(
      "transitionend",
      () => {
        pageImage.src = cardPages[currentPageIndex];
        pageImage.style.transform = `rotate${flipAxis}(0deg)`;
      },
      { once: true }
    );
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
  const card = allCards.find((c) => c._id === cardId);
  if (!card) return alert("Card not found");

  document.getElementById("editTitle").value = card.title;
  document.getElementById("editFrom").value = card.from;
  document.getElementById("editOccasion").value = card.occasion;
  document.getElementById("editFlipOrientation").value = card.flipOrientation;

  const editModal = document.getElementById("editModal");
  editModal.style.display = "flex";
  editModal.classList.add("show");
  editModal.dataset.cardId = card._id;
}

// Function to Save Edited Card
async function saveEdit() {
  const cardId = document.getElementById("editModal").dataset.cardId;
  const updatedCard = {
    title: document.getElementById("editTitle").value,
    from: document.getElementById("editFrom").value,
    occasion: document.getElementById("editOccasion").value,
    flipOrientation: document.getElementById("editFlipOrientation").value,
  };

  try {
    const response = await fetch(`/cards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCard),
    });
    if (!response.ok) throw new Error("Failed to update card");

    alert("Card updated successfully!");
    closeModal("editModal");
    getCards();
  } catch (error) {
    console.error("Error updating card:", error);
  }
}

// Function to Delete a Card
async function deleteCard(cardId) {
  try {
    await fetch(`/cards/${cardId}`, { method: "DELETE" });
    alert("Card deleted successfully!");
    getCards();
  } catch (error) {
    console.error("Error deleting card:", error);
  }
}

// Function to Close Modals
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
  }, 500);

  document.getElementById("pageImage").style.transform = "rotateY(0deg)";
  document.getElementById("pageImage").style.transition = "none";
}

// Automatically fetch and display all cards when the page loads
document.addEventListener("DOMContentLoaded", getCards);