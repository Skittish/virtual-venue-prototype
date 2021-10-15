import { google } from 'googleapis'

const SHEET_ID = ''

const getAuth = () => {

    return google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

}

const fetchSheet = (sheetId: string): Promise<any[][] | null | undefined> => {

    return new Promise(async (resolve, reject) => {

        const auth = await getAuth()

        const sheetsAPI = google.sheets({version: 'v4', auth: auth});

        sheetsAPI.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: sheetId,
            range: 'A1:Z1000',
        }, (err, sheetRes) => {
            if (err) {
                return reject(err)
            }
            if (!sheetRes) {
                return reject()
            }
            return resolve(sheetRes.data.values)
        });
    })

}

const getSheetApprovedEmailAddresses = async (sheetId: string): Promise<string[]> => {

    const sheet = await fetchSheet(sheetId)

    if (!sheet) {
        return Promise.reject()
    }

    let startingRow = 1
    let column = 0

    for (let i = 0, len = sheet.length; i < len; i++) {
        const row = sheet[i]
        const rowMapped = row.map(item => item.toLowerCase())
        if (rowMapped.includes('email')) {
            startingRow = i + 1
            column = rowMapped.indexOf('email')
            break
        }
    }

    const emails: string[] = []

    for (let i = startingRow, len = sheet.length; i < len; i++) {
        const row = sheet[i]
        const email = row[column]
        if (email) {
            emails.push(email as string)
        }
    }

    return emails

}

export const isEmailApprovedInSheet = async (email: string, sheetId: string) => {
    const emails = await getSheetApprovedEmailAddresses(sheetId)
    return emails.includes(email)
}

export const handleVerifyEmailIsApprovedInSheet = async (req: any, res: any) => {

    const email = req.query.email

    const sheetId = req.query.sheetId

    const approved = await isEmailApprovedInSheet(email, sheetId)

    res.send({
        approved,
    })

}

export const testSheet = async (req: any, res: any) => {

    getSheetApprovedEmailAddresses(SHEET_ID)
        .then((response) => {
            res.send(response)
        })
        .catch(error => {
            res.status(400).send(error)
        })


}
