import React, {useMemo} from "react"
import {format} from "date-format-parse";

export const FormatDate: React.FC<{
    date?: number,
}> = ({date}) => {

    const formatted = useMemo(() => {
        if (!date) return ''
        return format(new Date(date), 'YYYY-MM-DD')
    }, [date])

    return (
        <>
            {formatted}
        </>
    )
}
