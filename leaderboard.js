document.addEventListener("DOMContentLoaded", () => {
    fetchLeaderboard();
});

function fetchLeaderboard() {
    console.log("Fetching leaderboard...");
    fetch("leaderboard.php")
        .then(response => response.json())
        .then(data => {
            console.log("Leaderboard Data:", data);
            displayLeaderboard(data);
        })
        .catch(error => {
            console.error("Error fetching leaderboard:", error);
        });
}

function displayLeaderboard(leaderboardData) {
    console.log("Displaying leaderboard:", leaderboardData);
    const leaderboardTable = document.getElementById("leaderboard-table");
    const leaderboardBody = leaderboardTable.querySelector("tbody");

    if (!leaderboardBody) {
        const newTbody = document.createElement('tbody');
        leaderboardTable.appendChild(newTbody);
    }

    leaderboardBody.innerHTML = "";

    if (leaderboardData.length === 0) {
        leaderboardBody.innerHTML = "<tr><td colspan='2'>No scores yet.</td></tr>";
        return;
    }

    leaderboardData.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.username}</td>
            <td>${entry.score}</td>
        `;
        leaderboardBody.appendChild(row);
    });
}