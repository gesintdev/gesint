/**
 * Conteúdo injetado por ThemeInitScript no `<head>` (useServerInsertedHTML) — evita flash de tema.
 * `/ponto` força light (`gesint`) sem gravar cookie/localStorage, para não sobrescrever a preferência do app.
 */
export const GESINT_THEME_INIT_SCRIPT = `(function(){try{var path=location.pathname||"";if(path==="/ponto"||path.indexOf("/ponto/")===0){document.documentElement.setAttribute("data-theme","gesint");return}var c=document.cookie.match(/(?:^|; )gesint-theme=([^;]*)/);var p=c?decodeURIComponent(c[1]):null;if(p!=="light"&&p!=="dark"&&p!=="system"){var ls=localStorage.getItem("theme");p=ls==="dark"||ls==="system"?ls:ls==="gesint"||ls==="light"?"light":"light"}var t=p==="dark"?"dark":p==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"gesint"):"gesint";var store=p==="light"?"gesint":p;localStorage.setItem("theme",store);document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","gesint")}})();`;
