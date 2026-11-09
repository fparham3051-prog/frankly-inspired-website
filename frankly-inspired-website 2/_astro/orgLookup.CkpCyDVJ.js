import{a as e,f as t}from"./healthEngine.e1-5laaS.js";var n=e=>String(e??``).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#039;`})[e]),r=e=>e==null?`–`:(e<0?`−`:``)+(Math.abs(e)>=1e6?`$`+(Math.abs(e)/1e6).toFixed(1)+`M`:`$`+Math.round(Math.abs(e)/1e3)+`K`);function i(e){let t=e.years.map(e=>`<tr><td>FY${e.year}</td><td>${r(e.revenue)}</td><td>${r(e.expenses)}</td><td class="${(e.surplus??0)<0?`is-neg`:``}">${r(e.surplus)}</td><td>${r(e.netAssets)}</td></tr>`).join(``),i=e.signals.map(e=>`<li class="sig-${e.tone}">${n(e.text)}</li>`).join(``);return`
    <div class="org-snapshot">
      <p class="org-snapshot-name"><strong>${n(e.org.name)}</strong> &middot; EIN ${n(e.org.ein)}${e.org.city?` &middot; `+n(e.org.city)+`, `+n(e.org.state):``}
        <button type="button" class="link-btn" data-org-change>Change</button></p>
      ${e.years.length?`
      <div class="org-table-wrap"><table class="org-table">
        <thead><tr><th>Filed year</th><th>Revenue</th><th>Expenses</th><th>Surplus</th><th>Net assets</th></tr></thead>
        <tbody>${t}</tbody></table></div>
      <h4>What a funder sees in these filings</h4>
      <ul class="org-signals">${i}</ul>`:`<p>No financial data has been published for this organization's filings yet. Smaller organizations filing a 990-N postcard won't have figures here.</p>`}
      <p class="org-source">Source: ${n(e.source)}. <a href="${n(e.links.propublica)}" target="_blank" rel="noopener">See the filings</a> &middot; <a href="${n(e.links.candid)}" target="_blank" rel="noopener">See your Candid profile</a></p>
    </div>`}function a(r,a){if(!r)return;r.innerHTML=`
    <div class="org-lookup">
      <label for="org-q">Find your organization <span class="optional">(optional)</span></label>
      <p class="fh-field-help">Search by name or EIN to pull your public Form 990 figures. Nothing you type is stored.</p>
      <div class="org-search-row">
        <input type="search" id="org-q" placeholder="Organization name or EIN" autocomplete="off" />
        <button type="button" class="btn btn-secondary" data-org-search>Search</button>
      </div>
      <p class="form-status" data-org-status role="status" aria-live="polite"></p>
      <ul class="org-results" data-org-results></ul>
    </div>
    <div data-org-snapshot></div>`;let o=r.querySelector(`#org-q`),s=r.querySelector(`[data-org-status]`),c=r.querySelector(`[data-org-results]`),l=r.querySelector(`[data-org-snapshot]`),u=r.querySelector(`.org-lookup`),d=e=>{s.textContent=`Loading filings...`,fetch(`https://frankly-inspired-api.onrender.com/api/org-990?ein=`+encodeURIComponent(e)).then(e=>e.json()).then(e=>{if(!e||!e.ok)throw Error(e&&e.error||`Lookup is unavailable right now.`);let n=e;t({ein:n.org.ein,name:n.org.name,city:n.org.city,state:n.org.state}),s.textContent=``,c.innerHTML=``,u.hidden=!0,l.innerHTML=i(n),l.querySelector(`[data-org-change]`)?.addEventListener(`click`,()=>{t(null),l.innerHTML=``,u.hidden=!1,o.focus()}),window.fiTrack?.(`org_990_loaded`,{}),a?.(n)}).catch(e=>{s.textContent=e.message,u.hidden=!1})},f=()=>{let e=o.value.trim();if(e.length<3){s.textContent=`Type at least three characters.`;return}s.textContent=`Searching...`,c.innerHTML=``,fetch(`https://frankly-inspired-api.onrender.com/api/org-search?q=`+encodeURIComponent(e)).then(e=>e.json()).then(e=>{let t=e&&e.ok?e.results:null;if(!t)throw Error(e&&e.error||`Lookup is unavailable right now.`);if(!t.length){s.textContent=`No match. Try a shorter name or your EIN.`;return}s.textContent=``,c.innerHTML=t.map(e=>`<li><button type="button" data-ein="${n(e.ein)}"><strong>${n(e.name)}</strong><span>${n([e.city,e.state].filter(Boolean).join(`, `))} &middot; EIN ${n(e.ein)}</span></button></li>`).join(``),c.querySelectorAll(`button[data-ein]`).forEach(e=>e.addEventListener(`click`,()=>d(e.dataset.ein)))}).catch(e=>{s.textContent=e.message})};r.querySelector(`[data-org-search]`).addEventListener(`click`,f),o.addEventListener(`keydown`,e=>{e.key===`Enter`&&(e.preventDefault(),f())});let p=e().org;p&&d(p.ein)}export{a as t};