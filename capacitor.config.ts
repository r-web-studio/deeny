const config = {
  appId: "com.deenflow.app",
  appName: "DeenFlow",
  webDir: "out",
  server: {
    url: "https://deenflow.onrender.com",
    cleartext: false,
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
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#059669",
  },
};

export default config;
