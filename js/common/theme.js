/*
 * Theme mode control: light / dark / system.
 *
 * The preference is stored in the "theme" cookie ("light" | "dark" | "system",
 * default "system"). The effective theme is applied as
 * <html data-theme="light|dark"> by the inline bootstrap in each HTML shell
 * before first paint (to avoid flashing); this module wires the toggle control
 * and keeps the page in sync when the OS color scheme changes.
 */
(function () {
	var KEY = "theme";
	var CYCLES = ["light", "dark", "system"];
	var ICONS = { light: "\u2600 ", dark: "\u263E ", system: "\u25D0 " };

	function getPref() {
		var v = "";
		var parts = document.cookie.split(";");
		for (var i = 0; i < parts.length; i++) {
			var pair = parts[i].split("=");
			if (pair[0].trim() === KEY) {
				v = decodeURIComponent(pair[1]).trim();
				break;
			}
		}
		return (v === "dark" || v === "light" || v === "system") ? v : "system";
	}

	function setPref(pref) {
		var exp = new Date(Date.now() + 3600 * 24 * 365 * 5 * 1000);
		document.cookie = KEY + "=" + pref + "; path=/; expires=" + exp.toGMTString();
	}

	function systemDark() {
		return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
	}

	function resolve(pref) {
		return pref === "system" ? (systemDark() ? "dark" : "light") : pref;
	}

	function apply() {
		var eff = resolve(getPref());
		document.documentElement.setAttribute("data-theme", eff);
		return eff;
	}

	function str(key) {
		return (window._S && _S[key]) || (window.gStrings && gStrings[key]) || "";
	}

	function syncUI() {
		var btn = document.getElementById("ThemeSwitcher");
		if (!btn) return;
		var pref = getPref();
		btn.setAttribute("data-theme-pref", pref);
		btn.title = str("theme_title") || "Theme";
		var val = document.getElementById("ThemeSwitcherVal");
		if (val) {
			val.textContent = ICONS[pref] + (str("theme_" + pref) || pref);
		}
	}

	function cycle() {
		var cur = getPref();
		var next = CYCLES[(CYCLES.indexOf(cur) + 1) % CYCLES.length];
		setPref(next);
		apply();
		syncUI();
	}

	function onKey(e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			cycle();
		}
	}

	function init() {
		var mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
		if (mq) {
			var onSystemChange = function () {
				if (getPref() === "system") {
					apply();
					syncUI();
				}
			};
			if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
			else if (mq.addListener) mq.addListener(onSystemChange);
		}
		apply();
		syncUI();
		var btn = document.getElementById("ThemeSwitcher");
		if (btn) {
			btn.onclick = cycle;
			btn.onkeydown = onKey;
		}
	}

	window.Theme = {
		getPref: getPref,
		setPref: setPref,
		resolve: resolve,
		apply: apply,
		cycle: cycle,
		init: init
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
