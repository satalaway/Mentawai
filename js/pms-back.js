"use strict";
/* Back arrow only on sub pages (pages that are not in the sidebar menu, such as a booking's detail). */
const _backShell=pxShell;
pxShell=function(pg){
  const main=PX_NAV.some(([,items])=>items.some(x=>x[0]===ui.pv));
  return main?_pxExtShell(pg):_backShell(pg);
};
render(true);
