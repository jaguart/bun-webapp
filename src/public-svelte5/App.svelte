<script>
  import { onMount } from "svelte";
  import AppMeta from "./AppMeta.svelte";
  import ErrorBox from "./ErrorBox.svelte";
  import Home from "./Home.svelte";
  import Login from "./Login.svelte";
  import NavMenu from "./NavMenu.svelte";
  import TodoList from "./TodoList.svelte";

  let path = $state(window.location.pathname);

  $effect(() => {
    const onPopState = () => { path = window.location.pathname; };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  });

  async function navigate(to) {
    history.pushState({}, "", to);
    path = to;
    if (to === "/todos" && user) {
      error = null;
      try { todos = await request("/api/todos", "GET"); } catch (e) { error = e; }
    }
  }

  let user = $state(null);
  let todos = $state([]);
  let newTodoText = $state("");
  let error = $state(null);
  let appMeta = $state({ appName: "", appVersion: "", appEnv: "", appDB: "", description: "", host: "", date: "", time: "", ui: { name: "", version: "" } });

  async function request(url, method, body) {
    const res = await fetch(url, {
      method,
      ...(body !== undefined && {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
    });
    if (!res.ok) throw { status: res.status, statusText: res.statusText, method, url: res.url };
    return res.json().catch(() => {});
  }

  onMount(async () => {
    try {
      const me = await fetch("/api/auth/me");
      if (me.ok) user = await me.json();
    } catch (_) {}

    if (user && path === "/todos") {
      try { todos = await request("/api/todos", "GET"); } catch (e) { error = e; }
    }
    try { appMeta = await request("/api/app-meta", "GET"); } catch (_) {}
  });

  async function logout() {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch (_) {}
    user = null;
    todos = [];
  }

  async function onLogin(loggedInUser) {
    user = loggedInUser;
    try { todos = await request("/api/todos", "GET"); } catch (e) { error = e; }
  }

  async function addNewTodo(e) {
    if (e.key !== "Enter" || !newTodoText.trim()) return;
    error = null;
    try {
      const todo = await request("/api/todos", "POST", { text: newTodoText });
      todos = [...todos, todo];
      newTodoText = "";
    } catch (e) { error = e; }
  }

  async function toggleTodo(todo) {
    error = null;
    try {
      const updated = await request(`/api/todos/${todo.id}/toggle`, "PATCH");
      todos = todos.map((t) => (t.id === todo.id ? updated : t));
    } catch (e) { error = e; }
  }

  async function deleteTodo(todo, e) {
    e.preventDefault();
    error = null;
    try {
      await request(`/api/todos/${todo.id}`, "DELETE");
      todos = todos.filter((t) => t.id !== todo.id);
    } catch (e) { error = e; }
  }
</script>

<NavMenu {navigate} {path} {user} {logout} />

{#if path === "/todos"}
  {#if user === null}
    <Login {onLogin} />
  {:else}
    <TodoList {todos} {user} bind:newTodoText onAdd={addNewTodo} onToggle={toggleTodo} onDelete={deleteTodo} />
    <ErrorBox {error} />
  {/if}
{:else}
  <Home {appMeta} />
{/if}

<AppMeta {appMeta} />
