// Set current date
document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Sample data for the chart
const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
        label: 'Website Visits',
        data: [12500, 19000, 17000, 22000, 25000, 28000, 32000],
        backgroundColor: 'rgba(74, 111, 165, 0.2)',
        borderColor: 'rgba(74, 111, 165, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
    }, {
        label: 'Purchases',
        data: [800, 1200, 1400, 1800, 2100, 2500, 3000],
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderColor: 'rgba(39, 174, 96, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
    }]
};

// Initialize chart
const ctx = document.getElementById('mainChart').getContext('2d');
const mainChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    drawBorder: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    }
});

// Sample activity data
const activityData = [
    { id: 1, user: 'John Doe', action: 'Purchase', time: '10:30 AM' },
    { id: 2, user: 'Jane Smith', action: 'Sign Up', time: '11:45 AM' },
    { id: 3, user: 'Robert Johnson', action: 'Login', time: '12:15 PM' },
    { id: 4, user: 'Emily Davis', action: 'View Product', time: '1:20 PM' },
    { id: 5, user: 'Michael Wilson', action: 'Add to Cart', time: '2:50 PM' }
];

// Populate activity table
const tableBody = document.getElementById('activityTable');
activityData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.user}</td>
        <td>${item.action}</td>
        <td>${item.time}</td>
    `;
    tableBody.appendChild(row);
});

// Animate metric values
function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = id === 'revenue' ? `$${value.toLocaleString()}` : 
                            id === 'conversion' ? `${value.toFixed(1)}%` : 
                            value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Trigger animations when page loads
window.addEventListener('load', () => {
    animateValue('totalUsers', 0, 2451, 1000);
    animateValue('revenue', 0, 8245, 1000);
    animateValue('conversion', 0, 3.2, 1000);
    animateValue('activeSessions', 0, 1024, 1000);
});
