// Global state
let freelancerData = {};
let currentCategory = 'web-development';
const metaData = {
    lastUpdated: "2025-04-25 23:16:48",
    updatedBy: "souhail4real"
};

// Function to load freelancer data from the JSON file
async function loadFreelancerData() {
    try {
        // Fetch the JSON file
        const response = await fetch('freelancers.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load freelancer data: ${response.status} ${response.statusText}`);
        }
        
        // Parse JSON response
        const data = await response.json();
        console.log("Freelancer data loaded successfully");
        
        // Store data globally
        freelancerData = data;
        
        // Return the data
        return data;
    } catch (error) {
        console.error('Error loading freelancer data:', error);
        // Return empty object if data loading fails
        return {};
    }
}

// Function to render freelancers based on selected category
// Global state
let currentPage = 1;
const freelancersPerPage = 28;

// Function to render freelancers based on selected category and page
async function renderFreelancers(category, page = 1) {
    // Get the container for freelancers
    const container = document.getElementById('freelancer-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Show loading spinner
    if (loadingSpinner) {
        loadingSpinner.classList.remove('hidden');
    }
    
    // Clear the container
    container.innerHTML = '';
    
    try {
        // If we don't have data yet, load it
        if (Object.keys(freelancerData).length === 0) {
            freelancerData = await loadFreelancerData();
        }
        
        // Get freelancers for the selected category
        const freelancers = freelancerData[category] || [];
        
        // Update current category
        currentCategory = category;

        if (freelancers.length === 0) {
            container.innerHTML = '<p class="text-center col-span-full py-8">No freelancers found in this category.</p>';
        } else {
            // Calculate start and end indices for pagination
            const startIndex = (page - 1) * freelancersPerPage;
            const endIndex = startIndex + freelancersPerPage;
            const paginatedFreelancers = freelancers.slice(startIndex, endIndex);

            // Render each freelancer card
            container.innerHTML = paginatedFreelancers.map(freelancer => renderFreelancerCard(freelancer)).join('');

            // Render pagination controls
            renderPaginationControls(freelancers.length, page);
        }

        // Update the metadata display
        updateMetadataDisplay();
    } catch (error) {
        console.error('Error rendering freelancers:', error);
        container.innerHTML = '<p class="text-center col-span-full py-8 text-red-500">Error loading freelancer data. Please try again later.</p>';
    } finally {
        // Hide loading spinner
        if (loadingSpinner) {
            loadingSpinner.classList.add('hidden');
        }
    }
}

// Function to render pagination controls
function renderPaginationControls(totalFreelancers, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    const totalPages = Math.ceil(totalFreelancers / freelancersPerPage);

    paginationContainer.innerHTML = '';

    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
            button.addEventListener('click', () => renderFreelancers(currentCategory, i));
            paginationContainer.appendChild(button);
        }
    }
}
// Function to render a freelancer card
function renderFreelancerCard(freelancer) {
    return `
        <div class="freelancer-card bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <a href="${freelancer.profile_link}" target="_blank" class="block">
                <div class="relative">
                    <img src="${freelancer.profile_image}" alt="${freelancer.username}" class="w-full h-48 object-cover">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h3 class="text-white font-semibold text-xl">${freelancer.username}</h3>
                    </div>
                </div>
                <div class="p-4">
                    <div class="flex items-center mb-2">
                        <div class="flex text-yellow-400">
                            ${renderStars(freelancer.rating)}
                        </div>
                        <span class="ml-2 text-gray-600">${freelancer.rating} (${freelancer.reviews} reviews)</span>
                    </div>
                    <p class="text-gray-700">${freelancer.short_description}</p>
                    <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <span class="text-green-600 font-semibold">Starting at $${freelancer.price}</span>
                        <button class="text-green-600 hover:text-green-700" onclick="event.stopPropagation(); toggleFavorite(this);">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </a>
        </div>
    `;
}

// Function to render star ratings
function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(parseFloat(rating));
    const hasHalfStar = parseFloat(rating) % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars.push('<i class="fas fa-star"></i>');
    }
    
    if (hasHalfStar) {
        stars.push('<i class="fas fa-star-half-alt"></i>');
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
        stars.push('<i class="far fa-star"></i>');
    }
    
    return stars.join('');
}

// Function to toggle favorite status
function toggleFavorite(button) {
    const icon = button.querySelector('i');
    if (icon.classList.contains('far')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
    }
}

// Function to update metadata display
function updateMetadataDisplay() {
    const metadataElement = document.getElementById('metadata-info');
    if (metadataElement) {
        metadataElement.innerHTML = `
            <p class="text-xs text-gray-500">
                Last updated: ${metaData.lastUpdated} by ${metaData.updatedBy}
            </p>
        `;
    }
}

// Function to handle category selection
function initializeCategorySelection() {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            document.querySelectorAll('.category-card').forEach(c => {
                c.classList.remove('selected-category');
            });
            
            // Add selected class to clicked card
            this.classList.add('selected-category');
            
            // Get the category from data attribute
            const category = this.getAttribute('data-category');
            
            // Clear any active search
            clearSearch();
            
            // Render freelancers for this category
            renderFreelancers(category);
        });
    });
}

