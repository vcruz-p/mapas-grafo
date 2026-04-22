export interface Person {
  id: string
  name: string
  photo: string
  data: Record<string, unknown>
}

export interface RelationLink {
  source: string
  target: string
  label: string
}