/**
 * FreeLanci.ma - Main Application File
 * Created: 2025-05-04
 * Author: souhail4real
 * 
 * This file organizes all function calls in the correct order
 * to ensure proper initialization and functionality.
 */

// =======================================================
// GLOBAL STATE VARIABLES
// =======================================================
let freelancerData = {};
let currentCategory = 'web-development';
let currentPage = 1;
const freelancersPerPage = 28;

const metaData = {
    lastUpdated: "2025-05-04 18:13:42",
    updatedBy: "souhail4real"
};

// Categories for classification
const categories = {
    'web-development': ['web', 'developer', 'development', 'javascript', 'react', 'vue', 'angular', 'node', 'php', 'laravel', 'html', 'css', 'bootstrap', 'tailwind', 'wordpress', 'shopify', 'frontend', 'backend', 'full stack'],
    'mobile-development': ['mobile', 'android', 'ios', 'flutter', 'react native', 'kotlin', 'swift', 'dart', 'xamarin', 'ionic', 'app development', 'pwa', 'mobile app'],
    'data-science-ml': ['data', 'machine learning', 'artificial intelligence', 'ai', 'ml', 'python', 'pandas', 'tensorflow', 'pytorch', 'scikit', 'data analysis', 'data scientist', 'big data', 'nlp', 'deep learning', 'neural network'],
    'cybersecurity': ['security', 'cyber', 'ethical hacking', 'penetration testing', 'pen test', 'infosec', 'firewall', 'cryptography', 'encryption', 'vulnerability', 'security audit', 'siem', 'compliance', 'gdpr'],
    'cloud-devops': ['cloud', 'aws', 'azure', 'gcp', 'google cloud', 'devops', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'infrastructure', 'iaas', 'paas', 'saas', 'microservices', 'serverless']
};

// =======================================================
// DATA LOADING FUNCTIONS
// =======================================================

/**
 * Loads freelancer data from the JSON file
 * @returns {Promise<Object>} The loaded freelancer data
 */
async function loadFreelancerData() {
    try {
        console.log("Fetching freelancer data...");
        const response = await fetch('freelancers.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load freelancer data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Freelancer data loaded successfully");
        
        // Store data globally
        freelancerData = data;
        
        return data;
    } catch (error) {
        console.error('Error loading freelancer data:', error);
        return {};
    }
}

// =======================================================
// RENDERING FUNCTIONS
// =======================================================

/**
 * Renders a single freelancer card
 * @param {Object} freelancer The freelancer data
 * @returns {string} HTML for the freelancer card
 */
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

/**
 * Renders star ratings
 * @param {number|string} rating The rating value 
 * @returns {string} HTML for the star ratings
 */
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

/**
 * Renders pagination controls
 * @param {number} totalFreelancers Total number of freelancers
 * @param {number} currentPage Current page number
 */
function renderPaginationControls(totalFreelancers, currentPage) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
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

/**
 * Renders freelancers based on selected category and page
 * @param {string} category The category to render
 * @param {number} page The page number
 */
async function renderFreelancers(category, page = 1) {
    // Get the container for freelancers
    const container = document.getElementById('freelancer-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    if (!container) {
        console.error("Freelancer container not found in DOM");
        return;
    }
    
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

/**
 * Updates metadata display
 */
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

/**
 * Toggles favorite status
 * @param {HTMLElement} button The button element
 */
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

// =======================================================
// SEARCH FUNCTIONS
// =======================================================

/**
 * Searches freelancers based on query
 * @param {string} query The search query
 * @returns {Array} The search results
 */
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

/**
 * Displays search results
 * @param {Array} results The search results
 */
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results-container');
    const searchResultsSection = document.getElementById('search-results');
    
    if (!resultsContainer || !searchResultsSection) {
        console.error("Search results containers not found in DOM");
        return;
    }
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-center col-span-full py-8">No freelancers found matching your search.</p>';
    } else {
        resultsContainer.innerHTML = results.map(freelancer => renderFreelancerCard(freelancer)).join('');
    }
    
    searchResultsSection.classList.remove('hidden');
    document.getElementById('freelancer-container').classList.add('hidden');
}

