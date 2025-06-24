// assets/js/dungeon-ui.js

function showMessage(text, duration = 3000, allowHTML = false) {
  const infoBox = document.getElementById("infoBox");
  if (!infoBox) return;

  const safeText = allowHTML ? text : escapeHTML(text).replace(/\n/g, "<br>");
  infoBox.innerHTML = safeText;
  infoBox.style.opacity = 1;

  if (showMessage._timeout) clearTimeout(showMessage._timeout);
  showMessage._timeout = setTimeout(() => {
    infoBox.innerHTML = "";
    infoBox.style.opacity = 0.5;
  }, duration);
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[m]);
}

function logout() {
  fetch('/auth/logout', { method: 'POST' }).then(() => {
    location.href = '/login.html';
  });
}

async function insertUserHeader() {
  const header = document.getElementById('user-header');
  try {
    const res = await fetch('/auth/me');
    if (!res.ok) throw new Error('Not logged in');
    const user = await res.json();

    header.innerHTML = `
      <span><a href="/" class="user-link">${user.username}</a>${user.is_admin ? ' (Admin)' : ''}</span>
      <div><a href="#" class="user-link" onclick="logout()">Log out</a></div>
    `;
  } catch {
    header.innerHTML = `
      <div></div>
      <div><a href="/login.html" class="user-link">Log In</a> |
           <a href="/register.html" class="user-link">Sign Up</a></div>
    `;
  }
}
