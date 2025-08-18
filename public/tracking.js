// LeadIntel CRM Visitor Tracking Script - Production Ready
;(() => {
  var LeadIntelTracker = {
    config: {
      clientId: null,
      apiKey: null,
      endpoint: null, // Will be set during init
      debug: false,
    },

    init: function (clientId, apiKey, options = {}) {
      this.config.clientId = clientId
      this.config.apiKey = apiKey
      this.config.endpoint = (options.endpoint || window.location.origin) + "/api/track"
      this.config.debug = options.debug || false

      if (!clientId || !apiKey) {
        console.warn("LeadIntel: Missing clientId or apiKey")
        return
      }

      try {
        this.setupTracking()
        this.log("LeadIntel tracker initialized successfully for endpoint: " + this.config.endpoint)
      } catch (error) {
        console.error("LeadIntel initialization error:", error)
      }
    },

    log: function (message) {
      if (this.config.debug) {
        console.log("[LeadIntel]", message)
      }
    },

    setupTracking: function () {
      // Track initial page view
      this.trackPageView(window.location.pathname)

      // Track SPA navigation
      this.setupSPATracking()

      // Track session duration
      this.trackSessionDuration()

      this.trackEngagement()
    },

    getSessionId: () => {
      var sessionId = sessionStorage.getItem("leadintel_session")
      if (!sessionId) {
        sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2)
        sessionStorage.setItem("leadintel_session", sessionId)
      }
      return sessionId
    },

    trackPageView: function (page) {
      var data = {
        page: page,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.getSessionId(),
        clientId: this.config.clientId,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screen: {
          width: screen.width,
          height: screen.height,
        },
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }

      this.sendTrackingData(data)
      this.log("Page view tracked: " + page)
    },

    sendTrackingData: function (data) {
      var retryCount = 0
      var maxRetries = 3

      var sendWithRetry = () => {
        fetch(this.config.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.config.apiKey,
          },
          body: JSON.stringify(data),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP " + response.status)
            }
            return response.json()
          })
          .then((result) => {
            this.log("Tracking data sent successfully")
            if (result.companyIdentified) {
              this.log("Company identified: " + result.companyName)
            }
          })
          .catch((error) => {
            console.error("LeadIntel tracking error:", error)

            // Retry on network errors
            if (retryCount < maxRetries && (error.name === "TypeError" || error.message.includes("fetch"))) {
              retryCount++
              setTimeout(sendWithRetry, 1000 * retryCount) // Exponential backoff
              this.log("Retrying tracking request (" + retryCount + "/" + maxRetries + ")")
            }
          })
      }

      sendWithRetry()
    },

    setupSPATracking: function () {
      var currentPath = window.location.pathname

      // Override pushState and replaceState
      var originalPushState = history.pushState
      var originalReplaceState = history.replaceState

      history.pushState = () => {
        originalPushState.apply(history, arguments)
        if (window.location.pathname !== currentPath) {
          currentPath = window.location.pathname
          this.trackPageView(currentPath)
        }
      }

      history.replaceState = () => {
        originalReplaceState.apply(history, arguments)
        if (window.location.pathname !== currentPath) {
          currentPath = window.location.pathname
          this.trackPageView(currentPath)
        }
      }

      // Track popstate events
      window.addEventListener("popstate", () => {
        if (window.location.pathname !== currentPath) {
          currentPath = window.location.pathname
          this.trackPageView(currentPath)
        }
      })
    },

    trackSessionDuration: function () {
      var sessionId = this.getSessionId()
      var startTime = Date.now()

      var updateDuration = () => {
        var duration = Date.now() - startTime
        sessionStorage.setItem(sessionId + "_duration", duration.toString())
      }

      // Update duration periodically
      setInterval(updateDuration, 5000)

      // Track when user leaves
      window.addEventListener("beforeunload", updateDuration)
      window.addEventListener("visibilitychange", updateDuration)
    },

    trackEngagement: function () {
      var engagementData = {
        scrollDepth: 0,
        timeOnPage: 0,
        clicks: 0,
        formInteractions: 0,
      }

      // Track scroll depth
      var maxScroll = 0
      window.addEventListener("scroll", () => {
        var scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent
          engagementData.scrollDepth = maxScroll
        }
      })

      // Track clicks
      document.addEventListener("click", () => {
        engagementData.clicks++
      })

      // Track form interactions
      document.addEventListener(
        "focus",
        (e) => {
          if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") {
            engagementData.formInteractions++
          }
        },
        true,
      )

      // Send engagement data periodically
      setInterval(() => {
        if (engagementData.scrollDepth > 0 || engagementData.clicks > 0) {
          this.sendEngagementData(engagementData)
        }
      }, 30000) // Every 30 seconds

      // Send on page unload
      window.addEventListener("beforeunload", () => {
        this.sendEngagementData(engagementData)
      })
    },

    sendEngagementData: function (data) {
      // Use sendBeacon for reliable delivery on page unload
      if (navigator.sendBeacon) {
        var payload = JSON.stringify({
          type: "engagement",
          sessionId: this.getSessionId(),
          clientId: this.config.clientId,
          data: data,
          timestamp: new Date().toISOString(),
        })

        navigator.sendBeacon(this.config.endpoint + "/engagement", payload)
      }
    },
  }

  // Make tracker available globally
  window.LeadIntelTracker = LeadIntelTracker
})()