/**
 * Clears search
 */
function clearSearch() {
    const searchResults = document.getElementById('search-results');
    const freelancerContainer = document.getElementById('freelancer-container');
    const searchInput = document.getElementById('hero-search-input');
    
    if (searchResults) searchResults.classList.add('hidden');
    if (freelancerContainer) freelancerContainer.classList.remove('hidden');
    if (searchInput) searchInput.value = '';
}

// =======================================================
// FILTERING FUNCTIONS
// =======================================================

/**
 * Extracts skills from freelancers' descriptions
 * @returns {Array} The extracted skills
 */
function extractSkillsFromData() {
    const skillsSet = new Set();
    
    // Define common skills to extract from descriptions
    const commonSkills = [
        // Web development
        'javascript', 'react', 'vue', 'angular', 'node', 'php', 'laravel', 
        'html', 'css', 'bootstrap', 'tailwind', 'wordpress', 'shopify',
        
        // Mobile development
        'android', 'ios', 'flutter', 'react native', 'kotlin', 'swift',
        
        // Data science
        'python','tensorflow', 'pytorch', 'data analysis', 
        'machine learning', 'ai', 'ml', 'deep learning',
        
        // Cybersecurity
        'security', 'ethical hacking', 'penetration testing', 'encryption',
        
        // Cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'devops'
    ];
    
    if (Object.keys(freelancerData).length === 0) {
        console.warn("No freelancer data available for skill extraction");
        return [];
    }
    
    Object.values(freelancerData).forEach(categoryFreelancers => {
        categoryFreelancers.forEach(freelancer => {
            const description = freelancer.short_description.toLowerCase();
            
            // Extract skills from descriptions based on common skills
            commonSkills.forEach(skill => {
                if (description.includes(skill.toLowerCase())) {
                    // Capitalize first letter of each word
                    const formattedSkill = skill.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                    skillsSet.add(formattedSkill);
                }
            });
        });
    });
    
    return Array.from(skillsSet).sort();
}

/**
 * Gets display name for category
 * @param {string} categoryValue The category value
 * @returns {string} The display name
 */
function getCategoryDisplayName(categoryValue) {
    const categoryNames = {
        'web-development': 'Web Development',
        'mobile-development': 'Mobile Development',
        'data-science-ml': 'Data Science & ML',
        'cybersecurity': 'Cybersecurity',
        'cloud-devops': 'Cloud & DevOps'
    };
    
    return categoryNames[categoryValue] || categoryValue;
}

/**
 * Applies advanced filters
 */
function applyAdvancedFilters() {
   
    console.log("Applying advanced filters...");
    
    const minPrice = document.getElementById('price-min')?.value;
    const maxPrice = document.getElementById('price-max')?.value;
    const category = document.getElementById('category-filter')?.value;
    const skillsInput = document.getElementById('skills-filter')?.value || '';
    
    const skills = skillsInput.toLowerCase().split(',').map(s => s.trim()).filter(s => s);
    
    // Track active filters for display
    const activeFilters = [];
    
    // Set the active category if one is selected
    if (category) {
        currentCategory = category;
        activeFilters.push({ type: 'category', value: category });
        
        // Update UI to show the selected category
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('selected-category');
            if (card.getAttribute('data-category') === category) {
                card.classList.add('selected-category');
            }
        });
    }
    
    // Add price filters if specified
    if (minPrice) activeFilters.push({ type: 'min-price', value: `$${minPrice}+` });
    if (maxPrice) activeFilters.push({ type: 'max-price', value: `Up to $${maxPrice}` });
    
    // Add skill filters
    skills.forEach(skill => {
        if (skill) activeFilters.push({ type: 'skill', value: skill });
    });
    
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    
    // Get all freelancers either from the current category or all categories if no category is specified
    let allFreelancers = [];
    if (category) {
        allFreelancers = freelancerData[category] || [];
    } else {
        // Combine all freelancers from all categories
        Object.values(freelancerData).forEach(categoryFreelancers => {
            allFreelancers = [...allFreelancers, ...categoryFreelancers];
        });
    }
    
    // Apply filters
    const filteredFreelancers = allFreelancers.filter(freelancer => {
        const price = parseInt(freelancer.price);
        
        // Price range filter
        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;
        
        // Skills filter
        if (skills.length > 0) {
            const freelancerDescription = freelancer.short_description.toLowerCase();
            // Check if any of the skills are mentioned in the freelancer's description
            const hasMatchingSkill = skills.some(skill => 
                freelancerDescription.includes(skill)
            );
            if (!hasMatchingSkill) return false;
        }
        
        return true;
    });
    
    console.log(`Found ${filteredFreelancers.length} freelancers matching filters`);
    
    // Display filtered results
    displayFilteredResults(filteredFreelancers, activeFilters);
    
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
}

