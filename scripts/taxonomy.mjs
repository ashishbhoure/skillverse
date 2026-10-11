// Categories (clusters), cross-cluster links, split rules and the new "emerging" tracks.

export const CATEGORIES = [
  // original Web Skills categories
  { id: "html", name: "HTML", color: "#FF7A45", pos: [300, 450], level: "beginner", blurb: "The structure of every page." },
  { id: "css", name: "CSS", color: "#4D8DFF", pos: [720, 640], level: "beginner", blurb: "Style, layout and responsive design." },
  { id: "javascript", name: "JavaScript", color: "#F7D154", pos: [1120, 430], level: "beginner", blurb: "The language of the web." },
  { id: "browser", name: "The Browser", color: "#6EE7B7", pos: [1040, 900], level: "beginner", blurb: "How browsers, HTTP and the internet work." },
  { id: "accessibility", name: "Accessibility", color: "#49CB5C", pos: [520, 1260], level: "intermediate", blurb: "Build for everyone." },
  { id: "web-components", name: "Web Components", color: "#B07CFF", pos: [1440, 1010], level: "intermediate", blurb: "Native, framework-free components." },
  { id: "pwa", name: "Progressive Web Apps", color: "#22D3EE", pos: [2250, 300], level: "intermediate", blurb: "Installable, offline-capable apps." },
  { id: "performance", name: "Web Performance", color: "#FBBF24", pos: [1900, 230], level: "intermediate", blurb: "Load fast, render smooth." },
  { id: "security", name: "Security & Identity", color: "#A78BFA", pos: [2400, 1080], level: "intermediate", blurb: "HTTPS, OWASP, passkeys and supply-chain safety." },
  { id: "build-tools", name: "Build Tools", color: "#F59E0B", pos: [1500, 160], level: "intermediate", blurb: "Package managers, bundlers, linters." },
  { id: "frameworks", name: "Frameworks & Libraries", color: "#7C5CFF", pos: [1720, 680], level: "intermediate", blurb: "React, Vue, Svelte and friends." },
  { id: "testing", name: "Testing", color: "#84CC16", pos: [2020, 1000], level: "intermediate", blurb: "Ship with confidence." },
  { id: "architecture", name: "Architecture", color: "#94A3B8", pos: [1750, 1480], level: "advanced", blurb: "Paradigms, patterns and methodologies." },
  { id: "team", name: "Team Collaboration", color: "#2DD4BF", pos: [1080, 1520], level: "beginner", blurb: "Git, agile and working together." },
  { id: "design", name: "Design & UX", color: "#FF9ED2", pos: [260, 1640], level: "beginner", blurb: "Color, type, spacing and systems." },
  { id: "modern-web", name: "The Modern Web", color: "#38BDF8", pos: [2620, 640], level: "advanced", blurb: "Powerful new platform APIs." },
  { id: "algorithms", name: "Algorithms & Data Structures", color: "#A3E635", pos: [700, 1900], level: "advanced", blurb: "Think in complexity." },
  { id: "databases", name: "Databases", color: "#F43F5E", pos: [1320, 1960], level: "advanced", blurb: "Model, query and keep data safe." },
  { id: "backend", name: "Servers & Backend", color: "#FB7185", pos: [1980, 1900], level: "advanced", blurb: "APIs, Linux, Docker, SSH." },
  // new tracks (Skillverse 2.0)
  { id: "modern-css", name: "Modern CSS", color: "#93C5FD", pos: [140, 900], level: "intermediate", blurb: "Container queries, :has(), view transitions.", emerging: true },
  { id: "ai", name: "AI & LLM Engineering", color: "#FF5CF4", pos: [3050, 330], level: "intermediate", blurb: "Build with language models and agents.", emerging: true },
  { id: "webgpu", name: "WebGPU & 3D", color: "#FFB547", pos: [3100, 1020], level: "advanced", blurb: "GPU graphics, shaders and XR.", emerging: true },
  { id: "edge", name: "Edge & Cloud", color: "#7DD3FC", pos: [2680, 1560], level: "advanced", blurb: "Serverless, containers, observability.", emerging: true },
  { id: "rust", name: "Rust & WASM", color: "#E5484D", pos: [2360, 2000], level: "advanced", blurb: "Systems speed in the browser.", emerging: true },
  { id: "local-first", name: "Local-first & Realtime", color: "#FCA5A5", pos: [3000, 1980], level: "advanced", blurb: "Offline sync, CRDTs, signals.", emerging: true },
  { id: "mobile", name: "Mobile & Cross-platform", color: "#86EFAC", pos: [3260, 1500], level: "intermediate", blurb: "React Native, Flutter, hybrid.", emerging: true }
];

