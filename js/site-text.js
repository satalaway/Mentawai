"use strict";
/* Guest website text that is easy to change.
   Edit the words between the quotes, save, and upload this file to update the site. */
const SITE_TEXT={
  heroTitle:"A Hidden Paradise to Explore The Beauty of Indonesia"
};
const _stHome=viewHome;
viewHome=function(){
  return _stHome().replace(/(<div class="wrap hero-copy"><h1>)[^<]*(<\/h1>)/,"$1"+esc(SITE_TEXT.heroTitle)+"$2");
};
render(true);
