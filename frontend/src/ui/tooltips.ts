import {css} from "styled-components";
import {THEME} from "./theme";

export const cssTooltips = css`
  .popup-content {
    margin: auto;
    background: ${THEME.colors.shade};
    width: 50%;
    padding: 5px;
  }
  .popup-arrow {
    color: ${THEME.colors.shade};
  }
  [role='tooltip'].popup-content {
    width: auto;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 0px 1px;
  }
  [role='tooltip'].chatOptions-content {
    width: 200px;
  }

  .popup-overlay {
    background: rgba(0, 0, 0, 0.5);
  }
  [data-popup='tooltip'].popup-overlay {
    background: transparent;
  }
`