/**
 * Displays filtered results
 * @param {Array} results The filtered results
 * @param {Array} activeFilters Active filters
 */
function displayFilteredResults(results, activeFilters = []) {
    const container = document.getElementById('freelancer-container');
    const paginationContainer = document.getElementById('pagination-container');
    const filterTagsContainer = document.getElementById('active-filter-tags');
    
    if (!container) {
        console.error("Freelancer container not found in DOM");
        return;
    }
    
    // Hide pagination when showing filtered results
    if (paginationContainer) paginationContainer.innerHTML = '';
    
    // Display active filter tags if container exists
    if (filterTagsContainer) {
        filterTagsContainer.innerHTML = '';
        
        if (activeFilters.length > 0) {
            filterTagsContainer.classList.remove('hidden');
            
            // Add filter tags
            activeFilters.forEach(filter => {
                const tag = document.createElement('span');
                tag.className = 'filter-tag';
                
                let tagText = '';
                let tagClass = '';
                
                switch(filter.type) {
                    case 'category':
                        tagText = `Category: ${getCategoryDisplayName(filter.value)}`;
                        tagClass = 'bg-blue-100 text-blue-800';
                        break;
                    case 'min-price':
                        tagText = filter.value;
                        tagClass = 'bg-green-100 text-green-800';
                        break;
                    case 'max-price':
                        tagText = filter.value;
                        tagClass = 'bg-green-100 text-green-800';
                        break;
                    case 'skill':
                        tagText = filter.value;
                        tagClass = 'bg-purple-100 text-purple-800';
                        break;
                    default:
                        tagText = filter.value;
                        tagClass = 'bg-gray-100 text-gray-800';
                }
                
                tag.innerHTML = `
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${tagClass}">
                        ${tagText}
                        <button class="ml-1 text-xs filter-tag-remove" data-filter-type="${filter.type}" data-filter-value="${filter.value}">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                `;
                
                filterTagsContainer.appendChild(tag);
            });
            
            // Add clear all button if there are filters
            const clearAllBtn = document.createElement('button');
            clearAllBtn.className = 'ml-2 text-xs text-gray-500 hover:text-gray-700';
            clearAllBtn.innerHTML = 'Clear all';
            clearAllBtn.addEventListener('click', () => {
                document.getElementById('price-min').value = '';
                document.getElementById('price-max').value = '';
                document.getElementById('category-filter').value = '';
                document.getElementById('skills-filter').value = '';
                renderFreelancers(currentCategory);
            });
            filterTagsContainer.appendChild(clearAllBtn);
            
            // Add event listeners to tag remove buttons
            document.querySelectorAll('.filter-tag-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const filterType = btn.getAttribute('data-filter-type');
                    const filterValue = btn.getAttribute('data-filter-value');
                    
                    // Remove the filter
                    removeFilter(filterType, filterValue);
                });
            });
        } else {
            filterTagsContainer.classList.add('hidden');
        }
    }
    
    if (results.length === 0) {
        container.innerHTML = '<p class="text-center col-span-full py-8">No freelancers match your filters. Try adjusting your criteria.</p>';
    } else {
        container.innerHTML = results.map(freelancer => renderFreelancerCard(freelancer)).join('');
    }
    
    // Show the number of results
    const resultsCount = document.createElement('div');
    resultsCount.className = 'text-center col-span-full mt-4 text-gray-600';
    resultsCount.innerHTML = `<p>${results.length} freelancer${results.length !== 1 ? 's' : ''} found</p>`;
    container.prepend(resultsCount);
    
    // Make sure the container is visible
    container.classList.remove('hidden');
    
    const searchResults = document.getElementById('search-results');
    if (searchResults) searchResults.classList.add('hidden');
}

