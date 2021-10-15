/* eslint-disable no-restricted-globals */
import {physicsWorkerHandler} from "react-three-game-engine";

// because of some weird react/dev/webpack/something quirk
self.$RefreshReg$ = () => {};
self.$RefreshSig$ = () => () => {};

physicsWorkerHandler(self)