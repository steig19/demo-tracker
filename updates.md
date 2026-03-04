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
  window.UPDATES_INDEX = "{{ site.baseurl }}/data/updates.index.json";
  window.UPDATES_DIR = "{{ site.baseurl }}/data/updates/";
</script>

<script src="{{ '/assets/js/updates.js' | relative_url }}"></script>
