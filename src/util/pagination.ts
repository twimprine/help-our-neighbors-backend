import { Base64 } from 'js-base64';

export const getNextToken = (lastEvaluatedKey: any): string | null => {
    if (lastEvaluatedKey) {
        return Base64.encode(JSON.stringify(lastEvaluatedKey))
    }
    return null
}

export const parseNextToken = (token: string) => {
    return JSON.parse(Base64.decode(token))
}
