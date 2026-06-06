// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	modules: ["@nuxt/ui", "@nuxt/eslint"],
	css: ["~/assets/css/main.css"],
	ui: {
		colors: {
			primary: "blue",
			neutral: "slate",
		},
	},
	runtimeConfig: {
		neonDatabaseUrl: "",
		sessionCookieName: "softmun_session",
		signupInviteCodes: "",
		public: {
			signupInviteCodes: "",
		},
	},
});
