// Utility Functions for Loader
function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// Global Variables
let currentPage = 1;
const booksPerPage = 10;
let allBooks = [];
let currentSearchQuery = '';
let currentGenre = '';
// Initialize wishlist from localStorage or set to an empty array if not available
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Fetch Books from API
async function fetchBooks(page = 1) {
    showLoader(); // Show the loader
    try {
        const response = await fetch(`https://gutendex.com/books/?page=${page}`);
        const data = await response.json();
        allBooks = data.results;
        renderBooks(allBooks);
        updatePaginationInfo(page);
    } catch (error) {
        console.error('Error fetching books:', error);
    } finally {
        hideLoader(); // Hide the loader
    }
}

// Render Books on the Page
function renderBooks(books) {
    const bookList = document.getElementById('book-list');
    if (!bookList) return; // Check if the element exists

    bookList.innerHTML = '';

    books.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
            <img class="book-cover" src="${book.formats['image/jpeg']}" alt="${book.title}">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author"><b>Author:</b> ${book.authors[0]?.name || 'Unknown'}</p>
            <p class="book-genre"><b>Genre: </b>${book.subjects[0] || 'Unknown'}</p>
            <a href="book.html?id=${book.id}" class="view-details">View Details</a>
            <button class="wishlist-button" onclick="toggleWishlist(${book.id})">
                ${wishlist.includes(book.id) ? '❤️' : '🤍'}
            </button>
        `;
        bookList.appendChild(bookItem);
    });
}

// Update Pagination Information
function updatePaginationInfo(page) {
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.textContent = `Page ${page}`;
    }
}

/// Search Books by Title
const searchBar = document.getElementById('search-bar');
if (searchBar) {
    searchBar.addEventListener('input', function () {
        currentSearchQuery = this.value.toLowerCase();
        filterBooks();
    });
}

// Filter Books by Genre
const genreFilter = document.getElementById('genre-filter');
if (genreFilter) {
    genreFilter.addEventListener('change', function () {
        currentGenre = this.value;
        filterBooks();
    });
}


// Function to Filter Books Based on Search Query and Genre
function filterBooks() {
    showLoader(); // Show the loader

    // Filter books based on search query and genre
    const filteredBooks = allBooks.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(currentSearchQuery);
        const matchesGenre = currentGenre === '' || book.subjects.some(subject => subject.includes(currentGenre));
        return matchesSearch && matchesGenre;
    });

    renderBooks(filteredBooks);
    hideLoader(); // Hide the loader
}

// Pagination Controls
const prevPageBtn = document.getElementById('prev-page');
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchBooks(currentPage);
        }
    });
}

const nextPageBtn = document.getElementById('next-page');
if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        fetchBooks(currentPage);
    });
}

// Wishlist Functionality
function toggleWishlist(bookId) {
    showLoader(); // Show the loader
    if (wishlist.includes(bookId)) {
        wishlist = wishlist.filter(id => id !== bookId);
    } else {
        wishlist.push(bookId);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderBooks(allBooks);
    hideLoader(); // Hide the loader
}

// Load Wishlist
async function loadWishlist() {
    showLoader(); // Show the loader

    // Fetch all books if not already fetched
    if (allBooks.length === 0) {
        try {
            const response = await fetch('https://gutendex.com/books');
            const data = await response.json();
            allBooks = data.results;
        } catch (error) {
            console.error('Error fetching books for wishlist:', error);
            hideLoader();
            return;
        }
    }

    const wishlistBooks = allBooks.filter(book => wishlist.includes(book.id));
    const wishlistContainer = document.getElementById('wishlist-books');
    if (!wishlistContainer) {
        hideLoader(); // Hide the loader if the element does not exist
        return;
    }

    wishlistContainer.innerHTML = '';

    wishlistBooks.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.innerHTML = `
            <img class="book-cover" src="${book.formats['image/jpeg']}" alt="${book.title}">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author"><b>Author:</b> ${book.authors[0]?.name || 'Unknown'}</p>
            <p class="book-genre"><b>Genre: </b>${book.subjects[0] || 'Unknown'}</p>
            <a href="book.html?id=${book.id}" class="view-details">View Details</a>
             <button onclick="toggleWishlist(${book.id})">❤️</button>
        `;
        wishlistContainer.appendChild(bookItem);
    });

    hideLoader(); // Hide the loader
}


// Load Book Details
function loadBookDetails() {
    showLoader(); // Show the loader
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (bookId) {
        fetch(`https://gutendex.com/books/${bookId}`)
            .then(response => response.json())
            .then(book => {
                const bookDetails = document.getElementById('book-details');
                if (!bookDetails) return; // Check if the element exists

                bookDetails.innerHTML = `
                    <img  src="${book.formats['image/jpeg']}" alt="${book.title}">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author"><b>Author:</b> ${book.authors[0]?.name || 'Unknown'}</p>
                    <p class="book-genre"><b>Genre: </b>${book.subjects[0] || 'Unknown'}</p>
                    <p>Download: <a href="${book.formats['application/octet-stream']}" target="_blank">Text</a></p>
                `;
            })
            .catch(error => console.error('Error loading book details:', error))
            .finally(() => hideLoader()); // Hide the loader
    }
}

// Initialize Page Content
if (document.getElementById('book-list')) {
    fetchBooks();
} else if (document.getElementById('wishlist-books')) {
    loadWishlist();
} else if (document.getElementById('book-details')) {
    loadBookDetails();
}
