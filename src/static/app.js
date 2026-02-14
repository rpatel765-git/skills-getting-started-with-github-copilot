document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";


        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <h4>Participants</h4>
            ${details.participants && details.participants.length > 0
              ? `<ul class="participants-list" style="list-style: none; padding-left: 0;">
                    ${details.participants.map(p => `
                      <li style="display: flex; align-items: center;">
                        <span>${p}</span>
                        <button class="delete-btn" data-activity="${name}" data-email="${p}" title="Remove participant" style="margin-left: 8px; background: none; border: none; cursor: pointer; color: #c62828; font-size: 1.1em;">🗑️</button>
                      </li>`).join('')}
                 </ul>`
              : '<p class="info">No participants yet.</p>'}
          </div>
        `;
      // ...existing code...
  // Add event delegation for delete buttons ONCE after DOM is ready
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
      const btn = event.target;
      const activity = btn.getAttribute("data-activity");
      const email = btn.getAttribute("data-email");
      if (confirm(`Remove ${email} from ${activity}?`)) {
        try {
          const response = await fetch(`/activities/${encodeURIComponent(activity)}/participant?email=${encodeURIComponent(email)}`, {
            method: "DELETE",
          });
          const result = await response.json();
          if (response.ok) {
            messageDiv.textContent = result.message;
            messageDiv.className = "success";
            fetchActivities();
          } else {
            messageDiv.textContent = result.detail || "An error occurred";
            messageDiv.className = "error";
          }
          messageDiv.classList.remove("hidden");
          setTimeout(() => {
            messageDiv.classList.add("hidden");
          }, 5000);
        } catch (error) {
          messageDiv.textContent = "Failed to remove participant. Please try again.";
          messageDiv.className = "error";
          messageDiv.classList.remove("hidden");
          setTimeout(() => {
            messageDiv.classList.add("hidden");
          }, 5000);
        }
      }
    }
  });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Function to render activities
  function renderActivities(activities) {
    const activitiesList = document.getElementById('activities-list');
    activitiesList.innerHTML = '';
    if (!activities || activities.length === 0) {
      activitiesList.innerHTML = '<p>No activities available.</p>';
      return;
    }
    activities.forEach(activity => {
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <h4>${activity.name}</h4>
        <p>${activity.description}</p>
        <p><strong>Location:</strong> ${activity.location}</p>
        <p><strong>Time:</strong> ${activity.time}</p>
        <div class="participants-section">
          <h4>Participants</h4>
          ${activity.participants && activity.participants.length > 0
            ? `<ul class="participants-list no-bullets">
                ${activity.participants.map(p => `
                  <li>
                    <span class="participant-name">${p}</span>
                    <span class="delete-participant" title="Remove" data-activity="${activity.name}" data-participant="${p}">&#128465;</span>
                  </li>`).join('')}
             </ul>`
            : '<p class="info">No participants yet.</p>'}
        </div>
      `;
      activitiesList.appendChild(card);
    });

    // Add event listeners for delete icons
    document.querySelectorAll('.delete-participant').forEach(icon => {
      icon.addEventListener('click', function() {
        const activityName = this.getAttribute('data-activity');
        const participant = this.getAttribute('data-participant');
        unregisterParticipant(activityName, participant);
      });
    });
  }

  // Function to unregister a participant from an activity
  function unregisterParticipant(activityName, participant) {
    // TODO: Implement backend call to unregister participant if needed
    // For now, update the UI and local data (simulate)
    if (window.activitiesData) {
      const activity = window.activitiesData.find(a => a.name === activityName);
      if (activity) {
        activity.participants = activity.participants.filter(p => p !== participant);
        renderActivities(window.activitiesData);
      }
    }
    // Optionally, show a message or handle errors
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // Refresh activities list after successful signup
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
