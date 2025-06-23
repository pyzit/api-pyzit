(function () {
  const tools = [
    {% for tool in tools %}
      {
        name: "{{ tool.name|escapejs }}",
        url: "{{ tool.url|escapejs }}",
        logo: "{{ tool.logo_url|escapejs }}",
        description: "{{ tool.description|default_if_none:''|escapejs }}",
        team: "{{ tool.team|default_if_none:''|escapejs }}",
        owner: "{{ tool.owner|default_if_none:''|escapejs }}",
        version: "{{ tool.version|default_if_none:''|escapejs }}",
        last_updated: "{{ tool.last_updated|default_if_none:''|escapejs }}",
        documentation_url: "{{ tool.documentation_url|default_if_none:''|escapejs }}",
        support_url: "{{ tool.support_url|default_if_none:''|escapejs }}"
      },
    {% endfor %}
  ];

  // --- Config ---
  const watermarkConfig = {
    imageUrl: "https://www.pyzit.com/pyzit_logo.png",
    altText: "Pyzit Inc.",
    height: "28px",
  };
  const RECENT_KEY = 'pyzit-tool-launcher-recent';

  // --- Theme Detection ---
  let currentTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const scriptUrl = new URL(document.currentScript.src);
  const themeParam = scriptUrl.searchParams.get('theme');
  if (themeParam && (themeParam === 'dark' || themeParam === 'light')) {
    currentTheme = themeParam;
  }

  // --- Container ---
  const container = document.getElementById("pyzit-tool-launcher");
  if (!container) {
    console.error("Tool launcher container with ID 'pyzit-tool-launcher' not found. Widget cannot be embedded.");
    return;
  }
  container.style.position = "relative";
  container.style.display = "inline-block";
  container.style.zIndex = "1000";

  // --- Styles ---
  const style = document.createElement("style");
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Roboto', 'Noto Sans', sans-serif, 'Segoe UI', Arial, sans-serif; }
    .pyzit-tool-panel-wrapper {
      --widget-bg: #fff;
      --widget-text-primary: #202124;
      --widget-text-secondary: #5f6368;
      --widget-shadow-primary: rgba(0,0,0,0.15);
      --widget-shadow-secondary: rgba(0,0,0,0.1);
      --widget-border-light: #ededed;
      --widget-hover-bg: #f8f9fa;
      --widget-active-bg: #e8eaed;
      --widget-ripple-color: rgba(95, 99, 104, 0.08);
      --widget-ripple-active-color: rgba(95, 99, 104, 0.12);
      --widget-blur: 16px;
      --widget-scrollbar-width: 6px;
      --widget-scrollbar-thumb-bg: rgba(0,0,0,0.2);
      --widget-scrollbar-thumb-hover-bg: rgba(0,0,0,0.3);
      --widget-icon-fill: #5f6368;
      --widget-app-icon-fallback-fill: #4285F4;
      --widget-watermark-border: #f1f1f1;
      --widget-watermark-bg: #fff;
      --search-bg: #f1f3f4;
      --search-border: #e0e0e0;
      --search-text: #333;
    }
    .pyzit-tool-panel-wrapper.theme-dark {
      --widget-bg: #202124;
      --widget-text-primary: #e8eaed;
      --widget-text-secondary: #bdc1c6;
      --widget-shadow-primary: rgba(0,0,0,0.4);
      --widget-shadow-secondary: rgba(0,0,0,0.3);
      --widget-border-light: #3c4043;
      --widget-hover-bg: #303134;
      --widget-active-bg: #424242;
      --widget-ripple-color: rgba(232, 234, 237, 0.08);
      --widget-ripple-active-color: rgba(232, 234, 237, 0.12);
      --widget-blur: 24px;
      --widget-scrollbar-thumb-bg: rgba(255,255,255,0.2);
      --widget-scrollbar-thumb-hover-bg: rgba(255,255,255,0.3);
      --widget-icon-fill: #bdc1c6;
      --widget-app-icon-fallback-fill: #8ab4f8;
      --widget-watermark-border: #3c4043;
      --widget-watermark-bg: #202124;
      --search-bg: #292a2d;
      --search-border: #444;
      --search-text: #eee;
    }
    .pyzit-activator-button {
      width: 54px; height: 54px; min-width: 54px;
      border-radius: 50%; background: var(--widget-bg);
      box-shadow: 0 2px 8px var(--widget-shadow-primary);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden; border: none; outline: none; user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .pyzit-activator-button:hover { background: var(--widget-hover-bg); }
    .pyzit-activator-button:active { background: var(--widget-active-bg); transform: scale(0.96);}
    .pyzit-activator-icon {
      width: 28px; height: 28px; min-width: 28px;
      background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"%3E%3Cpath fill="var(--widget-icon-fill)" d="M4 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-12c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/%3E%3C/svg%3E');
      background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.9;
    }
    .pyzit-tool-panel-wrapper {
      position: absolute; top: 100%; left: 0; margin-top: 12px;
      background: var(--widget-bg); border-radius: 16px;
      box-shadow: 0 8px 32px var(--widget-shadow-primary), 0 16px 40px var(--widget-shadow-secondary);
      width: 340px; max-width: calc(100vw - 24px); min-width: 260px;
      max-height: 60vh; opacity: 0; transform: translateY(24px) scale(0.96);
      transition: opacity 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1);
      pointer-events: none; transform-origin: top left; color: var(--widget-text-primary);
      display: flex; flex-direction: column; overflow: hidden;
      backdrop-filter: blur(var(--widget-blur));
      border: 1px solid var(--widget-border-light);
      z-index: 10001;
    }
    .pyzit-tool-panel-wrapper.is-visible {
      opacity: 1; transform: translateY(0) scale(1); pointer-events: auto;
    }
    @media (max-width: 600px) {
      .pyzit-tool-panel-wrapper {
        position: fixed; left: 0; right: 0; bottom: 0; top: auto; margin: 0;
        width: 100vw; min-width: 0; max-width: 100vw; max-height: 90vh;
        border-radius: 18px 18px 0 0; box-shadow: 0 -4px 32px var(--widget-shadow-primary);
        transform: translateY(100%);
        transition: transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s cubic-bezier(0.4,0,0.2,1);
      }
      .pyzit-tool-panel-wrapper.is-visible {
        transform: translateY(0);
      }
      .pyzit-activator-button { width: 48px; height: 48px; min-width: 48px; }
      .pyzit-activator-icon { width: 22px; height: 22px; min-width: 22px; }
    }
    .pyzit-panel-header {
      padding: 16px 20px; border-bottom: 1px solid var(--widget-border-light);
      display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
      background: transparent;
    }
    .pyzit-panel-title-container { flex: 1; min-width: 0; }
    .pyzit-panel-title {
      font-size: 17px; font-weight: 600; color: var(--widget-text-primary);
      margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      letter-spacing: 0.01em;
    }
    .pyzit-panel-subtitle {
      font-size: 13px; color: var(--widget-text-secondary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .pyzit-theme-toggle {
      width: 32px; height: 32px; border-radius: 50%; background: none; border: none;
      cursor: pointer; margin-left: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
      transition: background-color 0.2s; position: relative; overflow: hidden;
    }
    .pyzit-theme-toggle:hover { background: var(--widget-hover-bg);}
    .pyzit-theme-toggle:active { background: var(--widget-active-bg);}
    .pyzit-theme-toggle:focus { outline: none; box-shadow: 0 0 0 2px rgba(66,133,244,0.3);}
    .pyzit-theme-toggle-icon { width: 20px; height: 20px; transition: opacity 0.2s, transform 0.2s; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);}
    .pyzit-theme-toggle-icon.sun { opacity: 1;}
    .pyzit-tool-panel-wrapper.theme-dark .pyzit-theme-toggle-icon.sun { opacity: 0; transform: translate(-50%,-50%) rotate(90deg);}
    .pyzit-theme-toggle-icon.moon { opacity: 0; transform: translate(-50%,-50%) rotate(-90deg);}
    .pyzit-tool-panel-wrapper.theme-dark .pyzit-theme-toggle-icon.moon { opacity: 1; transform: translate(-50%,-50%) rotate(0deg);}
    .pyzit-tool-search-bar {
      width: 100%; padding: 10px 16px; border: none; border-bottom: 1px solid var(--search-border);
      background: var(--search-bg); color: var(--search-text); font-size: 15px; outline: none;
      transition: background 0.2s, border 0.2s; margin-bottom: 0;
      border-radius: 0; box-shadow: none;
    }
    .pyzit-tool-search-bar:focus { background: var(--widget-hover-bg);}
    .pyzit-tool-content-scroll {
      padding: 12px 16px 0 16px; flex-grow: 1; flex-shrink: 1; flex-basis: 0%;
      overflow-y: auto; min-height: 0; -webkit-overflow-scrolling: touch;
    }
    .pyzit-tool-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 12px; padding-bottom: 16px;
    }
    @media (max-width: 600px) {
      .pyzit-tool-grid { grid-template-columns: repeat(2, 1fr);}
    }
    .pyzit-tool-section-title {
      font-size: 13px; font-weight: 500; color: var(--widget-text-secondary);
      margin: 10px 0 4px 4px; letter-spacing: 0.01em;
    }
    .pyzit-tool-item {
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      cursor: pointer; padding: 10px 4px; border-radius: 10px; background: transparent;
      transition: background 0.15s, transform 0.05s; text-decoration: none; color: inherit;
      position: relative; user-select: none; min-height: 90px; min-width: 0;
      outline: none;
    }
    .pyzit-tool-item:focus-visible { box-shadow: 0 0 0 2px #4285F4; z-index: 2;}
    .pyzit-tool-item::before {
      content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0;
      background: var(--widget-ripple-color); border-radius: 50%; opacity: 0;
      transform: translate(-50%, -50%); transition: width 0.3s, height 0.3s, opacity 0.3s; z-index: 0;
    }
    .pyzit-tool-item:hover::before, .pyzit-tool-item:focus-visible::before {
      width: calc(100% + 20px); height: calc(100% + 20px); opacity: 1;
    }
    .pyzit-tool-item:active::before {
      transition: none; width: calc(100% + 20px); height: calc(100% + 20px); opacity: 1;
      background: var(--widget-ripple-active-color);
    }
    .pyzit-tool-item-icon-wrapper {
      width: 48px; height: 48px; border-radius: 22%; background: transparent;
      display: flex; align-items: center; justify-content: center; margin-bottom: 8px; overflow: hidden; flex-shrink: 0; z-index: 1;
    }
    .pyzit-tool-item-logo { width: 100%; height: 100%; object-fit: contain; filter: none;}
    .pyzit-tool-item-label {
      font-size: 13px; text-align: center; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
      white-space: nowrap; font-weight: 400; color: var(--widget-text-primary); z-index: 1; line-height: 1.3; padding: 0 4px;
    }
    .pyzit-tool-content-scroll::-webkit-scrollbar { width: var(--widget-scrollbar-width);}
    .pyzit-tool-content-scroll::-webkit-scrollbar-thumb { background: var(--widget-scrollbar-thumb-bg); border-radius: 10px;}
    .pyzit-tool-content-scroll::-webkit-scrollbar-thumb:hover { background: var(--widget-scrollbar-thumb-hover-bg);}
    .pyzit-tool-content-scroll { scrollbar-width: thin; scrollbar-color: var(--widget-scrollbar-thumb-bg) transparent;}
    .widget-watermark {
      position: sticky; bottom: 0; left: 0; right: 0; display: flex; align-items: end; justify-content: end;
      padding: 10px 20px; border-top: 1px solid var(--widget-watermark-border); background: var(--widget-watermark-bg);
      z-index: 10; flex-shrink: 0; box-shadow: 0 -2px 5px rgba(0,0,0,0.03); min-height: 48px;
    }
    .widget-watermark img {
      max-height: var(--watermark-height, 28px); opacity: var(--watermark-opacity, 1);
      filter: var(--watermark-filter, none); transition: opacity 0.2s; display: block;
    }
    .widget-watermark img:hover { opacity: 0.9;}
    .pyzit-tool-detail-section {
      padding: 24px 12px 12px 12px;
      display: flex; flex-direction: column; align-items: center;
      min-height: 220px;
      animation: fadeIn 0.25s;
    }
    .pyzit-tool-detail-logo {
      width: 64px; height: 64px; border-radius: 18%; margin-bottom: 12px; object-fit: contain; background: #f5f5f5;
      box-shadow: 0 2px 8px var(--widget-shadow-primary);
    }
    .pyzit-tool-detail-title {
      font-size: 19px; font-weight: 600; margin-bottom: 4px; color: var(--widget-text-primary); text-align: center;
    }
    .pyzit-tool-detail-desc {
      font-size: 14px; color: var(--widget-text-secondary); margin-bottom: 12px; text-align: center; max-width: 90%;
    }
    .pyzit-tool-detail-meta {
      font-size: 13px; color: var(--widget-text-secondary); margin-bottom: 10px; text-align: center;
    }
    .pyzit-tool-detail-links {
      display: flex; gap: 12px; margin-bottom: 14px; justify-content: center;
    }
    .pyzit-tool-detail-links a {
      color: #4285F4; text-decoration: none; font-size: 13px; border: 1px solid #e0e0e0; border-radius: 6px; padding: 4px 10px; background: #f8f9fa;
      transition: background 0.2s, border 0.2s;
    }
    .pyzit-tool-detail-links a:hover { background: #e8eaed; border-color: #bdbdbd;}
    .pyzit-tool-detail-open {
      margin-top: 10px; font-size: 15px; font-weight: 500; color: #fff; background: #4285F4; border: none; border-radius: 8px; padding: 8px 22px; cursor: pointer; transition: background 0.2s;
      box-shadow: 0 2px 8px var(--widget-shadow-primary);
    }
    .pyzit-tool-detail-open:hover { background: #3367d6;}
    .pyzit-tool-detail-back {
      margin-top: 18px; font-size: 14px; color: var(--widget-text-secondary); background: none; border: none; cursor: pointer; text-decoration: underline;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px);}
      to { opacity: 1; transform: translateY(0);}
    }
    /* Close button for mobile sheet */
    .pyzit-panel-close {
      display: none; background: none; border: none; font-size: 24px; color: var(--widget-text-secondary);
      cursor: pointer; margin-left: 8px; margin-right: -8px; padding: 0 8px; border-radius: 50%;
      transition: background 0.2s;
    }
    .pyzit-panel-close:hover { background: var(--widget-hover-bg);}
    @media (max-width: 600px) {
      .pyzit-panel-close { display: block;}
    }
  `;
  document.head.appendChild(style);

  // Set CSS variables for watermark
  document.documentElement.style.setProperty('--watermark-height', watermarkConfig.height);

  // --- Elements ---
  const toolPanelWrapper = document.createElement("div");
  toolPanelWrapper.className = "pyzit-tool-panel-wrapper";
  if (currentTheme === 'dark') toolPanelWrapper.classList.add('theme-dark');
  toolPanelWrapper.setAttribute("role", "menu");
  toolPanelWrapper.setAttribute("tabindex", "-1");

  // Activator button
  const activatorButton = document.createElement("button");
  activatorButton.className = "pyzit-activator-button";
  activatorButton.setAttribute("aria-label", "Open app launcher");
  activatorButton.setAttribute("aria-haspopup", "true");
  activatorButton.setAttribute("aria-expanded", "false");
  const activatorIcon = document.createElement("div");
  activatorIcon.className = "pyzit-activator-icon";
  activatorButton.appendChild(activatorIcon);

  // Panel Header
  const panelHeader = document.createElement("div");
  panelHeader.className = "pyzit-panel-header";
  // Title container
  const titleContainer = document.createElement("div");
  titleContainer.className = "pyzit-panel-title-container";
  const panelTitle = document.createElement("h3");
  panelTitle.textContent = "Pyzit Tools";
  panelTitle.className = "pyzit-panel-title";
  const panelSubtitle = document.createElement("div");
  panelSubtitle.textContent = "Quick access to your services";
  panelSubtitle.className = "pyzit-panel-subtitle";
  titleContainer.appendChild(panelTitle);
  titleContainer.appendChild(panelSubtitle);

  // Theme toggle button
  const themeToggle = document.createElement("button");
  themeToggle.className = "pyzit-theme-toggle";
  themeToggle.setAttribute("aria-label", "Toggle theme");
  themeToggle.setAttribute("title", "Toggle dark/light mode");
  // Sun icon
  const sunIcon = document.createElement("div");
  sunIcon.className = "pyzit-theme-toggle-icon sun";
  sunIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>`;
  // Moon icon
  const moonIcon = document.createElement("div");
  moonIcon.className = "pyzit-theme-toggle-icon moon";
  moonIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/></svg>`;
  themeToggle.appendChild(sunIcon);
  themeToggle.appendChild(moonIcon);

  // Mobile close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "pyzit-panel-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = "&times;";

  panelHeader.appendChild(titleContainer);
  panelHeader.appendChild(themeToggle);
  panelHeader.appendChild(closeBtn);
  toolPanelWrapper.appendChild(panelHeader);

  // Search bar
  const searchBar = document.createElement("input");
  searchBar.type = "search";
  searchBar.className = "pyzit-tool-search-bar";
  searchBar.placeholder = "Search apps...";
  searchBar.setAttribute("aria-label", "Search apps");
  toolPanelWrapper.appendChild(searchBar);

  // Scrollable content
  const scrollableContent = document.createElement("div");
  scrollableContent.className = "pyzit-tool-content-scroll";
  toolPanelWrapper.appendChild(scrollableContent);

  // Helper: Get/Set recent tools
  function getRecentTools() {
    try {
      const arr = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function addRecentTool(name) {
    try {
      let arr = getRecentTools();
      arr = arr.filter(n => n !== name);
      arr.unshift(name);
      arr = arr.slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
    } catch {}
  }

  // Render grid
  function renderGrid(filter = "") {
    scrollableContent.innerHTML = "";
    let filtered = tools;
    if (filter) {
      filtered = tools.filter(t => t.name.toLowerCase().includes(filter.toLowerCase()));
    }
    // Recent
    const recentNames = getRecentTools();
    const recentTools = recentNames.map(n => tools.find(t => t.name === n)).filter(Boolean).filter(t => !filter || t.name.toLowerCase().includes(filter.toLowerCase()));
    if (recentTools.length && !filter) {
      const recentTitle = document.createElement("div");
      recentTitle.className = "pyzit-tool-section-title";
      recentTitle.textContent = "Recent";
      scrollableContent.appendChild(recentTitle);
      const recentGrid = document.createElement("div");
      recentGrid.className = "pyzit-tool-grid";
      recentTools.forEach(tool => recentGrid.appendChild(createToolItem(tool)));
      scrollableContent.appendChild(recentGrid);
    }
    // All tools
    const allTitle = document.createElement("div");
    allTitle.className = "pyzit-tool-section-title";
    allTitle.textContent = "All Apps";
    scrollableContent.appendChild(allTitle);
    const toolGrid = document.createElement("div");
    toolGrid.className = "pyzit-tool-grid";
    filtered.forEach(tool => toolGrid.appendChild(createToolItem(tool)));
    scrollableContent.appendChild(toolGrid);
  }

  // Render tool detail section
  function renderToolDetail(tool) {
    scrollableContent.innerHTML = "";
    const section = document.createElement("div");
    section.className = "pyzit-tool-detail-section";

    section.addEventListener("click", (e) => {
    e.stopPropagation();
  });

    // Logo
    const logo = document.createElement("img");
    logo.className = "pyzit-tool-detail-logo";
    logo.src = tool.logo;
    logo.alt = `${tool.name} icon`;
    logo.onerror = function() {
      this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='var(--widget-app-icon-fallback-fill)'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm3 0h-2v-8h2v8zm3 0h-2v-4h2v4z'/%3E%3C/svg%3E`;
      this.style.filter = 'none';
    };
    section.appendChild(logo);

    // Title
    const title = document.createElement("div");
    title.className = "pyzit-tool-detail-title";
    title.textContent = tool.name;
    section.appendChild(title);

    // Description
    if (tool.description) {
      const desc = document.createElement("div");
      desc.className = "pyzit-tool-detail-desc";
      desc.textContent = tool.description;
      section.appendChild(desc);
    }

    // Meta info
    const meta = document.createElement("div");
    meta.className = "pyzit-tool-detail-meta";
    meta.innerHTML = [
      tool.team ? `<b>Team:</b> ${tool.team}` : "",
      tool.owner ? `<b>Owner:</b> ${tool.owner}` : "",
      tool.version ? `<b>Version:</b> ${tool.version}` : "",
      tool.last_updated ? `<b>Last Updated:</b> ${tool.last_updated}` : ""
    ].filter(Boolean).join("<br>");
    if (meta.innerHTML) section.appendChild(meta);

    // Links
    const links = document.createElement("div");
    links.className = "pyzit-tool-detail-links";
    if (tool.documentation_url) {
      const docLink = document.createElement("a");
      docLink.href = tool.documentation_url;
      docLink.target = "_blank";
      docLink.textContent = "Documentation";
      links.appendChild(docLink);
    }
    if (tool.support_url) {
      const supportLink = document.createElement("a");
      supportLink.href = tool.support_url;
      supportLink.target = "_blank";
      supportLink.textContent = "Support";
      links.appendChild(supportLink);
    }
    if (links.childNodes.length) section.appendChild(links);

    // Open tool button
    const openBtn = document.createElement("button");
    openBtn.className = "pyzit-tool-detail-open";
    openBtn.textContent = "Open App";
    openBtn.onclick = () => {
      window.open(tool.url, "_blank");
      addRecentTool(tool.name);
    };
    section.appendChild(openBtn);

    // Back button
    const backBtn = document.createElement("button");
    backBtn.className = "pyzit-tool-detail-back";
    backBtn.textContent = "← Back to all tools";
    backBtn.onclick = () => renderGrid(searchBar.value);
    section.appendChild(backBtn);

    scrollableContent.appendChild(section);
  }

  // Create tool item
function createToolItem(tool) {
  const item = document.createElement("div");
  item.className = "pyzit-tool-item";
  item.dataset.name = tool.name;
  item.setAttribute("role", "menuitem");
  item.setAttribute("aria-label", tool.name);
  item.tabIndex = 0;
  const iconWrapper = document.createElement("div");
  iconWrapper.className = "pyzit-tool-item-icon-wrapper";
  const logo = document.createElement("img");
  logo.src = tool.logo;
  logo.alt = `${tool.name} icon`;
  logo.className = "pyzit-tool-item-logo";
  logo.onerror = function() {
    this.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='var(--widget-app-icon-fallback-fill)'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm3 0h-2v-8h2v8zm3 0h-2v-4h2v4z'/%3E%3C/svg%3E`;
    this.style.filter = 'none';
  };
  iconWrapper.appendChild(logo);
  const label = document.createElement("div");
  label.textContent = tool.name;
  label.className = "pyzit-tool-item-label";
  item.appendChild(iconWrapper);
  item.appendChild(label);

  // Prevent dropdown from closing on click
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    addRecentTool(tool.name);
    renderToolDetail(tool);
  });
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addRecentTool(tool.name);
      renderToolDetail(tool);
    }
  });
  return item;
}

  // Watermark
  const watermarkDiv = document.createElement("div");
  watermarkDiv.className = "widget-watermark";
  const watermarkImg = document.createElement("img");
  watermarkImg.src = watermarkConfig.imageUrl;
  watermarkImg.alt = watermarkConfig.altText;
  watermarkDiv.appendChild(watermarkImg);
  toolPanelWrapper.appendChild(watermarkDiv);

  // --- Event Listeners ---
  // Toggle tool panel
  function openPanel() {
    toolPanelWrapper.classList.add("is-visible");
    activatorButton.setAttribute("aria-expanded", "true");
    setTimeout(() => {
      toolPanelWrapper.focus();
      searchBar.focus();
    }, 120);
  }
  function closePanel() {
    toolPanelWrapper.classList.remove("is-visible");
    activatorButton.setAttribute("aria-expanded", "false");
    activatorButton.focus();
  }
  activatorButton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (toolPanelWrapper.classList.contains("is-visible")) {
      closePanel();
    } else {
      renderGrid();
      openPanel();
    }
  });
  closeBtn.addEventListener("click", closePanel);

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target) && toolPanelWrapper.classList.contains("is-visible")) {
      closePanel();
    }
  });

  // Accessibility: Close panel on Escape key
  toolPanelWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePanel();
    }
    // Keyboard navigation for tool items
    const items = Array.from(toolPanelWrapper.querySelectorAll('.pyzit-tool-item'));
    const active = document.activeElement;
    let idx = items.indexOf(active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx === -1) items[0]?.focus();
      else items[Math.min(idx + 1, items.length - 1)]?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx === -1) items[0]?.focus();
      else items[Math.max(idx - 1, 0)]?.focus();
    }
    if (e.key === 'Enter' && active.classList.contains('pyzit-tool-item')) {
      active.click();
    }
  });

  // Theme toggle functionality
  themeToggle.addEventListener('click', () => {
    const isDark = toolPanelWrapper.classList.toggle('theme-dark');
    currentTheme = isDark ? 'dark' : 'light';
    try { localStorage.setItem('pyzit-tool-launcher-theme', currentTheme); } catch {}
  });

  // Check for saved theme preference
  try {
    const savedTheme = localStorage.getItem('pyzit-tool-launcher-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      currentTheme = savedTheme;
      toolPanelWrapper.classList.toggle('theme-dark', currentTheme === 'dark');
    }
  } catch {}

  // Watch for system theme changes
  if (window.matchMedia) {
    const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemThemeQuery.addEventListener('change', (e) => {
      try {
        if (!localStorage.getItem('pyzit-tool-launcher-theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          toolPanelWrapper.classList.toggle('theme-dark', newTheme === 'dark');
          currentTheme = newTheme;
        }
      } catch {}
    });
  }

  // Search functionality
  searchBar.addEventListener("input", () => renderGrid(searchBar.value));

  // --- Initial Render ---
  renderGrid();

  // --- Append to DOM ---
  container.appendChild(activatorButton);
  container.appendChild(toolPanelWrapper);

  // --- Responsive open on mobile ---
  function isMobile() {
    return window.matchMedia("(max-width: 600px)").matches;
  }
  // Swipe down to close on mobile
  let startY = null;
  toolPanelWrapper.addEventListener("touchstart", (e) => {
    if (!isMobile()) return;
    startY = e.touches[0].clientY;
  });
  toolPanelWrapper.addEventListener("touchmove", (e) => {
    if (!isMobile() || startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 60) closePanel();
  });
  toolPanelWrapper.addEventListener("touchend", () => { startY = null; });

})();