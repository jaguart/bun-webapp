<script>
  let { navigate, path, user, logout } = $props();
  let menuOpen = $state(false);
  let menuEl = $state(null);

  function go(e, path) {
    e.preventDefault();
    navigate(path);
  }

  function handleLogout() {
    menuOpen = false;
    logout();
  }

  $effect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuEl && !menuEl.contains(e.target)) menuOpen = false; };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  });
</script>

<nav class="nav">
  <a href="/" class:active={path === "/"} onclick={(e) => go(e, "/")}>Home</a>
  <a href="/todos" class:active={path === "/todos"} onclick={(e) => go(e, "/todos")}>Todos</a>
  <span class="spacer"></span>
  {#if user}
    <div class="user-menu" bind:this={menuEl}>
      <button type="button" class="user-btn" onclick={() => menuOpen = !menuOpen}>
        {user.name} ▾
      </button>
      {#if menuOpen}
        <div class="dropdown">
          <button type="button" onclick={handleLogout}>Sign out</button>
        </div>
      {/if}
    </div>
  {/if}
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  a.active {
    color: var(--heading);
    font-weight: bold;
  }

  .spacer {
    flex: 1;
  }

  .user-menu {
    position: relative;
    align-self: center;
  }

  .user-btn {
    background: none;
    border: none;
    font-size: small;
    letter-spacing: 1px;
    color: var(--text-dim);
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }

  .user-btn:hover {
    color: var(--heading);
  }

  .dropdown {
    position: absolute;
    top: calc(100% + var(--sp-sm));
    right: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    box-shadow: 0 4px 12px var(--shadow);
    white-space: nowrap;
  }

  .dropdown button {
    display: block;
    width: 100%;
    padding: var(--sp-sm) var(--sp-lg);
    background: none;
    border: none;
    font-size: small;
    letter-spacing: 1px;
    color: var(--text);
    cursor: pointer;
    font-family: inherit;
    text-align: left;
  }

  .dropdown button:hover {
    background: var(--row-hover);
    color: var(--heading);
  }
</style>
