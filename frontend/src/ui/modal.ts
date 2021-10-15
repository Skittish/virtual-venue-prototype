import {css} from "styled-components";
import {styledModalBackground} from "../event/views/JoinView";
import {THEME} from "./theme";

export const MODAL_CLASSNAMES = {
    modal: 'modal',
    modalWithBackground: 'modalWithBackground',
    modalThinner: 'modalThinner',
    modalWider: 'modalWider',
    modalExtraWide: 'modalExtraWide',
    overlay: 'overlay',
}

export const cssModal = css`

    .${MODAL_CLASSNAMES.modal} {
      color: white;
    }

    .${MODAL_CLASSNAMES.modalWithBackground} {
      color: white;
      ${styledModalBackground};
    }

    .${MODAL_CLASSNAMES.modalThinner} {
      max-width: 320px;
    }

    .${MODAL_CLASSNAMES.modalWider} {
      max-width: 520px;
      position: relative;
    }

    .${MODAL_CLASSNAMES.modalExtraWide} {
      max-width: 920px;
      position: relative;
    }
  
    .${MODAL_CLASSNAMES.overlay} {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgb(132 187 91 / 85%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: ${THEME.zIndices.$10};
    }

`
