<script>
  let { appMeta } = $props();
</script>

<!-- button because clickable / ARIA -->
<button class="meta shade" onclick={() => location.reload()}>
  {appMeta.appName} v{appMeta.appVersion}<br>
  {appMeta.ui.name} v{appMeta.ui.version}<br>
  {appMeta.host} {appMeta.date} {appMeta.time}<br>
</button>

<style>
  .meta {
    position: fixed;
    bottom: 1.2em;
    right: 1em;
    z-index: 9999;
  }
</style>
