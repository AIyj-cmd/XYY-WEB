declare module 'parse-srcset' {
  type SrcsetCandidate = { url: string; w?: number; h?: number; d?: number }

  export default function parseSrcset(input: string): SrcsetCandidate[]
}
