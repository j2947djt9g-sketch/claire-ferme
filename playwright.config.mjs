import {defineConfig,devices} from "@playwright/test";
export default defineConfig({
 testDir:"./tests/browser",fullyParallel:false,workers:1,retries:0,timeout:30000,globalTimeout:240000,
 reporter:[["list"],["html",{open:"never"}]],
 use:{baseURL:"http://127.0.0.1:8080",trace:"retain-on-failure",screenshot:"only-on-failure",locale:"fr-FR"},
 projects:[{name:"desktop",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:1000}}},{name:"mobile",use:{...devices["iPhone 13"],defaultBrowserType:"chromium"}}],
 webServer:{command:"python3 -m http.server 8080 --bind 127.0.0.1",url:"http://127.0.0.1:8080",reuseExistingServer:!process.env.CI}
});