export const LINKS = [
  ["html", "css"], ["css", "javascript"], ["css", "modern-css"], ["css", "accessibility"], ["css", "design"],
  ["html", "accessibility"], ["javascript", "browser"], ["javascript", "build-tools"], ["javascript", "frameworks"],
  ["javascript", "pwa"], ["javascript", "web-components"], ["browser", "performance"], ["browser", "security"],
  ["web-components", "frameworks"], ["frameworks", "testing"], ["frameworks", "architecture"], ["javascript", "ai"],
  ["pwa", "performance"], ["performance", "edge"], ["javascript", "backend"], ["backend", "databases"], ["backend", "edge"],
  ["backend", "security"], ["javascript", "modern-web"], ["modern-web", "webgpu"], ["ai", "webgpu"], ["frameworks", "ai"],
  ["rust", "modern-web"], ["rust", "webgpu"], ["local-first", "pwa"], ["local-first", "databases"], ["team", "testing"],
  ["build-tools", "testing"], ["algorithms", "javascript"], ["architecture", "backend"], ["frameworks", "mobile"],
  ["mobile", "pwa"], ["security", "modern-web"], ["design", "frameworks"], ["edge", "rust"], ["accessibility", "design"],
  ["team", "architecture"], ["performance", "frameworks"]
];

// Original "Progressive Webapps" / "Databases & Servers" skills are redistributed into focused clusters.
export const SPLIT = {
  pwa: {
    pwa: ["Storage", "Routing", "Service Workers", "Web App manifest", "Add to homescreen", "Pointer Events", "App shell"],
    security: ["HTTPS", "Browser Sandbox", "OWASP", "Content Security Policy"],
    __default: "performance"
  },
  databases: {
    backend: ["Architectural Models", "Middleware", "Request-Reply Protocol", "REST API", "Express", "GraphQL", "GNU/Linux", "Docker", "SSH"],
    __default: "databases"
  }
};

export const EXPERIMENTAL_ORIGINAL = ["Houdini", "Project Fugu", "Shape Detection", "Web Bluetooth", "Web USB", "Web XR", "Presentation", "Network Information API", "Native File System", "Speech Recognition", "Pointer Lock API", "Constructible Stylesheets"];

export const QUADRANTS = ["AI & Data", "Platform & Graphics", "Languages & Runtimes", "Practices & Delivery"];

// ring: adopt | trial | assess  ·  q: index into QUADRANTS
const E = (category, name, level, ring, q, desc, resources, experimental = false) => ({ category, name, level, ring, q, description: desc, resources, experimental });

