// Sample data structure (we'll replace this with actual data from the Excel file)
let players = [
    // This will be populated from the Excel file
];

// Table sorting
let sortDirection = 1;
let lastSortedColumn = -1;

function sortTable(column) {
    const headers = document.querySelectorAll('th');
    
    // Reset all headers
    headers.forEach(header => {
        header.classList.remove('asc', 'desc');
    });
    
    // Update sort direction
    if (lastSortedColumn === column) {
        sortDirection *= -1;
    } else {
        sortDirection = 1;
    }
    
    // Update header classes
    headers[column].classList.add(sortDirection === 1 ? 'asc' : 'desc');
    
    // Sort the data
    players.sort((a, b) => {
        const aValue = a[column];
        const bValue = b[column];
        
        if (typeof aValue === 'number') {
            return (aValue - bValue) * sortDirection;
        }
        return String(aValue).localeCompare(String(bValue)) * sortDirection;
    });
    
    lastSortedColumn = column;
    renderTable();
}

// Search functionality
function filterAndRenderTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filteredPlayers = players.filter(player => 
        player[1].toLowerCase().includes(searchTerm)
    );
    
    renderTable(filteredPlayers);
}

// Add event listener for search
document.getElementById('searchInput').addEventListener('input', filterAndRenderTable);

// Table rendering
function renderTable(data = players) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    data.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-700';
        
        player.forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-300';
            
            // Format numbers with commas
            if (typeof cell === 'number' && cellIndex > 1) {
                td.textContent = cell.toLocaleString();
            } else {
                td.textContent = cell;
            }
            
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
}

// Load data from CSV file
async function loadData() {
    try {
        console.log('Attempting to load data.csv...');
        const response = await fetch('data.csv');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Successfully fetched data.csv');
        
        const csvText = await response.text();
        console.log('CSV text loaded, length:', csvText.length);
        
        // Parse CSV data and clean up
        const rows = csvText.split('\n')
            .map(row => row.split(','))
            .map(row => row.filter(cell => cell.trim() !== '')); // Remove empty cells
        
        console.log('Parsed rows:', rows.length);
        
        // Remove header row and empty rows
        players = rows.slice(1).filter(row => row.length > 1);
        console.log('Filtered players:', players.length);
        
        // Clean up the data (remove quotes and trim whitespace)
        players = players.map(row => 
            row.map(cell => cell.replace(/"/g, '').trim())
        );
        
        // Convert to the format we need for display
        players = players.map((row, index) => [
            index + 1,                    // Rank
            row[0],                       // Player name
            parseFloat(row[2]) || 0,     // Common value
            parseFloat(row[3]) || 0,     // Uncommon value
            parseFloat(row[4]) || 0,     // Rare value
            parseFloat(row[5]) || 0,     // Epic value
            parseFloat(row[6]) || 0,     // Legendary value
            parseFloat(row[7]) || 0,     // Mystic value
            parseFloat(row[8]) || 0      // Iconic value
        ]);
        
        console.log('Data processing complete, rendering table...');
        renderTable();
    } catch (error) {
        console.error('Detailed error:', error);
        alert(`Error loading data: ${error.message}\nPlease check the browser console for more details.`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', loadData); 