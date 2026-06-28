<script>
  let { appMeta } = $props();
</script>

<article class="box shade">
  <section>
    <h1>{appMeta.appName}</h1>
    <p>{appMeta.description}</p>
    {#if appMeta.repository}
      <p><a href={appMeta.repository} target="_aside">{appMeta.repository}</a></p>
      <figure>
        <figcaption>Scaffold new repo with:</figcaption>
        <code>bun create jaguart/bun-webapp my-app</code>
      </figure>
    {/if}
  </section>

  <section class="credits">
    <h2>Stack</h2>
    <ul>
      <li><a href='https://bun.sh' target='_aside'>Bun</a> — runtime, bundler, test runner</li>
      <li><a href='https://elysiajs.com' target='_aside'>Elysia</a> — HTTP framework</li>
      <li><a href='https://svelte.dev' target='_aside'>Svelte 5</a> — default UI</li>
      <li><a href='https://vuejs.org' target='_aside'>Vue 3</a> — alternate UI</li>
    </ul>
  </section>

  {#if appMeta.author || appMeta.homepage}
    <footer>
      <address>
        {#if appMeta.author}{appMeta.author}{/if}
        {#if appMeta.homepage}
          <a href={appMeta.homepage} target="_aside">{appMeta.homepage}</a>
        {/if}
      </address>
    </footer>
  {/if}
</article>


<style>

h1 {
  color: var(--heading);
  margin-top: var(--sp-sm);
  text-align: center;
}

section > p {
  text-align: center;
}

section.credits {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.credits h2 {
  margin-bottom: 0.25em;
}

.credits ul {
  margin: 0;
  padding-bottom: 0.25em;
}

.credits li {
  padding-bottom: 0.25em;
}

figure {
  margin: var(--sp-sm) 0;
  text-align: center;
}

figcaption {
  font-size: small;
  color: var(--text-dim);
  margin-bottom: 0.25em;
}

footer {
  margin-top: var(--sp-lg);
  font-size: small;
  color: var(--text-dim);
  text-align: center;
}

footer address {
  font-style: normal;
}

footer a {
  color: var(--text-dim);
}

</style>
