# Virtual Venue Prototype

## Overview

This is a prototype for a game-like virtual event venue. Features include:

* Game-like interactive 3D environment with a fixed-camera perspective
* Simple navigation controls
* Public, invite-only, or password-protected events
* Configurable rooms, stages, signs, and private channels
* Support for animated avatars
* High-quality 3D stereo spatial audio using High Fidelity
* Inline world editor with configurable 3D assets
* Embedded video screens from YouTube, Twitch, Vimeo, etc
* Global chat and character emotes
* User roles and moderation tools
* Web Monetization payment pointers for streaming payments to event creators
* Integration with Stripe for subscription billing

This work was made possible by [Grant for the Web](https://www.grantfortheweb.org/), a fund to support innovation around open standards for Web Monetization. We're extremely grateful to them for their support.

## Technology

The frontend was built with [React Three Fiber](https://github.com/pmndrs/react-three-fiber), a React renderer for Three.js, and uses other Poimandres projects including Drei, Zustand, React Spring, and Cannon.

The audio is provided by [High Fidelity](https://www.highfidelity.com/), a commercial API for delivering high-quality spatial audio. A High Fidelity Pro account is required for audio.

The backend uses Firebase extensively: Cloud Firestore, Realtime Database, Authentication, Hosting, and Cloud Storage, as well as Google Cloud. Stripe processes payments.

## Authors

This code was made by Skittish LLC, with development led by Simon Hales and contributions by Andy Baio. 3D models were made by Joi Fulton.

## Disclaimer

Third-party copyrighted assets like the 3D models used for avatars and scenery were removed from this repository. References to the trademarked name "Skittish" were also removed.

This code is distributed on an "as-is" basis without support.

## License

Copyright 2021 Skittish LLC, https://skittish.com/

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.