document.addEventListener('DOMContentLoaded', function(){
    //DOMContentLoaded event --> execute JavaScript code as soon as the DOM is ready, but before all resources (like images) are fully loaded.

    const booksContainer = document.getElementById("books-container");
    const searchInput = document.getElementById("search");
    const searchBtn = document.getElementById("search-btn");
    const sortSelect = document.getElementById("sort");
    const listViewBtn = document.getElementById("list-view");
    const gridViewBtn = document.getElementById("grid-view");
    const loadingElement = document.getElementById("loading");

    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
  
    let books = [];
    let filteredBooks = [];
    let isLoading = false;
    let hasMore = true;
    let currentPage = 1;
    const booksPerPage = 20;
    let totalPages;
    let currentView = "grid";



    // Fetch books from API
    fetchBooks();

    // display as a list/grid
    listViewBtn.addEventListener("click", function(){
        if (currentView !== "list") {
            currentView = "list";
            listViewBtn.classList.add("active");
            gridViewBtn.classList.remove("active");
            renderBooks(books);
        }
    })

    gridViewBtn.addEventListener("click", function(){
        if (currentView !== "grid") {
            currentView = "grid";
            listViewBtn.classList.remove("active");
            gridViewBtn.classList.add("active");
            renderBooks(books);
        }
    })

    // search functionality with debounce timer
    let debounceTimer;
    searchInput.addEventListener("input", function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            filterBooks(this.value.trim().toLowerCase());
        }, 300);
    });

    // sorting based on selected value
    sortSelect.addEventListener("change", function(){
        sortBooks(this.value)
    })

    // for pagination
    prevPageBtn.addEventListener("click", function() {
        if (currentPage > 1 && !isLoading) {
            fetchBooks(currentPage - 1);
        }
    });

    nextPageBtn.addEventListener("click", function() {
        if (currentPage < totalPages && !isLoading) {
            fetchBooks(currentPage + 1);
        }
    });

    // --------- utility functions ------------
    //     if (!hasMore || isLoading) return;
    //     try {
    //         isLoading = true;
    //         loadingElement.style.display = "block";
    //         const response = await fetch(`https://api.freeapi.app/api/v1/public/books?page=${page}&limit=${booksPerPage}`);
    //         const result = await response.json();
    
    //         if (result?.data?.data?.length > 0) {
    //             // Replace books instead of accumulating when changing pages
    //             if (page === 1) {
    //                 books = result.data.data;
    //             } else {
    //                 books = [...books, ...result.data.data];
    //             }
                
    //             hasMore = result.data.hasMore ?? false;

    //             totalPages = result.data.totalPages;

    //             updatePaginationButtons();
    //             renderBooks(books);
    //         } else {
    //             hasMore = false;
    //             showError("No more books available.");
    //         }
    //     } catch (error) {
    //         console.error("Error fetching books", error);
    //         showError("Failed to load books. Please try again later.");
    //     } finally {
    //         isLoading = false;
    //         loadingElement.style.display = "none";
    //     }
    // }

    // Replace your existing fetchBooks function with this:
    async function fetchBooks(page = 1) {
        if (isLoading) return;
        
        try {
            isLoading = true;
            loadingElement.style.display = "block";
            
            const response = await fetch(`https://api.freeapi.app/api/v1/public/books?page=${page}&limit=${booksPerPage}`);
            const result = await response.json();

            if (result?.data?.data?.length > 0) {
                // Always replace books when changing pages
                books = result.data.data;
                hasMore = result.data.hasMore;
                totalPages = result.data.totalPages;
                currentPage = page;
                
                updatePaginationButtons();
                renderBooks(books);
            } else {
                showError("No books available.");
            }
        } catch (error) {
            console.error("Error fetching books", error);
            showError("Failed to load books. Please try again later.");
        } finally {
            isLoading = false;
            loadingElement.style.display = "none";
        }
    }
    
    function renderBooks(books) {
        if (books.length === 0) {
            showError("No books found");
            return;
        }

        if(currentView === "grid") {
            renderBooksGrid(books);
        } else {
            renderBooksList(books);
        }
    }

    function renderBooksGrid(books) {

        booksContainer.classList.remove("list-view");
        booksContainer.classList.add("grid-view");
        booksContainer.innerHTML = "";

        books.forEach(book => {
            const url = book.volumeInfo.imageLinks?.thumbnail || "placeholder.jpg";
            const bookTitle = book.volumeInfo.title || "Unknown Title";
            const bookAuthors = book.volumeInfo.authors?.join(", ") || "Unknown Author";
            const bookPublished = book.volumeInfo.publishedDate || "Unknown Date";

            const bookElement = document.createElement("div");
            bookElement.classList.add("book");
            bookElement.classList.add("grid-view");
            bookElement.innerHTML = `
                <img src="${url}" alt="${bookTitle}">
                <div class="details">
                    <h2>${bookTitle}</h2>
                    <p>By: ${bookAuthors}</p>
                    <p>Published: ${bookPublished}</p>
                </div>
            `;
            booksContainer.appendChild(bookElement);

            bookElement.addEventListener("click", function() {
                window.open(book.volumeInfo.previewLink, "_blank");
            });
        });
    }

    function renderBooksList(books) {
        // console.log(books);

        booksContainer.classList.remove("grid-view");
        booksContainer.classList.add("list-view");
        booksContainer.innerHTML = "";
        books.forEach(book => {

            const url = book.volumeInfo.imageLinks?.thumbnail || "placeholder.jpg";
            const bookTitle = book.volumeInfo.title || "Unknown Title";
            const bookAuthors = book.volumeInfo.authors?.join(", ") || "Unknown Author";
            const bookPublished = book.volumeInfo.publishedDate|| "Unknown Date";


            const bookElement = document.createElement("div");
    
            bookElement.classList.add("book");
            bookElement.classList.add("list-view");

            bookElement.innerHTML = `
                <img src="${url}" alt="${bookTitle}">
                <div class="details">
                    <h2>${bookTitle}</h2>
                    <p>By: ${bookAuthors}</p>
                    <p>Published: ${bookPublished}</p>
                </div>
            `;
            booksContainer.appendChild(bookElement);

            bookElement.addEventListener("click", function() {
                window.open(book.volumeInfo.previewLink, "_blank");
            });

        });
    }

    function filterBooks(searchTerm) {
        filteredBooks = books.filter(book => 
            book.volumeInfo?.title?.toLowerCase().includes(searchTerm) || 
            book.volumeInfo?.authors?.some(author => author.toLowerCase().includes(searchTerm))
        );
        renderBooks(filteredBooks);
    }

    function sortBooks(criteria){
        if (!books.length) return;

        let sortedBooks = [...books];

        
        if (criteria === "title") {
            sortedBooks.sort((a, b) => {
                const titleA = a.volumeInfo?.title?.toLowerCase() || "";
                const titleB = b.volumeInfo?.title?.toLowerCase() || "";
                return titleA.localeCompare(titleB);
            });
        } else if (criteria === "-title") {
            sortedBooks.sort((a, b) => {
                const titleA = a.volumeInfo?.title?.toLowerCase() || "";
                const titleB = b.volumeInfo?.title?.toLowerCase() || "";
                return titleB.localeCompare(titleA);
            });
        } else if (criteria === "date") {
            sortedBooks.sort((a, b) => {
                const dateA = new Date(a.volumeInfo?.publishedDate || "1970-01-01");
                const dateB = new Date(b.volumeInfo?.publishedDate || "1970-01-01");
                return dateA - dateB; // Ascending order
            });
        } else if (criteria === "-date") {
            sortedBooks.sort((a, b) => {
                const dateA = new Date(a.volumeInfo?.publishedDate || "1970-01-01");
                const dateB = new Date(b.volumeInfo?.publishedDate || "1970-01-01");
                return dateB - dateA; // decending order
            });
        } 

        renderBooks(sortedBooks);

    }

    function updatePaginationButtons() {
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
        
        // Optional: Add visual feedback
        prevPageBtn.classList.toggle('disabled', currentPage <= 1);
        nextPageBtn.classList.toggle('disabled', currentPage >= totalPages);
    }
    
    function showError(message) {
        booksContainer.classList.remove("grid-view")
        booksContainer.classList.remove("list-view")
        loadingElement.style.display = "none";
        booksContainer.innerHTML = `<div class="error">${message}</div>`;
    }
})


