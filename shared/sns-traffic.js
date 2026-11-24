/* Route official SNS links through the Hub's existing visit attribution. */
(() => {
 const channels = ['threads', 'x', 'instagram', 'youtube'];
 const channel = document.documentElement.dataset.snsChannel;
 const hub = new URL('/Formwheel/', location.href);
 if (channels.includes(channel)) {
   const current = new URL(location.href);
   for (const [key, value] of current.searchParams) {
     if (key === 'utm_campaign' || key === 'utm_content' || key === 'utm_term') {
       hub.searchParams.set(key, value);
     }
   }
   hub.searchParams.set('utm_source', channel);
   hub.searchParams.set('utm_medium', 'social');
 }
 location.replace(hub.href);
})();
