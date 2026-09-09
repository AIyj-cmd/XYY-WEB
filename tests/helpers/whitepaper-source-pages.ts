/**
 * Audited source layouts for whitepaper locator tests. Values were read from
 * the frozen PDFs with PyMuPDF; 1–5 use the separately audited 200dpi PNGs.
 */
export type SourcePageLayout = {
  sha256: string
  pageCount: number
  unit: 'ocr-pixels-200dpi' | 'pdf-points'
  width: number
  height: number
  pageHeights?: Readonly<Record<number, number>>
}

export const WHITEPAPER_SOURCE_LAYOUTS: Record<string, SourcePageLayout> = {
  '1': {
    sha256: '01fa9fd6f5e7a68f93e36816ba6b3b1110820909cf73fc57b9dc44479bc39776',
    pageCount: 9,
    unit: 'ocr-pixels-200dpi',
    width: 1653,
    height: 2339,
  },
  '2': {
    sha256: 'bd38fe91e2b5e17a0fd8e7989aeeacb60de7d35ab59442e1b4c046fe4cf48dee',
    pageCount: 9,
    unit: 'ocr-pixels-200dpi',
    width: 1653,
    height: 2339,
  },
  '3': {
    sha256: 'df2c5103fd38b2976e6ead8244300406057e2cb5257322bd090df383b19bfe71',
    pageCount: 8,
    unit: 'ocr-pixels-200dpi',
    width: 1653,
    height: 2339,
  },
  '4': {
    sha256: '9d0126c2bf488d969158d5d6b17f1342f0d92956c3ea41a10b71ef545870743b',
    pageCount: 9,
    unit: 'ocr-pixels-200dpi',
    width: 1653,
    height: 2339,
  },
  '5': {
    sha256: '13ba9d5144b595d61e0fe0f46a0681676f51b1387646a77cb036a587a44ecfbb',
    pageCount: 8,
    unit: 'ocr-pixels-200dpi',
    width: 1653,
    height: 2339,
  },
  '6': {
    sha256: 'bdf6805aff119935f5e2edc02dd3a06b08184829f1975ac189495cdd55e731f8',
    pageCount: 16,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
  },
  '7': {
    sha256: '98282c20ff7010dd27733488c34e51eb22461d243051c74cf0bbddc2ab509b46',
    pageCount: 16,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
  },
  '8': {
    sha256: '67ded53fb5e60d2c7ee44ae292655f766756b7cabb7c897ec5e1160befaafdc1',
    pageCount: 16,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
  },
  '9': {
    sha256: '0d5d45e9295fd7ffb01b43209fb01dfb63ae11c7a344d12259c735d91875f68e',
    pageCount: 16,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
  },
  '10': {
    sha256: 'fec6e2be8c141ff9d6f2bd5ef9a36901385d5e30006c477d25bab2416fae6013',
    pageCount: 10,
    unit: 'pdf-points',
    width: 594.96,
    height: 841.92,
  },
  '11': {
    sha256: '689ebaa0683574a759acc2e0adb59a2d67ae429242cf6c5daf421fffb8444f21',
    pageCount: 16,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
  },
  '12': {
    sha256: 'dc5ccb52c536e4a53b2ce34316e8b0df5c2e9b49c88626a900fb3f5a1bf81daf',
    pageCount: 18,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
  },
  '13': {
    sha256: 'fa452dc8058e6ecd3937b9dd1bea61c6e4089f74918a61b7c22d2b09e2976bcf',
    pageCount: 16,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
  },
  '14': {
    sha256: '3db4a91dcae7e51fb2e7b1f02435c9ee25cb3bb16db4883c62e6cbb1f020603d',
    pageCount: 20,
    unit: 'pdf-points',
    width: 1207.56,
    height: 824.88,
    pageHeights: { 11: 825.1 },
  },
}
