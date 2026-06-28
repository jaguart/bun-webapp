<script>
  let { error } = $props();
</script>

{#if error}
  <div class="box error-box">
    <div class="error-header">Error {error.status}: {error.statusText}</div>
    <div class="error-body">
      <strong>Request:</strong><br>
      - Method: {error.method}<br>
      - URL: {error.url}
    </div>
  </div>
{/if}