/**
 * Removes a specific filter and reapplies remaining filters
 * @param {string} filterType The filter type
 * @param {string} filterValue The filter value
 */
function removeFilter(filterType, filterValue) {
    console.log(`Removing filter: ${filterType} = ${filterValue}`);
    
    // Handle different filter types
    switch(filterType) {
        case 'category':
            const categoryFilter = document.getElementById('category-filter');
            if (categoryFilter) categoryFilter.value = '';
            break;
        case 'min-price':
            const minPrice = document.getElementById('price-min');
            if (minPrice) minPrice.value = '';
            break;
        case 'max-price':
            const maxPrice = document.getElementById('price-max');
            if (maxPrice) maxPrice.value = '';
            break;
        case 'skill':
            // Remove just this skill from the comma-separated list
            const skillsInput = document.getElementById('skills-filter');
            if (skillsInput) {
                const skills = skillsInput.value.split(',').map(s => s.trim());
                const updatedSkills = skills.filter(s => s.toLowerCase() !== filterValue.toLowerCase());
                skillsInput.value = updatedSkills.join(', ');
            }
            break;
    }
    
    // Reapply remaining filters
    applyAdvancedFilters();
}

// =======================================================
// INITIALIZATION FUNCTIONS
// =======================================================

/**
 * Initializes skills autocomplete
 */
function initializeSkillsAutocomplete() {
    console.log("Initializing skills autocomplete...");
    
    const skillsInput = document.getElementById('skills-filter');
    if (!skillsInput) {
        console.error("Skills filter input not found in DOM");
        return;
    }
    
    const skillsList = extractSkillsFromData();
    
    // Create a datalist element
    const datalist = document.createElement('datalist');
    datalist.id = 'skills-list';
    
    // Add options to datalist
    skillsList.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        datalist.appendChild(option);
    });
    
    // Add datalist to the document
    document.body.appendChild(datalist);
    
    // Connect input to datalist
    skillsInput.setAttribute('list', 'skills-list');
    
    // Handle comma-separated inputs
    skillsInput.addEventListener('input', function(e) {
        const value = e.target.value;
        const lastCommaIndex = value.lastIndexOf(',');
        
        if (lastCommaIndex !== -1) {
            // Get text after the last comma
            const currentInput = value.substring(lastCommaIndex + 1).trim();
            
            // Remove the datalist temporarily to prevent it from showing all options
            if (currentInput.length === 0) {
                skillsInput.removeAttribute('list');
            } else {
                skillsInput.setAttribute('list', 'skills-list');
            }
        }
    });
    
    console.log(`Initialized autocomplete with ${skillsList.length} skills`);
}

/**
 * Initializes category selection
 */
function initializeCategorySelection() {
    console.log("Initializing category selection...");
    
    const categoryCards = document.querySelectorAll('.category-card');
    
    if (categoryCards.length === 0) {
        console.error("No category cards found in DOM");
        return;
    }
    
    categoryCards.forEach(card => {
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
    
    console.log(`Initialized ${categoryCards.length} category cards`);
}

/**
 * Initializes search functionality
 */
function initializeSearchFunctionality() {
    console.log("Initializing search functionality...");
    
    // Hero search
    const heroSearchInput = document.getElementById('hero-search-input');
    const heroSearchButton = document.getElementById('hero-search-button');
    
    if (!heroSearchInput || !heroSearchButton) {
        console.error("Search elements not found in DOM");
        return;
    }
    
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
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.scrollIntoView({ behavior: 'smooth' });
        }
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
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
    
    // Clear search button
    const clearSearchButton = document.getElementById('clear-search');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', clearSearch);
    }
}

/**
 * Initializes mobile menu
 */
