import { createGlobalStyle } from "styled-components"
import reset from "styled-reset"
import {cssModal} from "./modal";
import {COLORS} from "./colors";
import {cssTooltips} from "./tooltips";

export const EventGlobalStyle = createGlobalStyle`
  
  body {
    overscroll-behavior: contain;
  }
  
  #root,
  canvas {
    user-select: none;
    width: 100%;
    height: 100%;
  }
  
`

export const GlobalStyle = createGlobalStyle`
  ${reset}
  ${cssTooltips};

  * {
    box-sizing: border-box;
  }

  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
    background: ${COLORS.green};
    color: #fff;
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
  }

  body {
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  strong {
    font-weight: 800;
  }
  
  ${cssModal};
  
`
