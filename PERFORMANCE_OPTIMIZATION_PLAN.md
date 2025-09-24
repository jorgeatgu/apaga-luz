# Performance Optimization Plan for Apaga-Luz.com

## Executive Summary

**Current State:**
- Homepage INP: ~244ms (target: <200ms)
- Tomorrow page INP: ~165ms
- Graphs page INP: ~196ms
- Major bottleneck: D3.js processing causing 1,720ms Total Blocking Time

**Primary Goals:**
1. Reduce INP to <200ms on all pages
2. Optimize D3.js performance on graphs page
3. Minimize third-party script impact
4. Improve JavaScript execution efficiency

## 🚨 Critical Issues (Immediate Priority)

### 1. D3.js Performance Catastrophe
**Issue:** Graphs page has 1,720ms TBT with 975ms and 677ms long tasks
**Impact:** Severe INP degradation, poor user experience
**Solution Priority:** URGENT

### 2. Event Handler Performance
**Issue:** 7+ long tasks on homepage (54-120ms each)
**Impact:** Directly causes INP >200ms
**Solution Priority:** HIGH

### 3. Third-party Script Blocking
**Issue:** 113ms blocking time from ads/analytics
**Impact:** Contributes to poor INP
**Solution Priority:** MEDIUM

## 🎯 Optimization Strategies

### Phase 1: Immediate INP Fixes (Week 1)

#### A. Optimize Event Handlers
```javascript
// Current issues in main.js:
- Heavy debounce operations (150ms delay)
- Synchronous DOM operations in event handlers
- Large dataset processing in UI thread

// Solutions:
1. Reduce debounce delays to 50ms max
2. Use requestIdleCallback for non-critical operations
3. Implement proper yielding in chunkedTask
4. Add event delegation optimization
```

#### B. D3.js Performance Emergency Fix
```javascript
// Current issues:
- 80KB D3 bundle loading synchronously
- Heavy SVG rendering blocking main thread
- No data processing optimization

// Solutions:
1. Lazy load D3 only when graphs are visible
2. Use Web Workers for data processing
3. Implement canvas fallback for complex visualizations
4. Add progressive rendering for large datasets
```

#### C. Third-party Script Optimization
```html
<!-- Current issues: -->
- AdSense loading synchronously
- Analytics blocking render

<!-- Solutions: -->
1. Defer AdSense loading until user interaction
2. Use Partytown for main-thread isolation
3. Implement ad lazy loading
```

### Phase 2: Advanced Performance Tuning (Week 2)

#### A. Bundle Optimization
- **main.js (16KB)**: Code splitting for conditional features
- **d3-libs (80KB)**: Tree shaking and dynamic imports
- **CSS (99KB)**: Critical CSS extraction and inlining

#### B. JavaScript Execution Optimization
```javascript
// Optimize heavy operations:
1. Price calculations caching (already implemented ✅)
2. DOM batching improvements
3. Memory management optimization
4. Reduce parsing/compilation time
```

#### C. Network Performance
- Implement proper preloading for critical resources
- Optimize font loading strategy
- Enable better compression for assets

### Phase 3: Advanced Features (Week 3-4)

#### A. Service Worker Implementation
- Cache static assets aggressively
- Implement stale-while-revalidate for data
- Prefetch likely navigation paths

#### B. Advanced D3 Optimizations
- Implement data virtualization for large datasets
- Use CSS transforms instead of SVG transforms
- Add animation frame scheduling for smooth interactions

#### C. Real User Monitoring
- Enhanced Web Vitals tracking
- INP interaction attribution
- Performance budget enforcement

## 📊 Implementation Roadmap

### Sprint 1 (Days 1-3): Critical INP Fixes
- [ ] Fix D3.js blocking issues with Web Workers
- [ ] Optimize event handler debouncing
- [ ] Implement chunked rendering for large tables
- [ ] Add proper yielding to prevent long tasks

### Sprint 2 (Days 4-7): Third-party Optimization
- [ ] Implement Partytown for ad isolation
- [ ] Defer non-critical script loading
- [ ] Optimize Google Fonts loading
- [ ] Add critical CSS inlining

### Sprint 3 (Days 8-14): Bundle & Code Optimization
- [ ] Code splitting implementation
- [ ] D3 library tree shaking
- [ ] Implement service worker caching
- [ ] Memory leak prevention

### Sprint 4 (Days 15-21): Monitoring & Fine-tuning
- [ ] Enhanced Web Vitals monitoring
- [ ] Performance regression testing
- [ ] User experience validation
- [ ] Documentation updates

## 🎯 Expected Performance Improvements

### Realistic Targets:
- **Homepage INP**: 244ms → <150ms (39% improvement)
- **Tomorrow page INP**: 165ms → <120ms (27% improvement)
- **Graphs page INP**: 196ms → <180ms (8% improvement, limited by D3 complexity)
- **Overall Performance Score**: 73-98 → 90+ across all pages

### Optimistic Targets (if all optimizations succeed):
- **Homepage INP**: <100ms
- **Tomorrow page INP**: <100ms
- **Graphs page INP**: <150ms
- **TBT reduction**: >80% on graphs page

## 🛠 Technical Implementation Details

### Critical Event Handler Fix
```javascript
// Before: Heavy synchronous operations
const debouncedOrderByPrice = debounce(() => {
  remove_tables();
  this.orderByPrice();
}, 150);

// After: Optimized with yielding
const debouncedOrderByPrice = debounce(() => {
  scheduler.postTask(() => {
    remove_tables();
    this.orderByPrice();
  }, { priority: 'user-blocking' });
}, 50);
```

### D3.js Web Worker Solution
```javascript
// Move heavy D3 processing to Web Worker
const worker = new Worker('/js/chart-worker.js');
worker.postMessage({ data: priceData, config: chartConfig });
worker.onmessage = ({ data }) => {
  // Apply pre-computed paths/shapes to DOM
  updateChartWithComputedData(data);
};
```

### Third-party Script Isolation
```html
<!-- Use Partytown for ads -->
<script type="text/partytown">
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## 🏆 Success Metrics

### Primary KPIs:
- INP <200ms on all pages (critical)
- TBT <300ms on graphs page
- Performance Score >85 on all pages
- User interaction responsiveness <50ms

### Secondary KPIs:
- Bundle size reduction >20%
- First Input Delay <100ms
- Time to Interactive improvement >30%
- Core Web Vitals "Good" rating across all metrics

## 🚨 Risk Assessment

### High Risk:
- D3.js refactoring could break existing visualizations
- Service worker implementation requires careful cache strategies
- Ad revenue impact from deferred loading

### Medium Risk:
- Bundle splitting might increase complexity
- Web Worker support in older browsers
- Performance regression during development

### Mitigation:
- Feature flags for gradual rollout
- Comprehensive testing on staging
- Performance monitoring alerts
- Fallback strategies for unsupported features

---

**Next Step:** Execute Sprint 1 critical fixes to achieve immediate INP improvements below 200ms threshold.