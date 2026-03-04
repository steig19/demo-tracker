---
layout: default
title: Trail Updates
nav: updates
---

<section class="updates-page">

  <h1>Trail Updates</h1>

  <div id="updates-feed">
    Loading updates…
  </div>

</section>

<script>
  window.UPDATES_INDEX = "{{ '/data/updates.index.json' | relative_url }}";
  window.UPDATES_DIR = "{{ '/data/updates/' | relative_url }}";
</script>

<script src="{{ '/assets/js/updates.js' | relative_url }}"></script>
