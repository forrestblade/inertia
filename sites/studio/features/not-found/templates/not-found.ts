export function renderNotFound (): string {
  return `
<section class="section container" style="text-align: center;">
  <h1>404</h1>
  <p class="prose" style="margin-inline: auto;">The page you're looking for doesn't exist. It might have been moved, or it was never here.</p>
  <a href="/" class="btn btn-primary" data-telemetry-type="INTENT_NAVIGATE" data-telemetry-target="404-home">Back to Home</a>
</section>`
}
