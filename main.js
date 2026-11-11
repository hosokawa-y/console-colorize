function getCurrentProjectId() {
  var queryString = window.location.search.substring(1);
  var queries = queryString.split('&');

  var projectId = null;
  queries.forEach(function(query) {
    var keyAndValue = query.split('=');
    if (keyAndValue[0] === 'project') {
      projectId = keyAndValue[1];
    }
  });

  return projectId;
}

// Selectors for the console header, newest UI first. GCP changes the console
// DOM periodically, so prepend new selectors here instead of replacing old
// ones. Order matters: legacy selectors like .cfc-platform-bar-container still
// match a non-painting wrapper in the current UI, so they must come last.
var HEADER_SELECTORS = [
  // The bar element itself doesn't paint the background; its inner div does.
  'one-cloud-bar cfc-platform-bar > div',
  'cfc-platform-bar > div',
  '.cfc-platform-bar-container',
  '.cfc-platform-bar-white.gm2-platform-bar',
  '.cfc-platform-bar-blue',
  '[md-theme=platform-bar]'
];

// The header lives inside custom elements, which may use shadow DOM,
// so document.querySelector alone can't reach it.
function collectRoots() {
  var roots = [document];
  for (var i = 0; i < roots.length; i++) {
    var elements = roots[i].querySelectorAll('*');
    for (var j = 0; j < elements.length; j++) {
      if (elements[j].shadowRoot) {
        roots.push(elements[j].shadowRoot);
      }
    }
  }
  return roots;
}

function getCurrentHeader() {
  var roots = collectRoots();
  for (var i = 0; i < HEADER_SELECTORS.length; i++) {
    for (var j = 0; j < roots.length; j++) {
      var header = roots[j].querySelector(HEADER_SELECTORS[i]);
      if (header) {
        console.log('console-colorize: header found by', HEADER_SELECTORS[i], header);
        return header;
      }
    }
  }
  return null;
}

// The console renders asynchronously, so the header may not exist yet when
// this script runs. Poll until it shows up.
var POLL_INTERVAL_MS = 300;
var POLL_MAX_ATTEMPTS = 50;
var pollTimerId = null;

function withHeader(callback) {
  if (pollTimerId) {
    clearInterval(pollTimerId);
    pollTimerId = null;
  }

  var header = getCurrentHeader();
  if (header) {
    callback(header);
    return;
  }

  var attempts = 0;
  pollTimerId = setInterval(function() {
    attempts++;
    var header = getCurrentHeader();
    if (header) {
      clearInterval(pollTimerId);
      pollTimerId = null;
      callback(header);
      return;
    }
    if (attempts >= POLL_MAX_ATTEMPTS) {
      clearInterval(pollTimerId);
      pollTimerId = null;
      console.error("can't get valid header");
    }
  }, POLL_INTERVAL_MS);
}

function changeHeaderColor() {
  var defaultSetting = {
    conditions: []
  };
  chrome.storage.sync.get(defaultSetting, function(setting) {
    var projectId = getCurrentProjectId();
    if (!projectId) {
      console.error("can't get projectId");
      return;
    }

    withHeader(function(header) {
      var conditions = setting.conditions;
      for (var i = 0; i < conditions.length; i++) {
        var condition = conditions[i];
        if (projectId.match(condition.pattern)) {
          var colorRgb = 'rgb(' + condition.color.r + ', '
                                + condition.color.g + ', '
                                + condition.color.b + ')';
          // The console's own styles may be !important, so match that.
          header.style.setProperty('background-color', colorRgb, 'important');
          console.log('console-colorize: applied', colorRgb,
                      'to projectId', projectId,
                      'by pattern', condition.pattern);
          return;
        }
      }

      // No patterns matched, so back to original color
      console.log('console-colorize: no pattern matched projectId', projectId,
                  'patterns:', conditions.map(function(c) { return c.pattern; }));
      header.style.removeProperty('background-color');
    });
  });
}

(function() {
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    changeHeaderColor();
  });
  changeHeaderColor();
}());
