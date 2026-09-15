/**
 * Conteúdo injetado por ThemeInitScript no `<head>` (useServerInsertedHTML) — evita flash de tema.
 * `/ponto` força light (`gommo`) sem gravar cookie/localStorage, para não sobrescrever a preferência do app.
 */
export const GOMMO_THEME_INIT_SCRIPT = `(function(){try{var path=location.pathname||"";if(path==="/ponto"||path.indexOf("/ponto/")===0){document.documentElement.setAttribute("data-theme","gommo");return}var c=document.cookie.match(/(?:^|; )gommo-theme=([^;]*)/);var p=c?decodeURIComponent(c[1]):null;if(p!=="light"&&p!=="dark"&&p!=="system"){var ls=localStorage.getItem("theme");p=ls==="dark"||ls==="system"?ls:ls==="gommo"||ls==="light"?"light":"light"}var t=p==="dark"?"dark":p==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"gommo"):"gommo";var store=p==="light"?"gommo":p;localStorage.setItem("theme",store);document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","gommo")}})();`;
