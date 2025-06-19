async function insertUserHeader() {
  const header = document.createElement('div');
  header.id = 'user-header';
  header.style.cssText = `
    font-family: sans-serif;
    background: #222;
    color: #eee;
    padding: 0.25em 1em;
    font-size: 0.85em;
    line-height: 1.5em;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
  `;

  console.log('Generated header HTML:', header.innerHTML);

  const style = document.createElement('style');
  style.textContent = `
  .user-link {
    color: #0af;
    text-decoration: none;
    font-weight: bold;
    padding: 0;
    margin: 0;
  }
  .user-link:hover {
    text-decoration: underline;
  }
  #user-header > span, 
  #user-header > div {
    display: flex;
    align-items: center;
  }
`;
  document.head.appendChild(style);
  document.body.prepend(header);

  try {
    const res = await fetch('/auth/me');
    if (!res.ok) throw new Error('Not logged in');
    const user = await res.json();

header.innerHTML = `<span>Logged in as&nbsp;<a href="/" class="user-link">${user.username}</a>${user.is_admin ? '&nbsp;(Admin)' : ''}</span><div><a href="#" class="user-link" onclick="logout()">Log out</a></div>`;

  } catch (err) {
    console.warn('[userHeader] Not logged in or failed:', err);
    header.innerHTML = `
      <div></div>
      <div>
        <a href="/login.html" class="user-link">Log In</a>
      </div>
    `;
  }
}


function logout() {
  fetch('/auth/logout', { method: 'POST' }).then(() => {
    window.location.href = '/login.html';
  });
}

insertUserHeader();