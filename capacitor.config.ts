const config = {
  appId: "com.deenflow.app",
  appName: "Sakinah",
  webDir: "out",
  server: {
    url: "https://sakinah-dfxm.onrender.com",
    cleartext: false,
    allowNavigation: ["*"],
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#059669",
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#059669",
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#059669",
    webContentsDebuggingEnabled: false,
  },
};

export default config;
