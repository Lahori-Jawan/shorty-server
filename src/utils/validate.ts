import { Types } from 'mongoose'

const { ObjectId } = Types

export default function hasValidFields(obj: {}, fields: string[] ) {
  const keys = Object.keys(obj)
  return fields.every(field => keys.includes(field) && obj[field].length)
}

export function isValidId(id: string) {
  return ObjectId.isValid(id)
}
