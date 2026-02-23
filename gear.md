---
layout: default
title: Gear
permalink: /gear/
---

<div class="card">
  <div class="card-title">Gear</div>
  <div class="card-sub">
    A complete overview of the gear carried on trail, created with lighterpack.com
  </div>
</div>

<div class="card lp-card">
  <div class="lp-shell">
    <div class="lp-frame">
      <!-- Lighterpack embed -->
      <script src="https://lighterpack.com/r/2n8u4p"></script>
      <div id="2n8u4p"></div>
    </div>
  </div>
</div>

<script>
  // Lighterpack Renders an iframe afterwards – we wait briefly until it is there,
  // and then set styling on the iframe element itself (not in the content).
  (function () {
    let tries = 0;
    const timer = setInterval(() => {
      const iframe = document.querySelector('#lm2int iframe');
      tries++;

      if (iframe) {
        iframe.setAttribute('title', 'Lighterpack gear list');
        iframe.style.background = '#ffffff';
        iframe.style.border = '0';
        clearInterval(timer);
      }

      if (tries > 80) clearInterval(timer); // ~8s Timeout
    }, 100);
  })();
</script>

<style>
  /* Reduce width a little + "air" */
  .lp-shell{
    max-width: 980px;          /* Narrower than full width, but still large */
    margin: 0 auto;
    padding: 14px;             /* Air to the edge */
    background: rgba(255,255,255,0.03);
    border-radius: 16px;
  }

  /* Off-white “Paper” Area, so that it doesn't look so squeezed */
  .lp-frame{
    background: #f6f3ea;       /* off-white / paper */
    border-radius: 14px;
    padding: 12px;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.10);
  }

  /* The iframe itself: force height + "bright" look */
  #lm2int iframe{
    width: 100% !important;
    height: 72vh !important;
    max-height: 900px !important;
    border-radius: 12px !important;

    /* THE TRICK: makes dark -> light */
    filter: invert(1) hue-rotate(180deg);
    background: #fff;
    display: block;
  }

  /* A little more height on very small screens */
  @media (max-width: 520px){
    #lm2int iframe{ height: 78vh !important; }
    .lp-shell{ padding: 10px; }
    .lp-frame{ padding: 10px; }
  }
</style>
