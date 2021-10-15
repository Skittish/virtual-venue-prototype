import React, {ErrorInfo} from "react"
import * as Sentry from "@sentry/react";

interface Props {
    fallback: any,
}

export class ErrorBoundary extends React.Component<Props, any> {
    constructor(props: Props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error: any) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        Sentry.captureException(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? null;
        }
        return this.props.children;
    }
}
