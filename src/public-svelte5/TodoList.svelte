<script>
  let { todos, newTodoText = $bindable(), onAdd, onToggle, onDelete, user } = $props();

  const isAdmin = () =>
    user?.capabilities?.split(";").map((s) => s.trim()).includes("admin") ?? false;
</script>

<div class="box shade">
  <h1>To-Do List: {isAdmin() ? "Everyone" : user?.name}</h1>
  {#each todos as todo (todo.id)}
    <div class="row">
      <div class="done-wrapper">
        <input type="checkbox" checked={todo.done} onchange={() => onToggle(todo)}>
      </div>
      {#if isAdmin()}
        <div class="user-tag" data-email={todo.userEmail}>{todo.userName}</div>
      {/if}
      <div class="text" class:done={todo.done}>{todo.text}</div>
      <div class="delete-wrapper">
        <input type="checkbox" onclick={(e) => onDelete(todo, e)}>
      </div>
    </div>
  {/each}
  <div class="row">
    <input id="new-todo" type="text" class="text-input" bind:value={newTodoText} onkeyup={onAdd} placeholder="Type a new to-do and press Enter">
  </div>
</div>

<style>
  .user-tag {
    position: relative;
    font-size: small;
    color: var(--text-dim);
    letter-spacing: 0.5px;
    align-self: center;
    margin-right: var(--sp-sm);
    white-space: nowrap;
    min-width: 6em;
    cursor: default;
  }

  .user-tag::after {
    content: attr(data-email);
    position: absolute;
    bottom: calc(100% + 4px);
    left: 0;
    background: var(--hover);
    color: var(--surface);
    font-size: x-small;
    letter-spacing: 0.5px;
    padding: 0.25em 0.5em;
    border-radius: 3px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  }

  .user-tag:hover::after {
    opacity: 1;
  }
</style>
