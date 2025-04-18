// Sample data structure (we'll replace this with actual data from the Excel file)
let players = [];
let renderedRows = [];
let isMobile = window.innerWidth <= 768;
let currentTeamFilter = 'all';

// Table sorting
let sortDirection = 1;
let lastSortedColumn = -1;

// Handle window resize
window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
    renderTable(); // Re-render table with appropriate mobile styles
});

function extractTeamName(playerName) {
    const match = playerName.match(/\((.*?)\)/);
    return match ? match[1] : 'Unknown';
}

function getUniqueTeams() {
    const teams = new Set();
    players.forEach(player => {
        teams.add(extractTeamName(player[1]));
    });
    return Array.from(teams).sort();
}

function updateTeamFilter() {
    const teamSelect = document.getElementById('teamFilter');
    const rows = document.getElementById('tableBody').getElementsByTagName('tr');
    const teams = new Set();
    
    // Collect all unique teams
    for (let row of rows) {
        const team = row.cells[2].textContent.trim();
        if (team) teams.add(team);
    }
    
    // Update dropdown options
    teamSelect.innerHTML = '<option value="all">All Teams</option>';
    Array.from(teams).sort().forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
    });
}

function filterAndRenderTable() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const teamFilter = document.getElementById('teamFilter').value;
    
    // Update visibility of existing rows
    renderedRows.forEach((row, index) => {
        const playerName = players[index][1].toLowerCase();
        const playerTeam = extractTeamName(players[index][1]);
        
        const matchesSearch = !searchTerm || playerName.includes(searchTerm);
        const matchesTeam = teamFilter === 'all' || playerTeam === teamFilter;
        
        row.style.display = matchesSearch && matchesTeam ? '' : 'none';
    });
}

// Add event listeners for search and team filter
document.getElementById('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterAndRenderTable, 100);
});

document.getElementById('teamFilter').addEventListener('change', filterAndRenderTable);

// Table rendering
function renderTable(data = players) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    renderedRows = [];
    
    data.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-700';
        
        player.forEach((cell, cellIndex) => {
            const td = document.createElement('td');
            td.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-300';
            
            // Format numbers with commas
            if (typeof cell === 'number' && cellIndex > 1) {
                td.textContent = cell.toLocaleString();
            } else {
                td.textContent = cell;
            }
            
            // Add mobile-specific classes
            if (isMobile) {
                td.classList.add('text-xs');
            }
            
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
        renderedRows.push(row);
    });
}

function sortTable(columnIndex) {
    const table = document.getElementById('tableBody');
    const rows = Array.from(table.getElementsByTagName('tr'));
    
    // Toggle sort direction
    const th = document.querySelector(`th[onclick="sortTable(${columnIndex})"]`);
    const currentDirection = th.getAttribute('data-sort-direction') || 'asc';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    // Reset all arrows
    document.querySelectorAll('th').forEach(header => {
        header.setAttribute('data-sort-direction', '');
        header.textContent = header.textContent.replace(' ↑', '').replace(' ↓', '');
    });
    
    // Set new arrow
    th.setAttribute('data-sort-direction', newDirection);
    th.textContent = th.textContent.replace(' ↑', '').replace(' ↓', '') + 
                    (newDirection === 'asc' ? ' ↑' : ' ↓');
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue = a.cells[columnIndex].textContent.trim();
        let bValue = b.cells[columnIndex].textContent.trim();
        
        // Handle numeric values
        if (columnIndex === 0 || columnIndex >= 3) {
            aValue = parseFloat(aValue.replace(/,/g, '')) || 0;
            bValue = parseFloat(bValue.replace(/,/g, '')) || 0;
            return newDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle text values (player name and team)
        return newDirection === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
    });
    
    // Re-append sorted rows
    rows.forEach(row => table.appendChild(row));
}

function filterTable() {
    const searchInput = document.getElementById('searchInput');
    const teamFilter = document.getElementById('teamFilter');
    const filterValue = searchInput.value.toLowerCase();
    const teamValue = teamFilter.value.toLowerCase();
    const rows = document.getElementById('tableBody').getElementsByTagName('tr');
    
    for (let row of rows) {
        const playerName = row.cells[1].textContent.toLowerCase();
        const teamName = row.cells[2].textContent.toLowerCase();
        
        const matchesSearch = playerName.includes(filterValue);
        const matchesTeam = teamValue === 'all' || teamName === teamValue;
        
        row.style.display = matchesSearch && matchesTeam ? '' : 'none';
    }
}

// Version v1 - Force cache reset
function loadData() {
    fetch('data.csv?v=' + new Date().getTime())
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = '';
            players = []; // Reset the players cache
            
            // Skip header row and empty rows
            rows.slice(1).forEach((row, index) => {
                if (row.trim()) {
                    const columns = row.split(',').map(col => col.trim());
                    if (columns.length >= 9) {
                        const tr = document.createElement('tr');
                        tr.className = 'hover:bg-gray-700';

                        // Add rank
                        const tdRank = document.createElement('td');
                        tdRank.textContent = index + 1;
                        tdRank.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-300';
                        tr.appendChild(tdRank);

                        // Add player name
                        const tdName = document.createElement('td');
                        tdName.textContent = columns[0];
                        tdName.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-300';
                        tr.appendChild(tdName);

                        // Add team
                        const tdTeam = document.createElement('td');
                        tdTeam.textContent = columns[1];
                        tdTeam.className = 'px-4 py-3 whitespace-nowrap text-sm text-gray-300';
                        tr.appendChild(tdTeam);

                        // Add value columns with header colors
                        [
                            { value: columns[2], color: 'text-blue-400' },    // Common
                            { value: columns[3], color: 'text-green-400' },   // Uncommon
                            { value: columns[4], color: 'text-orange-400' },  // Rare
                            { value: columns[5], color: 'text-red-400' },     // Epic
                            { value: columns[6], color: 'text-purple-400' },  // Legendary
                            { value: columns[7], color: 'text-yellow-400' },  // Mystic
                            { value: columns[8], color: 'text-pink-400' }     // Iconic
                        ].forEach(({ value, color }) => {
                            const td = document.createElement('td');
                            const numValue = parseInt(value.replace(/,/g, '')) || 0;
                            td.textContent = numValue.toLocaleString();
                            td.className = `px-4 py-3 whitespace-nowrap text-sm ${color}`;
                            tr.appendChild(td);
                        });

                        tableBody.appendChild(tr);
                        
                        // Update players cache
                        players.push([
                            index + 1,
                            columns[0],
                            columns[1],
                            parseInt(columns[2].replace(/,/g, '')) || 0,
                            parseInt(columns[3].replace(/,/g, '')) || 0,
                            parseInt(columns[4].replace(/,/g, '')) || 0,
                            parseInt(columns[5].replace(/,/g, '')) || 0,
                            parseInt(columns[6].replace(/,/g, '')) || 0,
                            parseInt(columns[7].replace(/,/g, '')) || 0,
                            parseInt(columns[8].replace(/,/g, '')) || 0
                        ]);
                    }
                }
            });
            
            // Update team filter options
            updateTeamFilter();
            
            // Update the search and filter
            filterTable();
        })
        .catch(error => console.error('Error loading data:', error));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Add event listeners
    document.getElementById('searchInput').addEventListener('input', filterTable);
    document.getElementById('teamFilter').addEventListener('change', filterTable);
}); 