export const EMERGING = [
  // AI & LLM
  E("ai", "Prompt Engineering", "beginner", "adopt", 0, "Write clear, structured prompts, use examples and system prompts, and iterate toward reliable outputs.", [
    ["Anthropic - Prompt engineering overview", "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"],
    ["Anthropic - Prompt engineering interactive tutorial", "https://github.com/anthropics/prompt-eng-interactive-tutorial"],
    ["Learn Prompting", "https://learnprompting.org/"]]),
  E("ai", "Calling LLM APIs & Streaming", "beginner", "adopt", 0, "Call model APIs from a backend, stream tokens to the UI and handle errors and rate limits.", [
    ["Anthropic - API getting started", "https://docs.anthropic.com/en/api/getting-started"],
    ["MDN - Using server-sent events", "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events"],
    ["MDN - Streams API", "https://developer.mozilla.org/en-US/docs/Web/API/Streams_API"]]),
  E("ai", "Tool Use & Function Calling", "intermediate", "adopt", 0, "Let models call your functions with structured arguments and use the results.", [
    ["Anthropic - Tool use overview", "https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview"],
    ["JSON Schema - Getting started", "https://json-schema.org/learn/getting-started-step-by-step"]]),
  E("ai", "RAG & Embeddings", "intermediate", "trial", 0, "Ground answers in your own data with embeddings, vector search and retrieval pipelines.", [
    ["Anthropic - Contextual retrieval", "https://www.anthropic.com/news/contextual-retrieval"],
    ["Pinecone - Retrieval augmented generation", "https://www.pinecone.io/learn/retrieval-augmented-generation/"],
    ["pgvector", "https://github.com/pgvector/pgvector"]]),
  E("ai", "Agents & MCP", "advanced", "trial", 0, "Design agent loops, give models tools through the Model Context Protocol and keep humans in control.", [
    ["Anthropic - Building effective agents", "https://www.anthropic.com/engineering/building-effective-agents"],
    ["Model Context Protocol - Introduction", "https://modelcontextprotocol.io/introduction"]]),
  E("ai", "Evals & Guardrails", "advanced", "trial", 0, "Measure quality with test sets and defend against prompt injection and unsafe output.", [
    ["Anthropic - Develop tests", "https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests"],
    ["OWASP - Top 10 for LLM applications", "https://owasp.org/www-project-top-10-for-large-language-model-applications/"]]),
  E("ai", "In-browser ML", "advanced", "assess", 0, "Run models on-device with Transformers.js, ONNX Runtime Web and the emerging WebNN API.", [
    ["Transformers.js docs", "https://huggingface.co/docs/transformers.js/index"],
    ["ONNX Runtime Web", "https://onnxruntime.ai/docs/tutorials/web/"],
    ["W3C - Web Neural Network API", "https://www.w3.org/TR/webnn/"]], true),
  E("ai", "AI UX Patterns", "intermediate", "assess", 3, "Design trustworthy AI interfaces: uncertainty, feedback, undo and human oversight.", [
    ["Google PAIR - People + AI Guidebook", "https://pair.withgoogle.com/guidebook/"],
    ["Microsoft - HAX Toolkit", "https://www.microsoft.com/en-us/haxtoolkit/"]]),
  // WebGPU & 3D
  E("webgpu", "WebGL Basics", "intermediate", "adopt", 1, "Understand the GPU pipeline, shaders and buffers with raw WebGL.", [
    ["WebGL Fundamentals", "https://webglfundamentals.org/"],
    ["MDN - WebGL API", "https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API"]]),
  E("webgpu", "Three.js", "intermediate", "adopt", 1, "Build 3D scenes with the most popular web 3D library, including React Three Fiber.", [
    ["Three.js manual", "https://threejs.org/manual/"],
    ["React Three Fiber - Getting started", "https://r3f.docs.pmnd.rs/getting-started/introduction"]]),
  E("webgpu", "WebGPU Fundamentals", "advanced", "trial", 1, "The modern GPU API for graphics and compute on the web.", [
    ["WebGPU Fundamentals", "https://webgpufundamentals.org/"],
    ["MDN - WebGPU API", "https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API"],
    ["W3C - WebGPU specification", "https://gpuweb.github.io/gpuweb/"]]),
  E("webgpu", "WGSL & Compute Shaders", "advanced", "assess", 2, "Write WGSL shaders and run general-purpose compute on the GPU.", [
    ["WebGPU Fundamentals - Compute shaders", "https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders.html"],
    ["W3C - WGSL specification", "https://www.w3.org/TR/WGSL/"]], true),
  E("webgpu", "Shaders & Creative Coding", "intermediate", "trial", 1, "Learn fragment shaders and generative art.", [
    ["The Book of Shaders", "https://thebookofshaders.com/"],
    ["Shadertoy", "https://www.shadertoy.com/"]]),
  E("webgpu", "glTF & 3D Asset Pipelines", "intermediate", "trial", 1, "Ship optimized 3D assets: glTF, compression and texture workflows.", [
    ["Khronos - glTF", "https://www.khronos.org/gltf/"],
    ["glTF to React Three Fiber", "https://gltf.pmnd.rs/"]]),
  E("webgpu", "WebXR Experiences", "advanced", "assess", 1, "Build immersive AR and VR on the web.", [
    ["MDN - WebXR Device API", "https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API"],
    ["Immersive Web", "https://immersiveweb.dev/"]], true),
  // Edge & Cloud
  E("edge", "Serverless Functions", "intermediate", "adopt", 3, "Deploy backend logic without managing servers.", [
    ["Vercel - Functions", "https://vercel.com/docs/functions"],
    ["AWS Lambda - Developer guide", "https://docs.aws.amazon.com/lambda/latest/dg/welcome.html"]]),
  E("edge", "Edge Runtimes", "advanced", "trial", 2, "Run code close to users on Workers and Deno with web-standard APIs.", [
    ["Cloudflare Workers docs", "https://developers.cloudflare.com/workers/"],
    ["Deno docs", "https://docs.deno.com/"]]),
  E("edge", "Kubernetes Basics", "advanced", "adopt", 3, "Orchestrate containers: pods, deployments and services.", [
    ["Kubernetes basics tutorial", "https://kubernetes.io/docs/tutorials/kubernetes-basics/"],
    ["Docker - Get started", "https://docs.docker.com/get-started/"]]),
  E("edge", "CI/CD with GitHub Actions", "intermediate", "adopt", 3, "Automate tests, builds and deploys on every push.", [
    ["GitHub Actions docs", "https://docs.github.com/en/actions"]]),
  E("edge", "Infrastructure as Code", "advanced", "trial", 3, "Describe infrastructure in code with Terraform or Pulumi.", [
    ["Terraform tutorials", "https://developer.hashicorp.com/terraform/tutorials"],
    ["Pulumi docs", "https://www.pulumi.com/docs/"]]),
  E("edge", "Observability & OpenTelemetry", "advanced", "trial", 3, "Traces, metrics and logs that explain production behavior.", [
    ["OpenTelemetry docs", "https://opentelemetry.io/docs/"],
    ["Google SRE book - Monitoring", "https://sre.google/sre-book/monitoring-distributed-systems/"]]),
  E("edge", "CDN & Caching Strategy", "intermediate", "adopt", 3, "Cache at every layer: headers, CDNs, stale-while-revalidate.", [
    ["web.dev - Prevent unnecessary network requests with the HTTP cache", "https://web.dev/articles/http-cache"],
    ["MDN - HTTP caching", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching"]]),
  E("edge", "Sustainable Web", "beginner", "assess", 3, "Measure and reduce the carbon footprint of websites.", [
    ["Sustainable Web Design", "https://sustainablewebdesign.org/"],
    ["The Green Web Foundation", "https://www.thegreenwebfoundation.org/"]]),
  // Rust & WASM
  E("rust", "Rust Basics", "intermediate", "trial", 2, "Ownership, borrowing and the type system behind safe systems code.", [
    ["The Rust Programming Language", "https://doc.rust-lang.org/book/"],
    ["Rustlings exercises", "https://github.com/rust-lang/rustlings"]]),
  E("rust", "WebAssembly Fundamentals", "intermediate", "trial", 2, "Understand the WASM binary format, memory and the JS API.", [
    ["MDN - WebAssembly", "https://developer.mozilla.org/en-US/docs/WebAssembly"],
    ["WebAssembly - Developer's guide", "https://webassembly.org/getting-started/developers-guide/"]]),
  E("rust", "Rust to WASM with wasm-bindgen", "advanced", "assess", 2, "Compile Rust to WASM and call it from JavaScript.", [
    ["Rust and WebAssembly book", "https://rustwasm.github.io/docs/book/"],
    ["wasm-bindgen guide", "https://rustwasm.github.io/wasm-bindgen/"]]),
  E("rust", "Component Model & WASI", "advanced", "assess", 2, "Portable WASM modules beyond the browser.", [
    ["WASM Component Model", "https://component-model.bytecodealliance.org/"],
    ["WASI", "https://wasi.dev/"]], true),
  E("rust", "Advanced TypeScript", "advanced", "adopt", 2, "Generics, conditional and mapped types for safer code.", [
    ["TypeScript Handbook", "https://www.typescriptlang.org/docs/handbook/intro.html"],
    ["Type Challenges", "https://github.com/type-challenges/type-challenges"]]),
  // Modern CSS
  E("modern-css", "Container Queries", "intermediate", "adopt", 1, "Style components based on their container, not the viewport.", [
    ["MDN - Container queries", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries"],
    ["web.dev - Container queries are stable", "https://web.dev/blog/cq-stable"]]),
  E("modern-css", "CSS Nesting & @layer", "intermediate", "adopt", 1, "Native nesting and cascade layers for scalable CSS.", [
    ["MDN - CSS nesting", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting"],
    ["MDN - @layer", "https://developer.mozilla.org/en-US/docs/Web/CSS/@layer"]]),
  E("modern-css", ":has() & Modern Selectors", "intermediate", "adopt", 1, "The parent selector and friends.", [
    ["MDN - :has()", "https://developer.mozilla.org/en-US/docs/Web/CSS/:has"]]),
  E("modern-css", "Scroll-driven Animations", "advanced", "trial", 1, "Animate on scroll without JavaScript.", [
    ["MDN - Scroll-driven animations", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations"],
    ["Scroll-driven animations demos", "https://scroll-driven-animations.style/"]], true),
  E("modern-css", "View Transitions", "advanced", "trial", 1, "Animated transitions between page states and navigations.", [
    ["MDN - View Transition API", "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API"],
    ["Chrome - View transitions", "https://developer.chrome.com/docs/web-platform/view-transitions"]]),
  E("modern-css", "Anchor Positioning & Popover", "advanced", "assess", 1, "Tooltips and menus positioned relative to anchors, natively.", [
    ["MDN - CSS anchor positioning", "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning"],
    ["MDN - Popover API", "https://developer.mozilla.org/en-US/docs/Web/API/Popover_API"]], true),
  E("modern-css", "oklch & color-mix", "intermediate", "trial", 1, "Perceptually uniform colors and mixing in CSS.", [
    ["MDN - oklch()", "https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch"],
    ["OKLCH color picker", "https://oklch.com/"]]),
  E("modern-css", "@scope & Cascade Control", "advanced", "assess", 1, "Scope styles to a subtree without naming conventions.", [
    ["MDN - @scope", "https://developer.mozilla.org/en-US/docs/Web/CSS/@scope"]], true),
  // Security & identity (new)
  E("security", "Passkeys & WebAuthn", "intermediate", "trial", 3, "Passwordless sign-in with public-key credentials.", [
    ["passkeys.dev", "https://passkeys.dev/"],
    ["MDN - Web Authentication API", "https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API"]]),
  E("security", "OAuth 2.1 & OpenID Connect", "intermediate", "adopt", 3, "Delegated authorization and identity done right.", [
    ["OAuth 2.0 / 2.1", "https://oauth.net/2/"],
    ["OpenID Connect explained", "https://openid.net/developers/how-connect-works/"]]),
  E("security", "Supply-chain Security", "advanced", "trial", 3, "Protect your dependencies with provenance, lockfiles and SLSA.", [
    ["SLSA framework", "https://slsa.dev/"],
    ["npm - Generating provenance statements", "https://docs.npmjs.com/generating-provenance-statements"]]),
  E("security", "Security Headers", "intermediate", "adopt", 3, "CSP, HSTS, COOP/COEP and other defensive headers.", [
    ["OWASP Secure Headers Project", "https://owasp.org/www-project-secure-headers/"],
    ["MDN - Web security", "https://developer.mozilla.org/en-US/docs/Web/Security"]]),
  E("security", "Privacy & Consent", "intermediate", "assess", 3, "Respect users: data minimization, consent and privacy APIs.", [
    ["web.dev - Learn Privacy", "https://web.dev/learn/privacy"]]),
  E("security", "Threat Modeling", "advanced", "assess", 3, "Find design-level flaws before attackers do.", [
    ["OWASP - Threat modeling", "https://owasp.org/www-community/Threat_Modeling"],
    ["Threat Modeling Manifesto", "https://threatmodelingmanifesto.org/"]]),
  // Local-first & realtime
  E("local-first", "Offline Storage: IndexedDB & OPFS", "intermediate", "adopt", 2, "Store lots of structured data and files in the browser.", [
    ["MDN - IndexedDB API", "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API"],
    ["MDN - Origin private file system", "https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system"]]),
  E("local-first", "CRDTs & Sync", "advanced", "assess", 2, "Merge concurrent edits without conflicts.", [
    ["crdt.tech", "https://crdt.tech/"],
    ["Yjs docs", "https://docs.yjs.dev/"]]),
  E("local-first", "Local-first Principles", "advanced", "assess", 3, "Software that works offline and keeps you in control of your data.", [
    ["Ink & Switch - Local-first software", "https://www.inkandswitch.com/essay/local-first/"],
    ["Local-First Web", "https://localfirstweb.dev/"]]),
  E("local-first", "SQLite in the Browser", "advanced", "assess", 2, "A full SQL database via WASM and OPFS.", [
    ["SQLite WASM", "https://sqlite.org/wasm/doc/trunk/index.md"]], true),
  E("local-first", "WebSockets & WebTransport", "intermediate", "trial", 2, "Low-latency bidirectional communication.", [
    ["MDN - WebTransport API", "https://developer.mozilla.org/en-US/docs/Web/API/WebTransport_API"],
    ["MDN - WebSockets API", "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API"]]),
  E("local-first", "Signals & Fine-grained Reactivity", "advanced", "assess", 2, "The reactive primitive converging across frameworks.", [
    ["TC39 - Signals proposal", "https://github.com/tc39/proposal-signals"],
    ["Solid - Signals", "https://docs.solidjs.com/concepts/signals"]], true),
  E("local-first", "Islands & Resumability", "advanced", "assess", 2, "Ship less JavaScript by hydrating only what is interactive.", [
    ["Astro - Islands", "https://docs.astro.build/en/concepts/islands/"],
    ["Qwik - Resumable", "https://qwik.dev/docs/concepts/resumable/"]]),
  // Mobile & cross-platform
  E("mobile", "React Native", "intermediate", "trial", 2, "Native iOS and Android apps with React.", [
    ["React Native - Getting started", "https://reactnative.dev/docs/getting-started"],
    ["Expo docs", "https://docs.expo.dev/"]]),
  E("mobile", "Flutter & Dart", "intermediate", "trial", 2, "Compile-to-native UI from one codebase.", [
    ["Flutter - Get started", "https://docs.flutter.dev/get-started"],
    ["Dart overview", "https://dart.dev/overview"]]),
  E("mobile", "Capacitor & Tauri", "intermediate", "assess", 2, "Wrap web apps for mobile and desktop.", [
    ["Capacitor docs", "https://capacitorjs.com/docs"],
    ["Tauri - Start", "https://tauri.app/start/"]]),
  E("mobile", "Platform Design Languages", "beginner", "assess", 3, "Material 3 and Apple HIG: design for each platform.", [
    ["Material Design 3", "https://m3.material.io/"],
    ["Apple Human Interface Guidelines", "https://developer.apple.com/design/human-interface-guidelines"]]),
  // extras attached to existing categories
  E("accessibility", "WCAG 2.2 & European Accessibility Act", "intermediate", "adopt", 3, "Know the standards and laws that now make accessibility mandatory.", [
    ["W3C - WCAG 2.2", "https://www.w3.org/TR/WCAG22/"],
    ["W3C WAI - EU policies", "https://www.w3.org/WAI/policies/european-union/"]]),
  E("architecture", "Micro-frontends", "advanced", "assess", 3, "Split a large UI into independently deployable parts.", [
    ["Micro Frontends", "https://micro-frontends.org/"],
    ["Martin Fowler - Micro Frontends", "https://martinfowler.com/articles/micro-frontends.html"]]),
  E("testing", "End-to-end Testing with Playwright", "intermediate", "adopt", 3, "Reliable cross-browser E2E tests.", [
    ["Playwright docs", "https://playwright.dev/docs/intro"],
    ["Vitest guide", "https://vitest.dev/guide/"]]),
  E("build-tools", "Vite & Next-gen Bundlers", "intermediate", "adopt", 3, "Fast dev servers and Rust-powered bundling.", [
    ["Vite guide", "https://vite.dev/guide/"],
    ["Rolldown", "https://rolldown.rs/"]]),
  E("frameworks", "Server Components & Streaming SSR", "advanced", "trial", 2, "Move rendering to the server and stream UI.", [
    ["React - Server Components", "https://react.dev/reference/rsc/server-components"],
    ["web.dev - Rendering on the web", "https://web.dev/articles/rendering-on-the-web"]])
];

// Learning paths. Entries are "category:Skill name" (original) or "category/slug" (emerging).
export const PATHS = [
  { id: "frontend", name: "Frontend Developer", color: "#7C5CFF", blurb: "From semantic HTML to production-grade UI.", skills: [
    "html:Syntax", "html:Forms", "html:SEO", "html:Best Practices", "css:Syntax", "css:Selectors", "css:Box Model", "css:Layout", "css:Responsive Design", "css:CSS Variables",
    "javascript:Syntax", "javascript:DOM", "javascript:Events", "javascript:Objects", "javascript:Promises", "javascript:Modules",
    "browser:HTTP", "browser:Debugging", "accessibility:The why", "accessibility:Keyboard Accessibility", "accessibility:Screen Readers",
    "build-tools:Package Managers", "build-tools:Module Bundlers", "frameworks:React", "modern-css/container-queries", "testing:Test Runners"] },
  { id: "backend", name: "Backend Engineer", color: "#FB7185", blurb: "Servers, data and APIs that scale.", skills: [
    "javascript:Syntax", "javascript:Promises", "browser:HTTP", "browser:The Internet", "build-tools:Node.js", "databases:Relational Databases", "databases:Data Modelling", "databases:Indexing",
    "databases:Transactions", "databases:Normalization", "backend:REST API", "backend:Express", "backend:GraphQL", "backend:Middleware", "security:OWASP", "security:HTTPS",
    "backend:GNU/Linux", "backend:Docker", "backend:SSH", "edge/ci-cd-with-github-actions", "edge/observability-and-opentelemetry"] },
  { id: "ai-engineer", name: "AI Engineer", color: "#FF5CF4", blurb: "Ship products powered by language models.", skills: [
    "javascript:Syntax", "javascript:Promises", "build-tools:Node.js", "ai/prompt-engineering", "ai/calling-llm-apis-and-streaming", "ai/tool-use-and-function-calling", "ai/rag-and-embeddings",
    "databases:Non-relational Databases", "ai/agents-and-mcp", "ai/evals-and-guardrails", "security:OWASP", "ai/ai-ux-patterns", "ai/in-browser-ml"] },
  { id: "graphics", name: "Creative / 3D Developer", color: "#FFB547", blurb: "Canvas, shaders, WebGPU and immersive web.", skills: [
    "javascript:Canvas", "javascript:Web Animations", "css:Transforms", "webgpu/webgl-basics", "webgpu/three-js", "webgpu/shaders-and-creative-coding", "webgpu/gltf-and-3d-asset-pipelines",
    "modern-web:Web Assembly", "webgpu/webgpu-fundamentals", "webgpu/wgsl-and-compute-shaders", "modern-web:Web XR", "webgpu/webxr-experiences"] },
  { id: "performance", name: "Performance & PWA Specialist", color: "#22D3EE", blurb: "Fast, resilient, installable apps.", skills: [
    "browser:HTTP", "performance:Critical Rendering Path", "performance:Performance metrics", "performance:Lazy Loading", "performance:Caching", "performance:Compression", "performance:Codesplitting",
    "pwa:Service Workers", "pwa:Web App manifest", "pwa:Storage", "pwa:App shell", "performance:Lighthouse", "performance:Chrome DevTools", "performance:Performance budgets", "local-first/offline-storage-indexeddb-and-opfs"] },
  { id: "fullstack-edge", name: "Full-stack on the Edge", color: "#7DD3FC", blurb: "Modern full-stack with serverless and the edge.", skills: [
    "javascript:Modules", "build-tools:Module Bundlers", "frameworks:React", "frameworks/server-components-and-streaming-ssr", "backend:REST API", "backend:Docker", "edge/serverless-functions",
    "edge/edge-runtimes", "edge/cdn-and-caching-strategy", "security/passkeys-and-webauthn", "security/oauth-2-1-and-openid-connect", "edge/infrastructure-as-code", "edge/kubernetes-basics"] },
  { id: "a11y", name: "Accessibility Specialist", color: "#49CB5C", blurb: "Inclusive design, engineering and compliance.", skills: [
    "accessibility:The why", "accessibility:Screen Readers", "accessibility:Accessibility tree", "accessibility:Accessible forms", "accessibility:UI States", "accessibility:Keyboard Accessibility",
    "accessibility:Accessible Colors", "design:Accessibility", "accessibility:Laws & Policies", "accessibility/wcag-2-2-and-european-accessibility-act", "testing:Testing Methodologies"] }
];

export const RADAR_QUADRANT_COLORS = ["#FF5CF4", "#FFB547", "#7DD3FC", "#49CB5C"];
