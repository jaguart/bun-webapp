function request(url, method, body) {
  return fetch(url, {
    method,
    ...(body !== undefined && {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
  }).then(response => {
    if (!response.ok) {
      return Promise.reject({
        status: response.status,
        statusText: response.statusText,
        method,
        url: response.url
      });
    }
    return response.json().catch(() => {});
  });
}

const app = Vue.createApp({
  data() {
    return {
      newTodoText: '',
      todos: [],
      error: null,
      // Note: appMeta.time is deliberately server generation time - NOT a live ticker.
      appMeta: { appname: '', env: '', version: '', dbname: '', host: '', date: '', time: '' }
    };
  },
  methods: {
    addNewTodo: function () {
      if (!this.newTodoText) { return; }

      this.error = null;
      request('/api/todos', 'POST', { text: this.newTodoText })
        .then(todo => this.todos.push(todo))
        .catch(error => this.error = error);

      this.newTodoText = '';
    },
    toggleTodo: function (todo) {
      this.error = null;
      request(`/api/todos/${todo.id}/toggle`, 'PATCH')
        .then(updated => { todo.done = updated.done; })
        .catch(error => { this.error = error; });
    },
    deleteTodo: function (todo, event) {
      if (event) event.preventDefault()

      this.error = null;
      request(`/api/todos/${todo.id}`, 'DELETE')
        .then(() => {
          const index = this.todos.indexOf(todo);
          this.todos.splice(index, 1);
        })
        .catch(error => {
          this.error = error;
        });
    }
  }
}).mount('#app');

app.error = null;
request('/api/todos', 'GET')
  .then(todos => app.todos = todos)
  .catch(error => app.error = error);

request('/api/app-meta', 'GET')
  .then(meta => {
    app.appMeta = meta;
  })
  .catch(() => {});
