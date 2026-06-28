<script>
  let { onLogin } = $props();

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let submitting = $state(false);

  async function handleSubmit(e) {
    e.preventDefault();
    error = "";
    submitting = true;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        error = data.error ?? "Login failed";
        return;
      }
      const user = await res.json();
      onLogin(user);
    } catch {
      error = "Network error";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="box shade login-box">
  <h1>Sign in</h1>
  <form onsubmit={handleSubmit}>
    <div class="field">
      <label for="email">Email</label>
      <input
        id="email"
        type="email"
        class="text-input"
        bind:value={email}
        autocomplete="email"
        required
      />
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input
        id="password"
        type="password"
        class="text-input"
        bind:value={password}
        autocomplete="current-password"
        required
      />
    </div>
    {#if error}
      <p class="login-error">{error}</p>
    {/if}
    <button type="submit" class="login-btn" disabled={submitting}>
      {submitting ? "Signing in…" : "Sign in"}
    </button>
  </form>
</div>

<style>
  .login-box {
    margin-top: 4em;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3em;
    margin-bottom: var(--sp-lg);
  }

  label {
    font-size: small;
    letter-spacing: 1px;
    color: var(--text-dim);
  }

  .text-input {
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: var(--sp-sm);
    font-size: 1em;
    font-family: inherit;
    background: var(--bg);
    color: var(--text);
    width: 100%;
    box-sizing: border-box;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--text-dim);
  }

  .login-btn {
    width: 100%;
    padding: var(--sp-sm) var(--sp-lg);
    background: var(--heading);
    color: var(--surface);
    border: none;
    border-radius: 4px;
    font-size: 1em;
    font-family: inherit;
    letter-spacing: 1px;
    cursor: pointer;
    margin-top: var(--sp-sm);
  }

  .login-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-error {
    color: var(--error);
    font-size: small;
    margin: 0 0 var(--sp-sm);
  }
</style>