function initializeMobileMenu() {
    console.log("Initializing mobile menu...");
    
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            // You would typically toggle a mobile menu here
            console.log("Mobile menu clicked");
        });
    }
}

/**
 * Initializes advanced filters
 */
function initializeAdvancedFilters() {
    console.log("Initializing advanced filters...");
    
    // Filter toggle functionality
    const toggleFilters = document.getElementById('toggle-filters');
    const advancedFilters = document.getElementById('advanced-filters');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');
    
    if (!toggleFilters || !advancedFilters) {
        console.error("Filter elements not found in DOM");
        return;
    }
    
    console.log("Filter elements found, adding event listeners...");
    
    // Toggle filters visibility
    toggleFilters.addEventListener('click', () => {
        console.log("Toggle filters clicked");
        const isVisible = advancedFilters.style.display === 'block';
        advancedFilters.style.display = isVisible ? 'none' : 'block';
        console.log(`Advanced filters are now ${isVisible ? 'hidden' : 'visible'}`);
        
        // Update toggle icon
        const icon = toggleFilters.querySelector('.fa-chevron-down, .fa-chevron-up');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    });
    
    // Apply filters
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            applyAdvancedFilters();
        });
    }
    
    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.getElementById('price-min').value = '';
            document.getElementById('price-max').value = '';
            document.getElementById('category-filter').value = '';
            document.getElementById('skills-filter').value = '';
            
            // Reset to default view
            renderFreelancers(currentCategory);
        });
    }

    // Initialize active filter tags container
    const filterTagsContainer = document.getElementById('active-filter-tags');
    if (filterTagsContainer) {
        filterTagsContainer.innerHTML = '';
    }
    
    console.log("Advanced filters initialized");
}

/**
 * Initializes Team Form submission
 */
function initializeTeamForm() {
    console.log("Initializing team form...");
    
    const teamForm = document.getElementById('teamForm');
    
    if (!teamForm) {
        console.log("Team form not found, skipping initialization");
        return;
    }
    
    teamForm.addEventListener('submit', async function(e) {
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
}

/**
 * Debug helper for filter functionality
 */
function debugFilterElements() {
    console.log("=== DEBUG: Checking critical DOM elements ===");
    
    const elements = [
        'freelancer-container',
        'toggle-filters',
        'advanced-filters',
        'price-min',
        'price-max',
        'category-filter',
        'skills-filter',
        'apply-filters',
        'clear-filters',
        'active-filter-tags',
        'hero-search-input',
        'hero-search-button',
        'pagination-container'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}: ${element ? 'Found ✓' : 'MISSING ✗'}`);
        if (element) {
            console.log(`  - Display: ${getComputedStyle(element).display}`);
            console.log(`  - Visibility: ${getComputedStyle(element).visibility}`);
        }
    });
    
    console.log("=== END DEBUG ===");
}

// =======================================================
// ENTRY POINT - APPLICATION INITIALIZATION
// =======================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("=== FreeLanci.ma Application Starting ===");
    console.log(`Last updated: ${metaData.lastUpdated} by ${metaData.updatedBy}`);
    
    try {
        // STEP 1: Load the data first
        console.log("STEP 1: Loading freelancer data...");
        await loadFreelancerData();
        
        // STEP 2: Initialize all UI components
        console.log("STEP 2: Initializing UI components...");
        
        // Initialize skills autocomplete (depends on data being loaded)
        initializeSkillsAutocomplete();
        
        // Initialize other UI components
        initializeCategorySelection();
        initializeSearchFunctionality();
        initializeMobileMenu();
        initializeTeamForm();
        
        // STEP 3: Initialize advanced filters (critical functionality)
        console.log("STEP 3: Initializing advanced filters...");
        initializeAdvancedFilters();
        
        // STEP 4: Render initial content
        console.log("STEP 4: Rendering initial content...");
        renderFreelancers('web-development');
        
        // STEP 5: Debug check (remove in production)
        setTimeout(debugFilterElements, 1000);
        
        console.log("=== FreeLanci.ma Application Loaded Successfully ===");
    } catch (error) {
        console.error('Application initialization error:', error);
    }
});


