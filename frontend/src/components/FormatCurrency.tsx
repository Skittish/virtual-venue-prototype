import React, {useMemo} from "react"

export const FormatCurrency: React.FC<{
    amount?: number
}> = ({amount}) => {

    const formatted = useMemo(() => {
        if (!amount) return ''
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }, [amount])

    return (
        <>
            {formatted}
        </>
    )
}
