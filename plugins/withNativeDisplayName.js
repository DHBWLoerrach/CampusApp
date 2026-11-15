// Sets the user-visible app name on iOS and Android independently of `expo.name`.
//
// `expo.name` must stay ASCII-only: eas-cli bundles an older @expo/config-plugins
// that derives the iOS target name differently from Expo SDK 58 when the name
// contains characters like "Ö" ("CampusL" vs. "CampusLO"), which breaks iOS builds.
// See https://github.com/expo/eas-cli/issues/4715
//
// TODO: Remove this workaround once https://github.com/expo/eas-cli/pull/4802 ships
// in an eas-cli release: set `expo.name` back to "Campus LÖ" in app.json, drop this
// plugin entry there, and delete this file.
const {
  AndroidConfig,
  withInfoPlist,
  withStringsXml,
} = require('expo/config-plugins');

function withNativeDisplayName(config, { displayName }) {
  if (!displayName) {
    throw new Error('withNativeDisplayName: "displayName" is required');
  }

  config = withInfoPlist(config, (config) => {
    config.modResults.CFBundleDisplayName = displayName;
    config.modResults.CFBundleName = displayName;
    return config;
  });

  config = withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'app_name' }, _: displayName }],
      config.modResults
    );
    return config;
  });

  return config;
}

module.exports = withNativeDisplayName;
