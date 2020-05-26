import AsyncStorage from "@react-native-community/async-storage";

export async function loadNotificationSettings() {
    const settings = await AsyncStorage.getItem('notificationSettings');
    if (settings != null) {
        return JSON.parse(settings);
    }
    return null;
}

export async function saveNotificationSettings(settingsObject) {
    await AsyncStorage.setItem("notificationSettings", JSON.stringify(settingsObject));
}
