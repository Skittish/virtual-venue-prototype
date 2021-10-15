import classnames from "classnames";
import React from "react"
import ReactModal from 'react-modal';
import {MODAL_CLASSNAMES} from "../ui/modal";

ReactModal.setAppElement('#root')

const Modal: React.FC<ReactModal.Props & {
    background?: boolean,
    thinner?: boolean,
    wider?: boolean,
    extraWide?: boolean,
}> = ({background = true, thinner, wider, extraWide, ...props}) => {
    return (
        <ReactModal
            className={classnames(MODAL_CLASSNAMES.modal, {
                [MODAL_CLASSNAMES.modalWithBackground]: background,
                [MODAL_CLASSNAMES.modalThinner]: !!thinner,
                [MODAL_CLASSNAMES.modalWider]: !!wider,
                [MODAL_CLASSNAMES.modalExtraWide]: !!extraWide,
            })}
            overlayClassName={MODAL_CLASSNAMES.overlay} {...props}/>
    )
}

export default Modal