// Function to search freelancers
function searchFreelancers(query) {
    if (!query || query.trim() === '') return [];
    
    query = query.toLowerCase().trim();
    const results = [];
    
    // Search in all categories
    for (const [category, freelancers] of Object.entries(freelancerData)) {
        for (const freelancer of freelancers) {
            if (
                freelancer.username.toLowerCase().includes(query) ||
                freelancer.short_description.toLowerCase().includes(query)
            ) {
                results.push({...freelancer, category});
            }
        }
    }
    
    return results;
}

// Function to display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results-container');
    const searchResultsSection = document.getElementById('search-results');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center col-span-full py-8">No freelancers found matching your search.</p>';
    } else {
        resultsContainer.innerHTML = results.map(freelancer => renderFreelancerCard(freelancer)).join('');
    }
    
    searchResultsSection.classList.remove('hidden');
    document.getElementById('freelancer-container').classList.add('hidden');
}

// Function to clear search
function clearSearch() {
    document.getElementById('search-results').classList.add('hidden');
    document.getElementById('freelancer-container').classList.remove('hidden');
    document.getElementById('hero-search-input').value = '';
}

// Initialize search functionality
function initializeSearchFunctionality() {
    // Hero search
    const heroSearchInput = document.getElementById('hero-search-input');
    const heroSearchButton = document.getElementById('hero-search-button');
    
    heroSearchButton.addEventListener('click', async () => {
        const query = heroSearchInput.value;
        
        // Show loading spinner
        const loadingSpinner = document.getElementById('loading-spinner');
        if (loadingSpinner) {
            loadingSpinner.classList.remove('hidden');
        }
        
        try {
            // Make sure data is loaded
            if (Object.keys(freelancerData).length === 0) {
                await loadFreelancerData();
            }
            
            // Search for freelancers
            const results = searchFreelancers(query);
            displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            // Hide loading spinner
            if (loadingSpinner) {
                loadingSpinner.classList.add('hidden');
            }
        }
        
        // Scroll to results
        document.getElementById('search-results').scrollIntoView({ behavior: 'smooth' });
    });
    
    heroSearchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const query = heroSearchInput.value;
            
            // Show loading spinner
            const loadingSpinner = document.getElementById('loading-spinner');
            if (loadingSpinner) {
                loadingSpinner.classList.remove('hidden');
            }
            
            try {
                // Make sure data is loaded
                if (Object.keys(freelancerData).length === 0) {
                    await loadFreelancerData();
                }
                
                // Search for freelancers
                const results = searchFreelancers(query);
                displaySearchResults(results);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.classList.add('hidden');
                }
            }
            
            // Scroll to results
            document.getElementById('search-results').scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Clear search button
    const clearSearchButton = document.getElementById('clear-search');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', clearSearch);
    }
}

// Mobile menu toggle
function initializeMobileMenu() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            // You would typically toggle a mobile menu here
            console.log("Mobile menu clicked");
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    console.log("FreeLanci.ma application loading...");
    console.log(`Last updated: ${metaData.lastUpdated} by ${metaData.updatedBy}`);
    
    try {
        // Load freelancer data
        await loadFreelancerData();
        
        // Initialize category selection
        initializeCategorySelection();
        
        // Initialize search functionality
        initializeSearchFunctionality();
        
        // Initialize mobile menu
        initializeMobileMenu();
        
        // Render initial category (web development by default)
        renderFreelancers('web-development');
        
        console.log("FreeLanci.ma application loaded successfully");
    } catch (error) {
        console.error("Error initializing application:", error);
    }
});

document.getElementById('teamForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const description = document.getElementById('projectDescription').value;
    const findTeamBtn = document.getElementById('findTeamBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const responseContainer = document.getElementById('responseContainer');
    const errorContainer = document.getElementById('errorContainer');
    const chooseTeamBtnContainer = document.getElementById('chooseTeamBtnContainer');
    
    // Show loading, hide other elements
    findTeamBtn.disabled = true;
    findTeamBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    loadingIndicator.classList.remove('hidden');
    responseContainer.classList.add('hidden');
    chooseTeamBtnContainer.classList.add('hidden'); // Hide button initially
    
    try {
        const response = await fetch('http://127.0.0.1:8000/find-team', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project: description })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to find team members');
        }
        
        // Display the response
        document.getElementById('apiResponse').innerHTML = formatResponse(data);
        responseContainer.classList.remove('hidden');
        
        // Show the "Choose Your Team" button
        document.getElementById('chooseTeamBtnContainer').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').textContent = error.message || 'An unexpected error occurred';
        errorContainer.classList.remove('hidden');
    } finally {
        findTeamBtn.disabled = false;
        findTeamBtn.innerHTML = '<i class="fas fa-users mr-2"></i> Find My Team';
        loadingIndicator.classList.add('hidden');
    }
});

