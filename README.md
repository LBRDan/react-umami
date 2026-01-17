# @lbrdan/react-umami - WIP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/LBRDan/react-umami/main)
![GitHub Release Date](https://img.shields.io/github/release-date/LBRDan/react-umami)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

[Umami tracker](https://umami.is/) client for React, context and hooks only

- **zero dependencies**
- **Double module export** (CJS, ESM)
- Baked in Typescript typings
- Side effects free (`sideEffect: false`)
- Respect the user choice about privacy by default ("Ask to not track" option)

Works nicely with NextJS (12, 13 (Client side only))

### WIP

This lib is still WIP, no package is out on NPM yet. There is some work left to do:

- [ ] README - API Paragraph
- [ ] Tests and coverage
- [ ] Release script
- [ ] CI integration for tests and coverage
- [ ] CI integration for releases
- [ ] Contribution guide (Nice to have)

## Table of Contents

- [Background](#background)
  - [Other packages](#other-packages)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Background

I was trying to gather some analytics for my NextJS (v12 - `pages` folder or v13 - client components with some quirks) personal site, especially about the interactions with my resumee. I started thinking about Google Analitycs but I also wanted to keep this data for me, and granting the minimum privacy impact to the visitors.

I found [Umami](https://umami.is/) and it seemed to be a good fit for my needs. It's a self-hosted analytics tool, with a very simple and clean interface. It's also open source, free to use with self hosting capability. I was sold.

Then I opted to self host Umami in my home server (or better said, a Raspberry Pi 3), but I realized that umami provides it's own library.
I didn't want to let some adblocker or something preventing me from using those service, and I needed something that better integrates with NextJS.

### Other packages

#### `react-umami`

There is a `react-umami` ([NPM](https://www.npmjs.com/package/react-umami)/[Repo](https://github.com/LucasSovre/react_umami)) package by the user [LucasSovre](https://github.com/LucasSovre) published that is quite similar to this one. It offers the same flexibility of not having any external js file loaded at runtime, but it's left to the user to bind with React (via effects)

#### `@parcellab/react-use-umami`

This package is available via [NPM](https://www.npmjs.com/package/@parcellab/react-use-umami). That one offers the very same hooks as this package does, but it still requires the external official umami js sdk to be loaded. The choice is acceptable when it comes to the abstraction for the SDK implementation, but it does not solve breaking changes issues in the SDK API changes.

`@lbrdan/react-umami` tries to combine and takes the best of both of these approaches, by using hooks and context to gather flexibility for React developers without the needs of an externally included SDK

## Install

~~`@lbrdan/react-umami` is available npm public repository. The releases are synced with the ones on GitHub.~~

~~To install it just use your favorite package manager:~~ (WIP - Coming soon)

```sh
# NPM
npm i @lbrdan/react-umami

# Yarn / Yarn Berry
yarn add @lbrdan/react-umami

# PNPM
pnpm add @lbrdan/react-umami
```

## Usage

First, you'll need to setup `UmamiProvider` to let the hooks use a premade context (provided via `React.Context`)

You can use this in NextJS [`pages/_app.tsx`]:

```tsx
import { AppProps } from "next/app";
import Head from "next/head";
import { UmamiProvider } from "@lbrdan/react-umami";

function App({ Component, pageProps, router, ...props }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="LBRDan" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <UmamiProvider
        hostUrl={process.env.NEXT_PUBLIC_UMAMI_HOSTNAME} // Loaded via ENV
        websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} // Loaded via ENV
        getCurrentUrl={() => router.pathname}
        domains={["my-domain.com", "localhost"]}
      >
        <Component {...pageProps} />
      </UmamiProvider>
    </>
  );
}
```

Or with plain React:

```tsx
import React, { FC } from "react";
import { UmamiProvider, PageTracker } from "@lbrdan/react-umami";

const UMAMI_CONFIG = {
  apiUrl: "https://my-umami-host.example.com/",
  websiteId: "umami-id-for-mywebsite",
  allowedDomains: ["my-website.com"], // or [window.location.hostname]
};

const App: FC<{}> = (props) => {
  return (
    <UmamiProvider
      hostUrl={UMAMI_CONFIG.apiUrl}
      websiteId={UMAMI_CONFIG.websiteId}
      getCurrentUrl={() => window.location.pathname}
      domains={UMAMI_CONFIG.allowedDomains}
    >
      <Component {...pageProps} />
    </UmamiProvider>
  );
};

export default App;
```

**Tip**: You could use Next `Router` (or your router of choice eg. `react-router`) to ensure a consistent app wide pageview tracking together with the provided component `PageTracker`

With Next (v12)...

```tsx
import { AppProps } from "next/app";
import Head from "next/head";
import { UmamiProvider, PageTracker } from "@lbrdan/react-umami";

function App({ Component, pageProps, router, ...props }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="LBRDan" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <UmamiProvider
        hostUrl={process.env.NEXT_PUBLIC_UMAMI_HOSTNAME} // Loaded via ENV
        websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID} // Loaded via ENV
        getCurrentUrl={() => router.pathname}
        domains={["my-domain.com", "localhost"]}
      >
        <PageTracker pageUrl={router.asPath} />
        <Component {...pageProps} />
      </UmamiProvider>
    </>
  );
}
```

... or plain React

```tsx
import React, { FC } from "react";
import { UmamiProvider, PageTracker } from "@lbrdan/react-umami";
import { BrowserRouter, useLocation } from "react-router-dom";

const UMAMI_CONFIG = {
  apiUrl: "https://my-umami-host.example.com/",
  websiteId: "umami-id-for-mywebsite",
  allowedDomains: ["my-website.com"], // or [window.location.hostname]
};

const App: FC<{}> = (props) => {
  return (
    <BrowserRouter>
      <UmamiProvider
        hostUrl={UMAMI_CONFIG.apiUrl}
        websiteId={UMAMI_CONFIG.websiteId}
        getCurrentUrl={() => window.location.pathname}
        domains={UMAMI_CONFIG.allowedDomains}
      >
        <PageTrackerRR />
        <Component {...pageProps} />
      </UmamiProvider>
    </BrowserRouter>
  );
};

const PageTrackerRR: FC<{}> = () => {
  const location = useLocation();
  return <PageTracker pageUrl={location.pathname} />;
};

export default App;
```

# API

# Contributing

PRs are welcome

Small note: If editing the README, please conform to the [standard-readme specification](https://github.com/RichardLitt/standard-readme).

# License

MIT License
