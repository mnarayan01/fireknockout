/* jshint strict: false, unused: false */
/* globals FirebugLoader */

/*
 * Adapted from:
 *
 *     https://github.com/firebug/extension-examples/blob/f009a68b6a624b1e80082f29797ce9d12bfe6a2f/HelloBootAMD/bootstrap.js
 *
 */

// ********************************************************************************************* //
// Firefox Bootstrap API

function install(data, reason) {}
function uninstall(data, reason) {}

function startup(data, reason) {
  //
  // Two possibilities:
  //
  // 1.  Firebug is already loaded: then we need to manually call `firebugStartup.
  //
  // 2.  Firebug is not yet loaded: FirebugLoader::startup will automatically call `firebugStartup` when it is loaded
  //     by means of:
  //
  //         Components.utils.import("resource://gre/modules/addons/XPIProvider.jsm", {}).XPIProvider.bootstrapScopes
  //
  firebugStartup();
}

function shutdown(data, reason) {
  firebugShutdown();
}

// ********************************************************************************************* //
// Firebug Bootstrap API

function isFirebugLoaded() {
  try {
    // Import Firebug modules into this scope. It fails if Firebug isn't loaded yet.
    Components.utils.import("resource://firebug/loader.js");

    return true;
  } catch (_e) { }

  return false;
}

function firebugStartup() {
  if (isFirebugLoaded()) {
    FirebugLoader.registerBootstrapScope(this);
  }
}

function firebugShutdown() {
  try {
    FirebugLoader.unregisterBootstrapScope(this);
  } catch (e) {
    Components.utils.reportError(e);
  }
}

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * //

function topWindowLoad(win) {}

function topWindowUnload(win) {}

function firebugFrameLoad(Firebug) {
  Firebug.registerExtension("fireKnockout", { id: "FireKnockout@mnarayan01.github.com" });
}

function firebugFrameUnload(Firebug) {
  if (Firebug.isInitialized) {
    Firebug.unregisterExtension("fireKnockout");
  }
}
